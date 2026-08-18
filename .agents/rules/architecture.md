---
name: "React Clean Architecture"
description: "React project structure and Clean Architecture best practices."
trigger: "always_on"
---

# React 架構與 Clean Architecture
- **分離關注點 (Separation of Concerns)**: 保持商業邏輯與 UI 獨立。絕不要將 Firebase 直接的讀寫邏輯寫在 UI Components 內。
- **使用 Custom Hooks**: 將複雜的商業邏輯和狀態管理封裝在 `src/hooks/` 資料夾內的 Custom Hooks 中（例如 `useGameState.ts`, `useAuth.ts`）。
- **服務層 (Service Layer)**: API 呼叫、Firebase 初始化與封裝應放置於 `src/services/` 中。
- **純函式元件 (Functional Components)**: 優先使用 Functional Components 與 Hooks，不使用 Class Components。
- **型別安全 (TypeScript)**: 所有 Props, State, 回傳值都必須有明確的 Interface 或 Type 宣告，嚴禁使用 `any`。
- **單一職責原則 (Single Responsibility Principle)**: 每個檔案或元件只做一件事，若元件過長應適度拆分。
