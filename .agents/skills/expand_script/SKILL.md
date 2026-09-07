---
name: expand_script
description: 標準作業流程：如何從 gstonegames 抓取並完美擴充血染鐘樓劇本至專案中
---

# Expand Script 擴充劇本標準作業流程 (SOP)

當使用者要求從 `https://clocktower.gstonegames.com/` 擴充一個新劇本（或一組劇本）時，請嚴格遵守以下步驟，以確保角色能力、夜晚順序權重、圖示與翻譯皆能完美整合至本專案架構中。

## 1. 抓取劇本元資料 (Script Meta)
在**帶 cookie 的瀏覽器情境**發送 `POST https://clocktower.gstonegames.com/ct/grimoire_edition_list/`，
body 為 **JSON**：`{"tab":1|2|3,"name":"","order":1,"page":N,"limit":50}`
（`tab=1` 官方 / `tab=2` 縫合 / `tab=3` 原創角色）。
* 從回傳的 `data.items` 中尋找目標劇本。
* 若劇本不在集石（例：鐘樓劇本博物館 biligame 專屬），改從 biligame wiki 頁的「⬇ 劇本JSON」
  （`cdn.jsdelivr.net/gh/Roushelfy/botc-script-museum@main/docs/json/<opusId>.json`）取；
  夜晚順序**仍**照步驟 2 的集石全域整數（用角色的 `GstoneID` 對應）。見 memory `biligame-script-museum`。
* **必須紀錄的關鍵欄位**：
  * `name`: 劇本名稱
  * `desc`: 劇本說明 (須翻譯為繁體)
  * `json`: 該劇本專屬的角色清單 URL (例如 `.../ct_edition_1_87582.json`)
  * `image`: 劇本代表 Icon URL

## 2. 抓取全域角色資料庫 (Global Roles) 🌟 核心關鍵 — 夜晚順序規範

> **本專案唯一認可的夜晚順序來源＝集石 (gstonegames) 全域整數。** 詳見下方〈夜晚順序規範〉。

* 舊網址 `https://clocktower.gstonegames.com/data/roles.json` **已 404**，不要用。
* 正確做法：在**已登入的瀏覽器情境**（帶 cookie）以 `fetch(..., {credentials:'include'})` 發送
  `POST https://clocktower.gstonegames.com/ct/grimoireRoleJson/`，body 為 `{}`。
  回傳 `data.role[]`（約 205 個角色），每個含 `id` / `firstNight` / `otherNight`。
* 這些是**大數級距的絕對全域整數**（例：洗衣婦 fn 7500、投毒者 fn 4600、魔術師 fn 1100、失憶者 fn 200）。
  `firstNight`/`otherNight` 為 `0` 代表該夜不喚醒。
* **絕對不要**用單一劇本 JSON（`ct_edition_*.json` 或博物館 jsdelivr JSON）裡的 `firstNight`／`otherNight`
  ——那是該劇本的 local 排序，數字小、和全域不相容。
* **絕對不要**用 `src/components/script-tool/official/data/sources/roles.json`
  ——那是英文官方 (Pandemonium) 的 1–75 緊湊級距，與本專案採用的集石序不同（失憶者、牙噶巴卜、修行者等位置會錯）。

### 夜晚順序規範（權威）

1. 每個角色的 `firstNight` / `otherNight` **一律**取自 `grimoireRoleJson` 的 `data.role[]` 整數。
   博物館劇本（biligame）也一樣：用該劇本 JSON 每個角色的 `GstoneID` 去對應 `grimoireRoleJson`。
2. `NightOrderModal.tsx` 內兩個資訊環節已寫死，**不要**動、也**不要**放進劇本 `roles` 陣列：
   `MINION_INFO.firstNight = 1500`（介於 魔術師 1100 與 告密者 2100 之間）、
   `DEMON_INFO.firstNight = 2900`（介於 瘋子 2300 與 國王 3100 之間）。
3. 若某角色不在 `grimoireRoleJson`（極少數集石最新原創角色），**明確回報使用者**，
   暫時沿用專案內既有值或給合理估計，不要靜默塞 0 或亂數。
4. 參考：memory `night-order-source`、`gstonegames-api`。

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
  firstNight: number; // 🌟 從 grimoireRoleJson 取出的集石全域整數（見步驟 2）；不喚醒則省略或給 0
  otherNight: number; // 🌟 同上
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
3. **千萬不要**手動把 `minion_info` 或 `demon_info` 加進劇本的 `roles` 陣列中，前端 `NightOrderModal.tsx` 已寫死自動渲染（`MINION_INFO` fn 1500 / `DEMON_INFO` fn 2900，見步驟 2 的〈夜晚順序規範〉）。
4. 到 `src/data/scripts/index.ts` 中，將新劇本 import 並加入 `AllScripts` 物件中，讓說書人面板能讀取到它。

## 6. 驗證 (Validation)
擴充完成後，請務必執行 `npx tsc --noEmit` 或 `npm run build`，確保沒有任何 TypeScript 語法錯誤（尤其是單引號閉合與陣列結尾逗號的問題）。
