
import React, { useRef } from 'react';
import { Text3D, Center } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';
import fontJson from '../assets/helvetiker_regular.typeface.json';

interface Cell3DProps {
    row: number;
    col: number;
    position: [number, number, number];
}

export const Cell3D: React.FC<Cell3DProps> = React.memo(({ row, col, position }) => {
    const {
        currentBoard,
        initialBoard,
        solution,
        selectedCell,
        activeNumber,
        notes,
        selectCell
    } = useGameStore();

    const val = currentBoard[row][col];
    const isInitial = initialBoard[row][col] !== null;
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const cellNotes = notes[`${row}-${col}`] || [];

    // 高亮判斷邏輯
    let highlightNumber = null;

    // 1. 優先判斷：如果目前選取的格子有數字，則高亮該數字 (查看模式)
    if (selectedCell) {
        const [sRow, sCol] = selectedCell;
        const selectedVal = currentBoard[sRow][sCol];
        if (selectedVal !== null) {
            highlightNumber = selectedVal;
        }
    }

    // 2. 次要判斷：如果選取格是空的(準備填寫) 或 沒選格子，則依據 activeNumber 高亮
    if (highlightNumber === null) {
        highlightNumber = activeNumber;
    }

    const isSameNumber = (val !== null && val === highlightNumber);
    const isInRowOrCol = selectedCell ? (selectedCell[0] === row || selectedCell[1] === col) : false;

    // 錯誤判斷
    const isError = !isInitial && val !== null && val !== solution[row][col];

    const handleClick = (e: any) => {
        e.stopPropagation();
        selectCell(row, col);
    };

    // 決定背景顏色
    let baseColor = '#ffffff';
    if (isSelected) baseColor = '#FFD700'; // 金色
    else if (isSameNumber) baseColor = '#FFFACD'; // 檸檬綢色
    else if (isInRowOrCol) baseColor = '#E0E0E0'; // 淺灰

    // 決定文字顏色
    const textColor = isInitial
        ? '#000000'
        : isError
            ? '#FF0000'
            : '#00008B';

    // 決定文字粗體/縮放 (Bold Effect)
    const textScale = isSameNumber ? 1.3 : 1; // 相同數字放大 30%

    return (
        <group position={position} onClick={handleClick}>
            <mesh>
                <boxGeometry args={[0.95, 0.1, 0.95]} />
                <meshStandardMaterial color={baseColor} />
            </mesh>

            {/* 主數字 (使用 Text3D) - Low Poly Optimization */}
            {val !== null && (
                <Center position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={textScale}>
                    <Text3D
                        font={fontJson as any}
                        size={0.5}
                        height={0.02}
                        curveSegments={2} // Reduced from 12 for performance
                        bevelEnabled={false}
                    >
                        {val.toString()}
                        <meshStandardMaterial color={textColor} />
                    </Text3D>
                </Center>
            )}

            {/* 筆記 (Pencil Marks) - Ultra Low Poly */}
            {val === null && cellNotes.length > 0 && (
                <group position={[-0.3, 0.1, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
                    {cellNotes.map((note, idx) => {
                        const nx = (note - 1) % 3;
                        const ny = Math.floor((note - 1) / 3);
                        return (
                            <group key={note} position={[nx * 0.3, -ny * 0.3, 0]}>
                                <Center>
                                    <Text3D
                                        font={fontJson as any}
                                        size={0.15}
                                        height={0.01}
                                        curveSegments={1} // Lowest possible setting
                                        bevelEnabled={false}
                                    >
                                        {note.toString()}
                                        <meshStandardMaterial color="#555555" />
                                    </Text3D>
                                </Center>
                            </group>
                        );
                    })}
                </group>
            )}
        </group>
    );
}, (prev, next) => {
    // Custom comparison to limit re-renders
    // Only re-render if position changes (which it never does usually)
    // Note: State changes (zustand) inside the component will still trigger updates 
    // even with React.memo returning true. This Memo protects against Parent re-renders.
    return prev.row === next.row && prev.col === next.col;
});
