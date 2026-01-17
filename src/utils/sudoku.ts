
export type Cell = number | null;
export type Board = Cell[][];

// 檢查數字是否可以放在指定位置
const isValid = (board: Board, row: number, col: number, num: number): boolean => {
    // 檢查列
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    // 檢查行
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    // 檢查 3x3 宮格
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
};

// 使用回溯法生成完整數獨
const solveSudoku = (board: Board): boolean => {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === null) {
                // 嘗試填入 1-9
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5); // 隨機順序以產生不同結果
                for (const num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = null; // 回溯
                    }
                }
                return false;
            }
        }
    }
    return true;
};

// 複製版面
const copyBoard = (board: Board): Board => {
    return board.map(row => [...row]);
};

// 生成一個新的數獨遊戲
export const generateSudoku = (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    // 1. 初始化空版面
    const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));

    // 2. 填滿版面
    solveSudoku(board);
    const solution = copyBoard(board);

    // 3. 挖洞 (移除數字)
    const attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;

    for (let i = 0; i < attempts; i++) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        while (board[row][col] === null) {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
        }
        board[row][col] = null;
        // 注意：嚴謹的數獨生成應該確保唯一解，這裡為了簡化暫先隨機挖洞
    }

    return { initialBoard: board, solution };
};

// 驗證整個版面是否已完成且正確
export const isBoardComplete = (board: Board, solution: Board): boolean => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== solution[i][j]) return false;
        }
    }
    return true;
};
