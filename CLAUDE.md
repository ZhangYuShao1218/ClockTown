# NewClockTown — Claude Code 指引

> 血染鐘樓 (Blood on the Clocktower) 線上魔典 / 說書人輔助工具。
> React 19 + TypeScript + Vite 8 / Firebase RTDB / Supabase + AI SDK。

本專案與 **Antigravity** 共用同一份規範原文，全部放在 `.agents/`。
以下用 `@` 匯入，Claude Code 與 Antigravity 各自讀取同一份檔案，**單一真相來源、不重複維護**。

## 專案結構（先讀這份再改任何檔案）

@.agents/rules/project-map.md

## 常駐規範（always-on rules）

@.agents/rules/architecture.md
@.agents/rules/firebase.md
@.agents/rules/git-workflow.md
@.agents/rules/ui-design.md

## Skills（依需求觸發，完整內容在 `.agents/skills/`）

- **擴充劇本**：使用者要求從 gstonegames 抓取/整合新劇本時 → 先讀
  `.agents/skills/expand_script/SKILL.md` 並嚴格照 SOP 執行。
  （`.claude/skills/expand_script/` 為對應的 Claude Code 觸發入口，內容指向同一份 SOP。）
- **版本控制**：執行任何 git 指令（commit / checkout / push / merge）前 → 先讀
  `.agents/skills/version_control/SKILL.md`，並完成「提交計畫預覽」等待使用者確認後才動手。
  （對應入口：`.claude/skills/version_control/`。）

## 快速備忘

- 驗證改動：`npx tsc -b` 或 `npm run build`；lint：`npm run lint`（oxlint）
- 路徑別名 `@` → `src/`
- 目前分支 `Dev`；`main` 禁止直接 push
- `.env.local`（`VITE_FIREBASE_*` 等）嚴禁提交
- `src/components/script-tool/official/` 是鏡像整合的開源工具，改動要小心、貼近上游
