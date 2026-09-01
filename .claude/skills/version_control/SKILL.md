---
name: version_control
description: "🛑 執行任何 git 指令（commit / checkout / push / merge / 還原）前必讀。內含強制的分支策略、Conventional Commits 規範，以及「提交計畫預覽 → 等待使用者確認」的強制流程。"
---

# Version Control — 版本控制流程

> **單一真相來源**：完整流程維護在
> [`.agents/skills/version_control/SKILL.md`](../../../.agents/skills/version_control/SKILL.md)
> （與 Antigravity 共用）。**動 git 前務必先讀取該檔案完整內容。**

## 不可略過的重點

- **分支策略**：`main`(正式，🚫 禁止直 push) ← `Dev`/`develop`(開發整合) ← `feature/<name>` / `hotfix/<name>`。
  小修復可直接在 `Dev`；大功能從 `Dev` 開 `feature/`；線上緊急 bug 從 `main` 開 `hotfix/`。
- **Conventional Commits**：`<type>(<scope>): <描述>`，type 見 `feat|fix|style|refactor|perf|test|docs|chore|ci|revert`。
- **⚠️ 強制流程**：在任何 `git add` / `git commit` 之前，必須先向使用者呈現
  **提交計畫預覽表格**（# / Type / Commit 訊息 / 包含檔案 / 變更細節），
  然後**停下來等待使用者明確回覆**（「確認」「執行」「OK」）。未獲確認前禁止執行任何 git 指令。
- **Commit 階段不含 push**；所有 commit 完成後才一次 `git push origin <branch>`。
- 提交前確認 `.env*` / 金鑰未被納入，無遺留 `console.log`。
- Windows：若 `git` 不在 PATH，改用 `& "C:\Program Files\Git\bin\git.exe"`。
