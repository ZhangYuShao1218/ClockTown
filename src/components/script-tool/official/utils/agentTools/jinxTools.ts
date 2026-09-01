import { tool } from 'ai';
import { z } from 'zod';
import { scriptStore } from '../../stores/ScriptStore';
import { isSameCharacter } from '../../data/utils/characterIdMapping';

const createTool = (def: any) => (tool as any)(def);

// ── H: Jinx Management ──

export const getJinxInfo = createTool({
  description: '获取某个角色的所有诅咒关系。',
  inputSchema: z.object({
    character_id: z.string().describe('角色ID'),
  }),
  execute: async ({ character_id }: any) => {
    const s = scriptStore.script;
    if (!s) return { error: 'No script loaded' };
    const c = s.all.find(ch => isSameCharacter(ch.id, character_id));
    if (!c) return { error: `Character not in script: ${character_id}` };
    const jinxData = s.jinx[c.name];
    if (!jinxData || Object.keys(jinxData).length === 0) return { character: c.name, jinx: [], message: 'No jinx relationships' };
    const entries = Object.entries(jinxData).map(([name, info]) => ({
      with: name,
      reason: info.reason?.slice(0, 120) ?? '',
      display: info.display,
    }));
    return { character: c.name, jinx: entries, count: entries.length };
  },
});

export const addCustomJinx = createTool({
  description:
    '添加自定义相克规则（诅咒关系）到当前剧本。对标 UI 中 CustomJinxDialog 或角色编辑对话框中的诅咒功能。' +
    '需要两个角色都在当前剧本中。',
  inputSchema: z.object({
    character_a_id: z.string().describe('第一个角色ID（紧凑英文格式）'),
    character_b_id: z.string().describe('第二个角色ID（紧凑英文格式）'),
    reason: z.string().describe('相克规则描述文本'),
  }),
  execute: async ({ character_a_id, character_b_id, reason }: any) => {
    const s = scriptStore.script;
    if (!s) return { error: 'No script loaded' };
    const charA = s.all.find(ch => isSameCharacter(ch.id, character_a_id));
    if (!charA) return { error: `Character not in script: ${character_a_id}` };
    const charB = s.all.find(ch => isSameCharacter(ch.id, character_b_id));
    if (!charB) return { error: `Character not in script: ${character_b_id}` };
    if (isSameCharacter(character_a_id, character_b_id)) return { error: 'Cannot create a jinx between a character and itself' };
    if (!reason.trim()) return { error: 'Jinx reason cannot be empty' };

    scriptStore.addCustomJinx(charA, charB, reason.trim());
    return {
      added: `${charA.name} ↔ ${charB.name}`,
      reason: reason.trim(),
      message: `Custom jinx added between ${charA.name} and ${charB.name}`,
    };
  },
});

export const removeCustomJinx = createTool({
  description: '删除自定义相克规则。只能删除非官方的相克（isOfficial=false）。',
  inputSchema: z.object({
    character_a_id: z.string().describe('第一个角色ID'),
    character_b_id: z.string().describe('第二个角色ID'),
  }),
  execute: async ({ character_a_id, character_b_id }: any) => {
    const s = scriptStore.script;
    if (!s) return { error: 'No script loaded' };
    const charA = s.all.find(ch => isSameCharacter(ch.id, character_a_id));
    if (!charA) return { error: `Character not in script: ${character_a_id}` };
    const charB = s.all.find(ch => isSameCharacter(ch.id, character_b_id));
    if (!charB) return { error: `Character not in script: ${character_b_id}` };

    scriptStore.removeCustomJinx(charA, charB);
    return {
      removed: `${charA.name} ↔ ${charB.name}`,
      message: `Custom jinx removed between ${charA.name} and ${charB.name}`,
    };
  },
});

export const updateJinx = createTool({
  description:
    '修改相克规则的显示状态（是否在剧本展示中显示）或描述文本。' +
    '官方和自定义相克均可修改 display，自定义相克还可修改 reason。',
  inputSchema: z.object({
    character_a_id: z.string().describe('第一个角色ID'),
    character_b_id: z.string().describe('第二个角色ID'),
    display: z.boolean().optional().describe('是否在剧本中显示此相克规则'),
    reason: z.string().optional().describe('新的相克描述（仅对自定义相克有效）'),
  }),
  execute: async ({ character_a_id, character_b_id, display, reason }: any) => {
    const s = scriptStore.script;
    if (!s) return { error: 'No script loaded' };
    const charA = s.all.find(ch => isSameCharacter(ch.id, character_a_id));
    if (!charA) return { error: `Character not in script: ${character_a_id}` };
    const charB = s.all.find(ch => isSameCharacter(ch.id, character_b_id));
    if (!charB) return { error: `Character not in script: ${character_b_id}` };

    const changes: Record<string, unknown> = {};
    if (display !== undefined) {
      (scriptStore as any).setJinxDisplay?.(charA, charB, display);
      changes.display = display;
    }
    if (reason !== undefined) {
      const ok = (scriptStore as any).updateCustomJinxReason?.(charA, charB, reason.trim());
      if (ok === false) return { error: 'Cannot change reason of an official jinx (only custom jinxes allow editing reason)' };
      changes.reason = reason.trim();
    }

    if (Object.keys(changes).length === 0) return { error: 'No updates provided' };
    return {
      updated: `${charA.name} ↔ ${charB.name}`,
      changes,
      message: `Jinx updated between ${charA.name} and ${charB.name}`,
    };
  },
});

export const listJinx = createTool({
  description: '列出当前剧本中所有的相克规则（包括官方和自定义，以及显示/隐藏状态）。',
  inputSchema: z.object({}),
  execute: async () => {
    const s = scriptStore.script;
    if (!s) return { error: 'No script loaded' };
    const allJinxes: Array<{
      char1: string;
      char2: string;
      reason: string;
      display: boolean;
      isOfficial: boolean;
    }> = [];
    const seen = new Set<string>();

    for (const [charName, targets] of Object.entries(s.jinx)) {
      for (const [targetName, info] of Object.entries(targets)) {
        const pairKey = [charName, targetName].sort().join('|');
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);
        allJinxes.push({
          char1: charName,
          char2: targetName,
          reason: info.reason ?? '',
          display: info.display ?? true,
          isOfficial: info.isOfficial ?? true,
        });
      }
    }

    return {
      count: allJinxes.length,
      displayedCount: allJinxes.filter(j => j.display).length,
      jinxes: allJinxes,
    };
  },
});
