---
name: "Project Map / 專案結構地圖"
description: "NewClockTown（血染鐘樓魔典工具）的目錄結構、資料流、資料模型與地雷區。修改任何檔案前先讀這份。"
trigger: "always_on"
---

# NewClockTown 專案地圖

> 血染鐘樓 (Blood on the Clocktower) 線上魔典 / 說書人輔助工具。
> 這份文件是「地圖」，不是完整規格；檔案路徑以此為準，細節仍以原始碼為準。

## 技術棧

- **React 19 + TypeScript + Vite 8**，`type: module`
- **Tailwind CSS v4**：透過 `@tailwindcss/vite` 外掛，**沒有 `tailwind.config`**，CSS 變數寫在 `src/index.css`
- **Firebase Realtime Database**：即時房間同步 + 匿名登入
- **Supabase**（`@supabase/supabase-js`）、**Vercel AI SDK**（`ai` + `@ai-sdk/anthropic|openai|deepseek`）：劇本工具的 AI 生成
- 劇本工具子模組另用 **MUI v6 + Emotion + MobX**（與主專案的 Tailwind 世界隔離）
- 動畫 `framer-motion`、拖曳 `@dnd-kit`、流程圖 `@xyflow/react`
- Lint：`oxlint`（設定見 `.oxlintrc.json`）

## 指令

| 指令 | 作用 |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build`（型別錯誤會擋建置） |
| `npm run lint` | `oxlint` |
| `npm run preview` | 預覽 build 結果 |

驗證改動請跑 `npx tsc -b` 或 `npm run build`。

## 進入點與路由

`src/main.tsx` → `src/App.tsx`（`BrowserRouter`）

| 路徑 | 元件 | 說明 |
|---|---|---|
| `/` | `src/components/layout/Lobby.tsx` | 大廳：建立 / 加入房間 |
| `/room/:id` | `src/components/game/Room.tsx` | 遊戲房主畫面 |
| `/script-tool` | `src/components/script-tool/ScriptTool.tsx` | 劇本製作工具（包 `official/App.tsx` 於 `I18nProvider`） |
| `/replay/:id` | `src/components/replay/ReplayViewer.tsx` | 遊戲覆盤 |

## 目錄結構（`src/`）

```
components/
  layout/Lobby.tsx
  game/            遊戲房 UI（~14 檔）：Room, CenterStage, Grimoire, Chat,
                   NightOrderModal, VotingOverlay, GameTimelineLogger,
                   RoleSelectionModal, ScriptSelectionModal, *Modal…
  common/          Modal, AlertDialog, RoleIcon, RoleTooltip
  replay/ReplayViewer.tsx
  storyteller/     （目前空）
  script-tool/
    ScriptTool.tsx           自製外殼
    *.tsx / jinxData.ts      自製的劇本編輯 Modal（CustomRoleModal, JinxEditor,
                             NightOrderEditor, RolePicker, ScriptPreviewSheet…）
    knowledge/botc/          ⚠️ BOTC「遊戲規則」RAG 知識庫，非程式碼文件
    official/                ⚠️ 鏡像整合的開源劇本工具（見下方「地雷區」）
data/
  types.ts         Role, Script, SeatStatus, VotingState 介面
  roles/           townsfolk/outsiders/minions/demons/travelers.ts + new_roles.ts
                   index.ts → export AllRoles: Record<string, Role>
  scripts/         每個劇本一檔 + index.ts → export AllScripts: Record<string, Script>
hooks/
  useAuth.ts       Firebase 匿名登入 + onAuthStateChanged（含 cleanup）
  useGameState.ts  訂閱 rooms/{id} 的 onValue（含 cleanup）※ gameState 目前型別為 any
services/
  firebase.ts      初始化 app / auth / db，loginAnonymously()
  roomService.ts   房間 CRUD（createRoom, joinRoom, …）
  replayService.ts 覆盤事件（GameReplay, ReplayEvent, BoardSnapshot）
lib/
  utils.ts         cn()
  localData.ts     localStorage（座位筆記、房間歷史，key 前綴 botc_）
  testUtils.ts
```

## Firebase RTDB 資料模型

```
rooms/{roomId}
  public/   status(lobby|playing|finished), phase, hostId, scriptId,
            customScript, seatCount, distribution:[T,O,M,D], createdAt
  players/{uid}/   name, isHost, isAlive, hasGhostVote, isOnline, seat
  private/
    {uid}/role          "storyteller" | …
    grimoire/{seatIdx}/  { roleId }
    bluffs/              [ , , ]  (3 個惡魔偽裝)
```

覆盤資料另存他處，結構見 `replayService.ts`。

## 擴充劇本

從 gstonegames 抓取並整合新劇本，請走 `.agents/skills/expand_script/SKILL.md` 的 SOP。
核心：`firstNight` / `otherNight` 權重必須取自全域 `roles.json` 整數，不可用陣列 index。

## Git

- 分支：`main`(正式，禁止直 push) / `Dev`(開發整合，目前所在) / `Pro`
- Remote：`https://github.com/ZhangYuShao1218/ClockTown.git`
- 提交流程與 commit 規範見 `.agents/skills/version_control/SKILL.md`（動 git 前必讀）

## 地雷區 / 已知不一致

1. **`components/script-tool/official/` 是 vendored（鏡像整合的開源工具）**：自有 MUI/MobX 生態、i18n、`stores/*.ts`。改動時盡量小範圍、貼近上游風格，別把主專案的 Tailwind/shadcn 慣例套進去。
2. **`components.json` 指向 `@/components/ui`，但該資料夾目前不存在**：ui-design rule 說「shadcn first」，實務上尚無 shadcn 元件庫；需要時要先建立。
3. **`useGameState` 的 `gameState` 是 `any`**：違反 architecture rule 的「嚴禁 any」，屬既有債，碰到再視情況補型別。
4. **繁體中文保證**：劇本工具有 `official/utils/traditionalChinese.ts`，簡轉繁相關改動走它。
5. `dist/` 有被 `.gitignore` 但工作區存在；`scratch/`、`temp.txt` 為暫存物。
