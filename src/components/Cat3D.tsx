
import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/gameStore';
import * as THREE from 'three';

export const Cat3D: React.FC = () => {
    const { pendingActions, commitAction } = useGameStore();
    const [currentActionId, setCurrentActionId] = useState<string | null>(null);

    // State
    const [state, setState] = useState<'idle' | 'moving' | 'writing' | 'leaving' | 'resting'>('idle');
    const [penType, setPenType] = useState<'pen' | 'pencil'>('pen');

    // Logic Refs
    const currentPos = useRef(new THREE.Vector3(5, 0, 5)); // Start outside
    const targetPos = useRef(new THREE.Vector3(5, 0, 5));
    const groupRef = useRef<THREE.Group>(null);
    const penRef = useRef<THREE.Group>(null);

    // 監聽隊列
    useEffect(() => {
        // If we are idle OR resting, and there are actions, start working!
        if ((state === 'idle' || state === 'resting') && pendingActions.length > 0) {
            startNextAction();
        }
        // 注意：不在 leaving 狀態時啟動新動作，等 leaving 完成變成 idle 後再處理
    }, [pendingActions, state]);

    const startNextAction = () => {
        const action = pendingActions[0];
        if (!action) return;

        setCurrentActionId(action.id);
        setPenType(action.isNote ? 'pencil' : 'pen');

        // Board3D Logic: x = col - 4, z = row - 4
        const x = action.col - 4;
        const z = action.row - 4;

        targetPos.current.set(x + 0.3, 0, z + 0.3);
        setState('moving');
    };

    const leaveScreen = () => {
        // Move to a nearby corner "Resting Spot" (visible but not blocking)
        targetPos.current.set(5, 0, 5);
        setState('leaving');
    };

    // Animation Loop - 只處理視覺更新，邏輯由 InnerCatLogic 處理
    useFrame((r3fState, delta) => {
        if (!groupRef.current) return;

        // 1. 同步視覺位置（邏輯位置由 InnerCatLogic 更新）
        groupRef.current.position.copy(currentPos.current);

        // 2. 面向目標
        if (currentPos.current.distanceTo(targetPos.current) > 0.05) {
            groupRef.current.lookAt(targetPos.current.x, 0, targetPos.current.z);
        }

        // 3. Writing Animation (Pen Bobbing)
        if (penRef.current) {
            if (state === 'writing') {
                const time = r3fState.clock.getElapsedTime();
                penRef.current.position.y = Math.sin(time * 15) * 0.1 + 0.1; // Bobbing
            } else {
                penRef.current.position.y = 0;
            }
        }
    });

    return (
        <group ref={groupRef} position={[5, 0, 5]}>
            <InnerCatLogic
                state={state}
                setState={setState}
                targetPos={targetPos.current}
                currentPos={currentPos.current}
                onWriteFinish={() => {
                    // Commit Action
                    if (currentActionId) {
                        commitAction(currentActionId);
                        setCurrentActionId(null);
                    }

                    // Checks for next (synchronous for faster response)
                    const remaining = useGameStore.getState().pendingActions;
                    if (remaining.length > 0) {
                        setState('idle');
                    } else {
                        // Move to rest position
                        leaveScreen();
                    }
                }}
            />

            {/* Visuals */}
            <mesh position={[0, 0.5, 0]}>
                <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.35]} />
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[-0.15, 1.3, 0]} rotation={[0, 0, 0.5]}>
                <coneGeometry args={[0.1, 0.2, 4]} />
                <meshStandardMaterial color="#FFCCCC" />
            </mesh>
            <mesh position={[0.15, 1.3, 0]} rotation={[0, 0, -0.5]}>
                <coneGeometry args={[0.1, 0.2, 4]} />
                <meshStandardMaterial color="#FFCCCC" />
            </mesh>

            <group position={[0.3, 0.6, 0.3]}>
                <mesh>
                    <sphereGeometry args={[0.1]} />
                    <meshStandardMaterial color="#FFFFFF" />
                </mesh>
                <group ref={penRef} rotation={[0, 0, -Math.PI / 4]}>
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                        <meshStandardMaterial color={penType === 'pen' ? '#00008B' : '#FFD700'} />
                    </mesh>
                    <mesh position={[0, -0.3, 0]}>
                        <coneGeometry args={[0.05, 0.2]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

// 分離邏輯組件以使用 useFrame
const InnerCatLogic = ({ state, setState, targetPos, currentPos, onWriteFinish }: any) => {
    const isWriting = useRef(false);

    useFrame((_, delta) => {
        const speed = 25 * delta;
        const dist = currentPos.distanceTo(targetPos);

        if (state === 'moving') {
            if (dist > 0.05) {
                const dir = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
                currentPos.add(dir.multiplyScalar(speed));
            } else {
                currentPos.copy(targetPos);
                setState('writing');
            }
        } else if (state === 'leaving') {
            if (dist > 0.05) {
                const dir = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
                currentPos.add(dir.multiplyScalar(speed));
            } else {
                currentPos.copy(targetPos);
                setState('idle'); // leaving 完成後設為 idle，讓 useEffect 處理新動作
            }
        }

        if (state === 'writing' && !isWriting.current) {
            isWriting.current = true;
            // Write for 0.5s then finish
            setTimeout(() => {
                isWriting.current = false;
                onWriteFinish();
            }, 50);
        }
    });

    return null;
}
