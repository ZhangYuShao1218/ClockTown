import { tool } from 'ai';
import { z } from 'zod';
import { configStore } from '../../stores/ConfigStore';
import { uiConfigStore } from '../../stores/UIConfigStore';
import { searchKnowledge, getKnowledgeTopic } from '../agentKnowledge';

const createTool = (def: any) => (tool as any)(def);

// ── B: Config & UI ──

export const getConfig = createTool({
  description: '获取当前应用配置（语言、ID解析模式、诅咒显示设置）。',
  inputSchema: z.object({}),
  execute: async () => ({
    language: configStore.language,
    officialIdParseMode: configStore.config.officialIdParseMode,
    hideDuplicateJinx: configStore.config.hideDuplicateJinx,
  }),
});

export const setConfig = createTool({
  description: '修改应用配置。',
  inputSchema: z.object({
    language: z.enum(['cn', 'en', 'es']).optional().describe('语言'),
    officialIdParseMode: z.boolean().optional().describe('官方ID解析模式'),
    hideDuplicateJinx: z.boolean().optional().describe('隐藏重复诅咒文本'),
  }),
  execute: async (updates: any) => {
    const changes: string[] = [];
    if (updates.language) { configStore.setLanguage(updates.language); changes.push(`language → ${updates.language}`); }
    if (updates.officialIdParseMode !== undefined) { configStore.setOfficialIdParseMode(updates.officialIdParseMode); changes.push(`officialIdParseMode → ${updates.officialIdParseMode}`); }
    if (updates.hideDuplicateJinx !== undefined) { configStore.setHideDuplicateJinx(updates.hideDuplicateJinx); changes.push(`hideDuplicateJinx → ${updates.hideDuplicateJinx}`); }
    return { changed: changes, message: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'No changes' };
  },
});

export const getUiConfig = createTool({
  description: '获取UI配置。可指定 section 来获取特定部分：backgrounds/fonts/card/theme。',
  inputSchema: z.object({
    section: z.string().optional().describe('配置部分：backgrounds, fonts, card, theme。不指定则返回摘要。'),
  }),
  execute: async ({ section }: any) => {
    const cfg = uiConfigStore.config;
    if (section === 'backgrounds') {
      return {
        mainBackground: cfg.mainBackground,
        mainBackgroundMode: cfg.mainBackgroundMode,
        nightOrderBackground: cfg.nightOrderBackground,
        nightOrderBackgroundMode: cfg.nightOrderBackgroundMode,
      };
    }
    if (section === 'fonts') return { fonts: cfg.fonts };
    if (section === 'card') return { characterCard: cfg.characterCard };
    if (section === 'theme') return { theme: cfg.theme, cornerFlower: cfg.cornerFlower, enableTwoPageMode: cfg.enableTwoPageMode };
    return {
      theme: cfg.theme,
      mainBackground: cfg.mainBackground,
      nightOrderBackground: cfg.nightOrderBackground,
      enableTwoPageMode: cfg.enableTwoPageMode,
      languages: { cn: '中文', en: 'English', es: 'Español' },
    };
  },
});

export const setUiConfig = createTool({
  description: '修改UI配置的某个部分（背景/卡片/主题/字体）。',
  inputSchema: z.object({
    section: z.enum(['backgrounds', 'card', 'theme', 'fonts']).describe('配置部分：backgrounds=背景, card=角色卡片, theme=主题, fonts=字体'),
    updates: z.record(z.string(), z.unknown()).describe('要更新的键值对。fonts支持: scriptTitle/teamDivider/characterName/characterAbility/jinxText/specialRuleTitle/specialRuleContent/stateRuleTitle/stateRuleContent'),
  }),
  execute: async ({ section, updates }: any) => {
    if (section === 'theme') {
      const partial: Record<string, unknown> = {};
      if (updates.theme) partial.theme = updates.theme;
      if (updates.cornerFlower) partial.cornerFlower = updates.cornerFlower;
      if (updates.enableTwoPageMode !== undefined) {
        const v = updates.enableTwoPageMode;
        partial.enableTwoPageMode = v === 'true' || v === true;
      }
      uiConfigStore.updateConfig(partial as never);
      return { updated: Object.keys(partial) };
    }
    if (section === 'card') {
      const cardUpdates: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(updates)) {
        const num = Number(v);
        cardUpdates[k] = isNaN(num) ? v : num;
      }
      uiConfigStore.updateCharacterCardConfig(cardUpdates as never);
      return { updated: Object.keys(cardUpdates) };
    }
    if (section === 'backgrounds') {
      const bg: Record<string, unknown> = {};
      if (updates.mainBackground) bg.mainBackground = updates.mainBackground;
      if (updates.nightOrderBackground) bg.nightOrderBackground = updates.nightOrderBackground;
      if (updates.mainBackgroundMode) bg.mainBackgroundMode = updates.mainBackgroundMode;
      if (updates.nightOrderBackgroundMode) bg.nightOrderBackgroundMode = updates.nightOrderBackgroundMode;
      uiConfigStore.updateConfig(bg as never);
      return { updated: Object.keys(bg) };
    }
    if (section === 'fonts') {
      const fontUpdates: Record<string, string> = {};
      for (const [k, v] of Object.entries(updates)) {
        fontUpdates[k] = String(v);
      }
      (uiConfigStore as any).updateFontsConfig?.(fontUpdates) || (uiConfigStore as any).updateFontConfig?.(fontUpdates);
      return { updated: Object.keys(fontUpdates) };
    }
    return { error: `Unknown section: ${section}` };
  },
});

export const setTheme = createTool({
  description: '快速切换主题预设（如 standard, blood, midnight, forest 等）。',
  inputSchema: z.object({
    theme: z.string().describe('主题名称：standard, blood, midnight, forest, classic, purple, dark, ink, sunset'),
  }),
  execute: async ({ theme }: any) => {
    uiConfigStore.updateConfig({ theme: theme as never });
    return { theme, message: `Theme set to: ${theme}` };
  },
});

export const resetUiConfig = createTool({
  description: '重置UI配置为默认值。',
  inputSchema: z.object({}),
  execute: async () => {
    (uiConfigStore as any).resetConfig?.();
    return { message: 'UI config reset to default' };
  },
});

export const searchKnowledgeTool = createTool({
  description:
    '搜索血染钟楼百科知识库。支持按关键词搜索：' +
    '角色信息、协同组合、反制策略、相克规则（Jinx）、基础剧本、说书人指南、FAQ常见问题、游戏术语、机制等。' +
    '当用户询问剧本策略、角色搭配、规则疑问、相克原因等知识性问题时使用。',
  inputSchema: z.object({
    query: z.string().describe('搜索关键词（如 "红唇使者", "暗流涌动", "暴乱", "疯子", "主恶魔"）'),
  }),
  execute: async ({ query }: any) => {
    const results = await searchKnowledge(query);
    return { count: (results as any)?.length ?? 0, results };
  },
});

export const getKnowledgeTopicTool = createTool({
  description:
    '按主题获取知识库内容。可选主题：' +
    'roles (官方全部角色详细数据及协同/反制/FAQ), ' +
    'jinxes (官方全量相克规则及原因), ' +
    'scripts (官方三大剧本及实验剧本), ' +
    'storyteller (说书人核心指南及技巧), ' +
    'faq (核心规则FAQ及争议判例), ' +
    'glossary (游戏术语表)。',
  inputSchema: z.object({
    topic: z.enum(['roles', 'jinxes', 'scripts', 'storyteller', 'faq', 'glossary']).describe('知识库主题'),
  }),
  execute: async ({ topic }: any) => {
    const content = getKnowledgeTopic(topic);
    if (!content) return { error: `Topic not found: ${topic}` };
    return { topic, content };
  },
});
