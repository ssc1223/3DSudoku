---
name: game-dev
description: 專門用於遊戲開發、測試與驗證的技能模組。
---

# Game Development Skill (遊戲開發技能)

此技能旨在協助開發者進行遊戲程式的開發、測試與驗證。適用於目前的 React + Three.js (React Three Fiber) 技術堆疊，但也適用於一般遊戲邏輯開發。

## 1. 開發 (Development)

在撰寫遊戲程式碼時，請遵循以下原則：

### 效能優化 (Performance First)
- **避免不必要的重繪 (Re-renders)**: 在 React 中，特別是與 Three.js 結合時，請將頻繁變動的狀態 (如動畫、計時器) 與 React 的 Reconciliation 循環分離，或使用 `useFrame` 進行直接操作 refs，而非依賴 state 更新。
- **物件池 (Object Pooling)**: 對於頻繁產生與銷毀的物件 (如特效粒子、子彈)，請使用物件池模式以減少 Garbage Collection。
- **資源管理**: 確保貼圖、模型等資源有正確載入與釋放 (Dispose)。

### 架構設計
- **邏輯與視圖分離**: 將核心遊戲邏輯 (如數獨規則、驗證算法) 抽離為純 TypeScript 函數或類別，不依賴 React 或 Three.js，以便於測試。
- **元件模組化**: 3D 物件 (如 `Cell3D`, `Board3D`) 應為獨立元件，透過 props 接收狀態。

## 2. 測試 (Testing)

### 單元測試 (Unit Testing)
- 針對純邏輯部分 (如 `gameLogic.ts`) 撰寫 Jest/Vitest 測試。
- 測試核心規則：
    - 數獨的填寫規則驗證 (行、列、宮)。
    - 遊戲勝利/失敗條件。
    - 狀態轉換 (Start -> Playing -> Paused -> End)。

### 整合測試 (Integration Testing)
- 測試 React Component 的渲染邏輯 (例如：選取 Cell時是否變色)。
- 驗證 User Input 是否正確觸發狀態改變。

## 3. 驗證 (Verification)

在完成功能開發後，請執行以下驗證清單：

### 視覺驗證 (Visual Verification)
- [ ] **渲染正確性**: 3D 模型是否破圖？材質是否正確載入？
- [ ] **動畫流暢度**: 動畫是否卡頓？過場是否滑順？
- [ ] **UI 響應**: 點擊是否有即時回饋？Hover 效果是否正常？
- [ ] **RWD/視窗調整**: 改變視窗大小時，Canvas 是否正確 Resize？

### 效能驗證 (Performance Verification)
- [ ] **FPS 監控**: 確保遊戲運行在穩定的幀率 (理想為 60 FPS)。
- [ ] **記憶體洩漏檢查**: 長時間遊玩後，記憶體用量是否穩定？

### 遊戲性驗證 (Gameplay Verification)
- [ ] **操作手感**: 旋轉視角、縮放、點選格子的操作是否直覺且無延遲？
- [ ] **邊際情況**: 快速點擊、同時按下多個按鍵是否會導致錯誤？

## 使用範例

當你被要求「實作一個新的計分功能」時：
1. 先定義計分邏輯的 Interface 與純函數。
2. 為計分函數撰寫單元測試。
3. 在 React Component 中整合，並使用 Refs 優化顯示效能 (避免每分每秒都用於 State 更新 UI)。
4. 執行上述驗證清單，確認沒影響到 FPS。
