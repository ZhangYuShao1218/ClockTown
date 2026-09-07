/**
 * 劇本圖片來源解析。
 * 內建劇本：用 public/drama/ 底下的靜態檔（檔名 = 劇本 id）。
 * 自訂劇本（上傳 JSON）：JSON `_meta.logo` 帶的外部 URL。
 */

interface ScriptLike {
  id?: string;
  logo?: string | null;
}

/** 劇本 logo（中央圖示 / 劇本按鈕 / 大廳）。 */
export const scriptLogoSrc = (script: ScriptLike | undefined): string =>
  script?.logo || `/drama/Drama_${script?.id ?? 'unknown'}.png`;

/** 圖片版劇本（角色資訊視窗的「圖片」）：內建用 Rule_ 卡表；自訂沒有卡表，退回 logo。 */
export const scriptSheetSrc = (script: ScriptLike | undefined): string =>
  script?.logo || `/drama/rules/Rule_${script?.id ?? 'unknown'}.png`;

/** 是否有圖片版可看（內建劇本一定有 Rule 檔；自訂劇本要有 logo 才有東西可顯示）。 */
export const hasScriptSheet = (script: ScriptLike | undefined): boolean =>
  !!script?.id && (script.id !== 'custom' || !!script.logo);
