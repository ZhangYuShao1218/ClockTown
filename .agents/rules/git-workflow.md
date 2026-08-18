---
name: "Git Workflow & Version Control"
description: "Rules for committing and pushing code to GitHub."
trigger: "always_on"
---

# Git 版控與提交流程 (Version Control Rules)

為了維持程式碼的安全性與開發歷史的清晰，開發過程中必須嚴格遵守以下 Git 版控規範：

1. **節點式提交 (Frequent & Logical Commits)**: 
   - 每完成一個 Phase 的核心目標（例如：大廳 UI 完成、Firebase 串接成功、拖曳功能實作），就必須進行一次 `git commit`。
   
2. **語意化提交訊息 (Conventional Commits)**:
   - Commit message 必須清晰說明改動內容。
   - 格式範例：
     - `feat: 新增大廳匿名登入功能`
     - `fix: 修正 Firebase 讀取時的 Memory Leak`
     - `style: 調整長桌 UI 佈局`
     - `docs: 更新 UI 藍圖與開發計畫`

3. **機密資料防護 (Security & Ignore)**:
   - **絕對禁止** 將 `.env.local` 或任何含有 Firebase 金鑰、API Key 的檔案推送到遠端儲存庫。
   - 提交前務必確認 `.gitignore` 有正確攔截 `*.local` 與 `node_modules/`。

4. **遠端同步 (Remote Sync)**:
   - 遠端儲存庫綁定於：`https://github.com/ZhangYuShao1218/ClockTown.git`
   - 本地開發完成並確認無誤後，請執行 `git push origin main` 將進度同步至遠端。
