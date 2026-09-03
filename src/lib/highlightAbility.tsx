import React from 'react';

/**
 * 角色能力說明「重點字」系統（單一資料源）。
 * 提到清單中的關鍵字，就會依類別上色：
 *   red  — 負面 / 邪惡（中毒、死亡、失去能力…）
 *   blue — 正面 / 善良（保護、存活、鎮民…）
 *   gold — 機制 / 時機（每個夜晚、你要選擇、提名…）
 *
 * 遊戲端用 {@link highlightAbility}（回傳 React 節點，無 XSS 風險）。
 * 劇本工具端（HTML 流程）用 {@link highlightAbilityHtml}。
 */

export type KeywordKind = 'red' | 'blue' | 'gold';

const RED: string[] = [
  '死於處決', '被處決', '未正常生效', '失去能力', '不正常運作',
  '死亡', '處決', '中毒', '醉酒', '瘋狂', '落敗', '自殺', '殺死',
  '邪惡', '惡魔', '爪牙', '錯誤',
];

const BLUE: string[] = [
  '獲得能力', '起死回生', '恢復健康', '正確資訊',
  '保護', '存活', '善良', '鎮民', '外來者', '正確', '復活', '獲勝', '健康', '清醒',
];

const GOLD: string[] = [
  '每局遊戲限一次', '每局遊戲至少一次', '每個夜晚', '每個白天', '首個夜晚',
  '選擇', '得知',
  '提名', '投票', '相鄰', '鄰座', '鄰近', '玩家',
];

const KIND: Record<string, KeywordKind> = {};
for (const k of RED) KIND[k] = 'red';
for (const k of BLUE) KIND[k] = 'blue';
for (const k of GOLD) KIND[k] = 'gold';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 長詞優先，讓「死於處決」贏過「處決」
const KEYWORDS_BY_LEN = Object.keys(KIND).sort((a, b) => b.length - a.length);
const SPLIT_RE = new RegExp('(' + KEYWORDS_BY_LEN.map(escapeRegExp).join('|') + ')');
const GLOBAL_RE = new RegExp(SPLIT_RE.source, 'g');

/** 純文字 → React 節點陣列（關鍵字包上 <span class="botc-kw botc-kw-…">） */
export function highlightAbility(text?: string | null): React.ReactNode {
  if (!text) return text ?? null;
  return text.split(SPLIT_RE).map((part, i) =>
    KIND[part]
      ? <span key={i} className={`botc-kw botc-kw-${KIND[part]}`}>{part}</span>
      : part,
  );
}

const defaultWrap = (kw: string, kind: KeywordKind) =>
  `<span class="botc-kw botc-kw-${kind}">${kw}</span>`;

/**
 * HTML 片段 → 加上重點字（只處理標籤外的文字，不動屬性 / 既有標籤）。
 * 供劇本工具的 markdown → HTML 流程使用。
 * `wrap` 可自訂包裝方式（例如改用 inline style，因為 sanitizer 會移除 class）。
 */
export function highlightAbilityHtml(
  html: string,
  wrap: (kw: string, kind: KeywordKind) => string = defaultWrap,
): string {
  if (!html) return html;
  return html.replace(/(<[^>]*>)|([^<]+)/g, (_m, tag: string | undefined, textSeg: string | undefined) => {
    if (tag) return tag;
    return (textSeg || '').replace(GLOBAL_RE, (kw) => {
      const kind = KIND[kw];
      return kind ? wrap(kw, kind) : kw;
    });
  });
}
