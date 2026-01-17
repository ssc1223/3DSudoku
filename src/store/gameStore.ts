
import { create } from 'zustand';
import { generateSudoku, Board, Cell } from '../utils/sudoku';

type Difficulty = 'easy' | 'medium' | 'hard';

export type PendingAction = {
    id: string;
    row: number;
    col: number;
    val: number | null; // null represents CLEAR
    isNote: boolean;
};

type GameState = {
    difficulty: Difficulty;
    initialBoard: Board;
    currentBoard: Board;
    solution: Board;
    notes: Record<string, number[]>;
    selectedCell: [number, number] | null;
    activeNumber: number | null;
    isNoteMode: boolean;
    history: Board[];
    pendingActions: PendingAction[];
    cameraResetTrigger: number; // Increment to trigger reset

    initGame: (difficulty?: Difficulty) => void;
    selectCell: (row: number, col: number) => void;
    setActiveNumber: (num: number | null) => void;
    toggleNoteMode: () => void;
    clearCell: () => void;
    undo: () => void;
    commitAction: (actionId: string) => void;
    resetCamera: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
    difficulty: 'medium',
    initialBoard: [],
    currentBoard: [],
    solution: [],
    notes: {},
    selectedCell: null,
    activeNumber: null,
    isNoteMode: false,
    history: [],
    pendingActions: [],
    cameraResetTrigger: 0,

    resetCamera: () => {
        set(state => ({ cameraResetTrigger: state.cameraResetTrigger + 1 }));
    },

    initGame: (difficulty = 'medium') => {
        const { initialBoard, solution } = generateSudoku(difficulty);
        const currentBoard = initialBoard.map(row => [...row]);

        set({
            difficulty,
            initialBoard,
            currentBoard,
            solution,
            notes: {},
            selectedCell: null,
            history: [],
            pendingActions: [],
            isNoteMode: false,
        });
    },

    selectCell: (row, col) => {
        const { activeNumber, isNoteMode, initialBoard } = get();

        set({ selectedCell: [row, col] });

        if (activeNumber !== null && initialBoard[row][col] === null) {
            const actionId = Date.now().toString() + Math.random().toString();
            set(state => ({
                pendingActions: [...state.pendingActions, {
                    id: actionId,
                    row,
                    col,
                    val: activeNumber,
                    isNote: isNoteMode
                }]
            }));
        }
    },

    commitAction: (actionId) => {
        const { pendingActions, currentBoard, notes, history } = get();
        const action = pendingActions.find(a => a.id === actionId);
        if (!action) return;

        if (action.isNote) {
            // 筆記模式: 僅切換數字，如果 val 為 null 則不處理或清空?
            // 假設筆記的 CLEAR 操作會是 val=null
            if (action.val !== null) {
                const key = `${action.row}-${action.col}`;
                const currentNotes = notes[key] || [];
                const newNotes = currentNotes.includes(action.val)
                    ? currentNotes.filter(n => n !== action.val)
                    : [...currentNotes, action.val];

                set(state => ({ notes: { ...state.notes, [key]: newNotes } }));
            } else {
                // Clear notes
                const key = `${action.row}-${action.col}`;
                set(state => ({ notes: { ...state.notes, [key]: [] } }));
            }
        } else {
            // 一般模式
            const newHistory = [...history, currentBoard.map(r => [...r])];
            const newBoard = currentBoard.map(r => [...r]);

            newBoard[action.row][action.col] = action.val; // val can be null (Clear)

            const updates: Partial<GameState> = {
                currentBoard: newBoard,
                history: newHistory,
            };

            // 如果填入有效數字，清除該格筆記
            if (action.val !== null) {
                updates.notes = { ...notes, [`${action.row}-${action.col}`]: [] };
            }

            set(updates);
        }

        set(state => ({
            pendingActions: state.pendingActions.filter(a => a.id !== actionId)
        }));
    },

    setActiveNumber: (num) => {
        if (get().activeNumber === num) {
            set({ activeNumber: null });
        } else {
            set({ activeNumber: num });
        }
    },

    toggleNoteMode: () => {
        set(state => ({ isNoteMode: !state.isNoteMode }));
    },

    clearCell: () => {
        const { selectedCell, initialBoard, currentBoard, solution, isNoteMode } = get();

        // 1. 檢查是否有錯誤的格子 (紅字)
        const errorCells: { r: number, c: number }[] = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = currentBoard[r][c];
                const isInitial = initialBoard[r][c] !== null;
                if (!isInitial && val !== null && val !== solution[r][c]) {
                    errorCells.push({ r, c });
                }
            }
        }

        // 2. 如果有錯誤，全部清除 (產生多個 Actions，貓咪會忙碌一下)
        if (errorCells.length > 0) {
            const newActions: PendingAction[] = errorCells.map((cell) => ({
                id: Date.now().toString() + Math.random().toString(),
                row: cell.r,
                col: cell.c,
                val: null, // Clear
                isNote: false // Force clear value, not notes
            }));

            set(state => ({
                pendingActions: [...state.pendingActions, ...newActions]
            }));
            return;
        }

        // 3. 如果沒有錯誤，則清除當前選取的格子 (原有邏輯)
        if (!selectedCell) return;
        const [row, col] = selectedCell;

        if (initialBoard[row][col] !== null) return;

        const actionId = Date.now().toString() + Math.random().toString();
        set(state => ({
            pendingActions: [...state.pendingActions, {
                id: actionId,
                row,
                col,
                val: null, // Clear
                isNote: isNoteMode
            }]
        }));
    },

    undo: () => {
        const { history } = get();
        if (history.length === 0) return;
        const previousBoard = history[history.length - 1];
        set(state => ({
            currentBoard: previousBoard,
            history: state.history.slice(0, -1)
        }));
    }
}));
