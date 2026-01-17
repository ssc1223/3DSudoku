---
name: sudoku-dev
description: 專門用於數獨遊戲開發的技能模組，包含演算法、資料結構與最佳實踐指南。
---

# Sudoku Development Skill (數獨開發技能)

此技能旨在協助開發者撰寫數獨遊戲，涵蓋核心演算法、資料結構設計、難度系統與解題策略。

## 1. 核心資料結構

### Board 表示法
```typescript
// 基本型別
export type Cell = number | null;  // null 代表空格，1-9 代表數字
export type Board = Cell[][];      // 9x9 二維陣列

// 進階型別 (支援候選數)
export interface CellState {
  value: number | null;
  candidates: Set<number>;  // 候選數 1-9
  isFixed: boolean;         // 是否為題目給定的數字
}
export type AdvancedBoard = CellState[][];
```

### 座標系統
- **行 (Row)**: 0-8，由上至下
- **列 (Column)**: 0-8，由左至右
- **宮 (Box/Block)**: 3x3 區塊，編號 0-8 (由左至右、由上至下)
- **宮索引計算**: `boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3)`

## 2. 核心演算法

### 2.1 合法性檢查 (Validation)
檢查數字是否可放置於指定位置：
```typescript
const isValid = (board: Board, row: number, col: number, num: number): boolean => {
    // 檢查同一列 (Row)
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === num) return false;
    }
    // 檢查同一行 (Column)
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }
    // 檢查 3x3 宮格 (Box)
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[boxRow + r][boxCol + c] === num) return false;
        }
    }
    return true;
};
```

### 2.2 回溯法求解 (Backtracking)
最基本的數獨解法：
```typescript
const solve = (board: Board): boolean => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === null) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solve(board)) return true;
                        board[row][col] = null; // 回溯
                    }
                }
                return false; // 無解
            }
        }
    }
    return true; // 全部填完
};
```

### 2.3 題目生成 (Puzzle Generation)
1. **生成完整解答**: 先用回溯法產生一個隨機的完整數獨。
2. **挖洞**: 隨機移除數字，同時驗證唯一解。
```typescript
const generatePuzzle = (difficulty: number): { puzzle: Board; solution: Board } => {
    // 1. 產生完整解答
    const solution = createFilledBoard();
    const puzzle = deepCopy(solution);
    
    // 2. 根據難度決定挖洞數量
    const cellsToRemove = difficulty; // 30(簡單) ~ 55(困難)
    let removed = 0;
    
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== null) {
            const backup = puzzle[row][col];
            puzzle[row][col] = null;
            
            // 驗證是否仍有唯一解 (進階實作)
            if (countSolutions(deepCopy(puzzle)) !== 1) {
                puzzle[row][col] = backup; // 還原
            } else {
                removed++;
            }
        }
    }
    return { puzzle, solution };
};
```

### 2.4 唯一解驗證
確保題目只有一個解答：
```typescript
const countSolutions = (board: Board, limit = 2): number => {
    let count = 0;
    const backtrack = (): void => {
        if (count >= limit) return; // 提前終止
        
        const empty = findFirstEmpty(board);
        if (!empty) { count++; return; } // 找到一個解
        
        const [row, col] = empty;
        for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                backtrack();
                board[row][col] = null;
            }
        }
    };
    backtrack();
    return count;
};
```

## 3. 進階解題技巧 (Human-like Strategies)

用於實作提示系統或難度評估：

| 技巧名稱 | 難度 | 說明 |
|---------|------|------|
| **Naked Single** | 簡單 | 格子只剩一個候選數 |
| **Hidden Single** | 簡單 | 某數字在行/列/宮中只有一個可能位置 |
| **Naked Pair/Triple** | 中等 | 多格共享相同候選數，可排除其他格 |
| **Hidden Pair/Triple** | 中等 | 多個數字只出現在特定幾格 |
| **Pointing Pair** | 中等 | 宮內候選數指向同行/列 |
| **Box/Line Reduction** | 中等 | 行/列候選數限於同一宮 |
| **X-Wing** | 困難 | 兩行兩列形成矩形的候選數關係 |
| **Swordfish** | 困難 | X-Wing 的三行三列擴展 |

## 4. 難度評估系統

根據需要的解題技巧評估難度：
```typescript
interface DifficultyAnalysis {
    level: 'easy' | 'medium' | 'hard' | 'expert';
    score: number;          // 0-100
    techniquesNeeded: string[];
    estimatedTime: number;  // 分鐘
}

const analyzeDifficulty = (puzzle: Board): DifficultyAnalysis => {
    // 模擬人類解題過程，記錄使用的技巧
    // 根據最難技巧和使用次數評分
};
```

## 5. 最佳實踐

### 效能優化
- **位元運算**: 使用 bitmask 表示候選數 (0-511 代表 1-9 的組合)
- **約束傳播**: 填入數字時立即更新相關格子的候選數
- **Dancing Links (DLX)**: 對於超高效能需求，使用 Knuth 的 Algorithm X

### 使用者體驗
- **撤銷/重做**: 維護操作歷史堆疊
- **衝突高亮**: 即時標示違規的數字
- **候選數模式**: 讓玩家標記可能的數字
- **自動填充候選數**: 顯示每格可能的數字

### 存檔系統
```typescript
interface GameSave {
    puzzle: Board;           // 原始題目
    current: Board;          // 目前進度
    solution: Board;         // 解答
    notes: Set<number>[][];  // 候選數筆記
    history: Move[];         // 操作歷史
    timer: number;           // 遊戲時間 (秒)
    difficulty: string;      // 難度
}
```

## 6. 測試要點

### 單元測試案例
- [ ] `isValid`: 測試行/列/宮檢查的正確性
- [ ] `solve`: 測試能否解出已知題目
- [ ] `generatePuzzle`: 確認產生的題目有唯一解
- [ ] `countSolutions`: 驗證唯一解檢測

### 邊界案例
- 空白版面 (全部未填)
- 已填滿版面 (驗證是否正確)
- 無解版面 (偵測並回報)
- 多解版面 (應拒絕作為有效題目)

## 7. 工具函數

### 常用輔助函數
```typescript
// 取得行
const getRow = (board: Board, row: number): Cell[] => board[row];

// 取得列
const getColumn = (board: Board, col: number): Cell[] => 
    board.map(row => row[col]);

// 取得宮  
const getBox = (board: Board, boxIndex: number): Cell[] => {
    const startRow = Math.floor(boxIndex / 3) * 3;
    const startCol = (boxIndex % 3) * 3;
    const cells: Cell[] = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            cells.push(board[startRow + r][startCol + c]);
        }
    }
    return cells;
};

// 深拷貝版面
const copyBoard = (board: Board): Board => 
    board.map(row => [...row]);

// 版面轉字串 (用於除錯/序列化)
const boardToString = (board: Board): string =>
    board.map(row => row.map(c => c ?? '.').join('')).join('\n');
```

## 8. 使用範例

當你被要求實作數獨相關功能時：

1. **生成新題目**: 使用回溯法 + 挖洞，確保唯一解
2. **驗證玩家輸入**: 使用 `isValid` 檢查即時衝突
3. **提供提示**: 實作 Naked Single / Hidden Single 策略
4. **難度控制**: 根據技巧需求調整挖洞演算法
5. **存檔/讀檔**: 序列化 `GameSave` 物件

## 參考資源

- [Sudoku Solving Techniques](http://www.sudokuwiki.org/sudoku.htm)
- [Dancing Links (DLX)](https://en.wikipedia.org/wiki/Dancing_Links)
- [唯一解驗證演算法](https://www.sudokuoftheday.com/techniques)
