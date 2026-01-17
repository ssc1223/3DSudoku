
import React from 'react';
import { Cell3D } from './Cell3D';
import { Line } from '@react-three/drei';

export const Board3D: React.FC = () => {
    // 建立 9x9 格子
    const cells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // 計算位置: 讓中心點在 (0,0,0)
            // 每個格子寬 1，間距考慮進去
            // 0..8 -> -4..4
            const x = col - 4;
            const z = row - 4;

            cells.push(
                <Cell3D
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    position={[x, 0, z]}
                />
            );
        }
    }

    // 繪製格線 (粗黑線分隔 3x3 區域)
    const lines = [];
    // 垂直線
    for (let i = 0; i <= 3; i++) {
        const x = i * 3 - 4.5; // -4.5, -1.5, 1.5, 4.5
        lines.push(
            <Line
                key={`v-${i}`}
                points={[[x, 0.06, -4.5], [x, 0.06, 4.5]]} // 稍微浮起一點避免 z-fighting
                color="black"
                lineWidth={3} // 粗線
            />
        );
    }
    // 水平線
    for (let i = 0; i <= 3; i++) {
        const z = i * 3 - 4.5;
        lines.push(
            <Line
                key={`h-${i}`}
                points={[[-4.5, 0.06, z], [4.5, 0.06, z]]}
                color="black"
                lineWidth={3}
            />
        );
    }

    return (
        <group>
            {/* 背景板 */}
            <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[9.2, 0.1, 9.2]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {cells}
            {lines}
        </group>
    );
};
