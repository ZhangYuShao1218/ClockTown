---
name: expand_script
description: 標準作業流程：從 gstonegames (clocktower.gstonegames.com) 抓取並完美擴充血染鐘樓劇本至本專案。當使用者要求「擴充劇本」「加入某劇本」「匯入官方/縫合/原創劇本」時使用。
---

# Expand Script — 擴充劇本 SOP

> **單一真相來源**：完整、逐步的 SOP 維護在
> [`.agents/skills/expand_script/SKILL.md`](../../../.agents/skills/expand_script/SKILL.md)
> （與 Antigravity 共用）。**執行前務必先讀取該檔案完整內容並嚴格遵守。**

## 摘要（細節仍以上述檔案為準）

1. **抓劇本 meta**：POST `https://clocktower.gstonegames.com/ct/grimoire_edition_list/`
   （`tab=1/2/3`, `page=X`），記錄 `name` / `desc` / `json` / `image`。
2. **抓全域角色庫**：GET `https://clocktower.gstonegames.com/data/roles.json`。
   🌟 `firstNight` / `otherNight` **必須**取自這份的全域整數權重，**嚴禁**用單一劇本陣列的 index。
3. **下載資源**：劇本 icon → `public/drama/Drama_{script_id}.png`；
   新角色 icon → `public/character/character_{role_id}_{team}.png`（副檔名一律 `.png`）。
4. **簡轉繁 + 重構**：用 opencc 類工具轉繁體；新角色物件嚴格符合 `src/data/types.ts` 的 `Role` 介面。
   帶連字號的 key 要加引號並用 `AllRoles['pit-hag']` 括號語法。
5. **註冊劇本**：建 `src/data/scripts/{script_id}.ts`（匯出 `Script`），
   在 `src/data/scripts/index.ts` 加入 `AllScripts`。
   **不要**手動把 `minion_info` / `demon_info` 塞進 `roles` 陣列（前端已寫死全域權重 2000 / 3000）。
6. **驗證**：`npx tsc --noEmit` 或 `npm run build`。
