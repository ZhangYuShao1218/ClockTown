---
name: expand_script
description: 標準作業流程：如何從 gstonegames 抓取並完美擴充血染鐘樓劇本至專案中
---

# Expand Script 擴充劇本標準作業流程 (SOP)

當使用者要求從 `https://clocktower.gstonegames.com/` 擴充一個新劇本（或一組劇本）時，請嚴格遵守以下步驟，以確保角色能力、夜晚順序權重、圖示與翻譯皆能完美整合至本專案架構中。

## 1. 抓取劇本元資料 (Script Meta)
發送 POST 請求至 `https://clocktower.gstonegames.com/ct/grimoire_edition_list/`。
* 參數：`tab=1` (官方), `tab=2` (縫合), `tab=3` (原創角色)，以及 `page=X`。
* 從回傳的 `data.items` 中尋找目標劇本。
* **必須紀錄的關鍵欄位**：
  * `name`: 劇本名稱
  * `desc`: 劇本說明 (須翻譯為繁體)
  * `json`: 該劇本專屬的角色清單 URL (例如 `.../ct_edition_1_87582.json`)
  * `image`: 劇本代表 Icon URL

## 2. 抓取全域角色資料庫 (Global Roles) 🌟 核心關鍵
**絕對不要使用單一劇本陣列中的 Index 來當作 `firstNight` 排序權重！**
發送 GET 請求至 `https://clocktower.gstonegames.com/data/roles.json`，取得全域角色清單。
* 這裡面包含了每一個角色的**絕對全域整數權重**（例如：洗婦為 7500，魔術師為 1100）。
* 只有使用這個全域整數，才能確保不同劇本、不同角色混搭時，依然能完美相容於 `NightOrderModal.tsx` 中 `minion_info (2000)` 與 `demon_info (3000)` 的順序。

## 3. 下載與處理資源 (Assets)
1. **劇本 Icon**：將步驟 1 取得的 `image` URL 下載，並儲存為 `public/drama/Drama_{script_id}.png`（無論原始格式是否為 jpg，檔名皆強制為 .png 以符合前端呼叫）。
2. **角色 Icon**：找出該劇本中，專案尚未擁有的新角色。下載他們的 `image` (或 `icon`) 欄位，並儲存為 `public/character/character_{role_id}_{team}.png`。

## 4. 翻譯與資料重構 (Translation & Formatting)
使用 `opencc-js` (或類似工具) 將抓取到的簡體中文轉換為繁體中文。
建立新的 TypeScript 檔案 (例如 `src/data/roles/new_roles.ts` 或對應的劇本檔)。
每個新角色的物件必須嚴格符合專案 `src/data/types.ts` 中的 `Role` 介面：
```typescript
{
  id: string; // 必須小寫，如 'washerwoman'
  name: string; // 繁體中文
  alignment: 'good' | 'evil';
  type: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled';
  ability: string; // 繁體中文
  abilityHTML: string; // 若有 HTML 標籤
  flavor: string; // 繁體中文
  firstNight: number; // 🌟 必須是從 roles.json 取出的全域整數，不得為空
  otherNight: number; // 🌟 必須是從 roles.json 取出的全域整數，不得為空
  firstNightReminder: string; // 繁體中文，說書人提示
  otherNightReminder: string; // 繁體中文，說書人提示
  icon: string; // 路徑必須是 '/character/character_{role_id}_{team}.png'
}
```
* **注意**：如果鍵值 (Key) 帶有連字號 (如 `pit-hag`)，在 TS 中宣告時必須加上引號 `"pit-hag": { ... }`。
* **注意**：引入角色時，如果是帶連字號的鍵值，必須使用括號語法 `AllRoles['pit-hag']` 而非點語法。

## 5. 註冊劇本 (Script Registration)
1. 建立 `src/data/scripts/{script_id}.ts`。
2. 匯出符合 `Script` 介面的物件，並將該劇本擁有的所有 `Role` 放入 `roles` 陣列中。
3. **千萬不要**手動把 `minion_info` 或 `demon_info` 加進劇本的 `roles` 陣列中，前端 `NightOrderModal.tsx` 已經寫死了自動渲染與全域權重(2000, 3000)的邏輯。
4. 到 `src/data/scripts/index.ts` 中，將新劇本 import 並加入 `AllScripts` 物件中，讓說書人面板能讀取到它。

## 6. 驗證 (Validation)
擴充完成後，請務必執行 `npx tsc --noEmit` 或 `npm run build`，確保沒有任何 TypeScript 語法錯誤（尤其是單引號閉合與陣列結尾逗號的問題）。
