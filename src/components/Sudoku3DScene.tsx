
import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Board3D } from './Board3D';
import { Cat3D } from './Cat3D';
import { useGameStore } from '../store/gameStore';
import { ControlState } from '../utils/controlState';
import * as THREE from 'three';

const SceneController = ({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) => {
    useFrame(() => {
        if (!controlsRef.current) return;

        const controls = controlsRef.current;
        let changed = false;

        // Rotation
        if (ControlState.rotateDeltaX !== 0 || ControlState.rotateDeltaY !== 0) {
            // Check if setAzimuthalAngle exists (newer drei versions) or simulate
            // OrbitControls from three/examples/jsm/controls/OrbitControls usually has these
            // But drei wraps it. We can modify angles directly.

            // Azimuth (Horizontal)
            const az = controls.getAzimuthalAngle();
            controls.setAzimuthalAngle(az + ControlState.rotateDeltaX * 0.01);

            // Polar (Vertical)
            const pol = controls.getPolarAngle();
            controls.setPolarAngle(pol + ControlState.rotateDeltaY * 0.01);

            changed = true;
        }

        // Zoom (Dolly)
        if (ControlState.zoomDelta !== 0) {
            // Positive ZoomDelta = Zoom In -> Dolly In
            // DollyIn scales the zoom ( < 1 )
            const scale = Math.pow(0.95, ControlState.zoomDelta * 0.1);
            // Invert logic if needed: 
            // If dragging UP (negative delta?), we want to zoom IN?
            // Usually ControlState.zoomDelta > 0 (Up) -> Zoom In
            if (ControlState.zoomDelta > 0) {
                controls.dollyIn(1.02); // Zoom In
            } else {
                controls.dollyOut(1.02); // Zoom Out
            }
            changed = true;
        }

        if (changed) {
            controls.update();
            ControlState.reset();
        }
    });
    return null;
};

export const Sudoku3DScene: React.FC = () => {
    const controlsRef = useRef<any>(null);
    const cameraResetTrigger = useGameStore(state => state.cameraResetTrigger);

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, [cameraResetTrigger]);

    return (
        <Canvas style={{ flex: 1 }}>
            <color attach="background" args={['#333333']} />
            <PerspectiveCamera makeDefault position={[0, 10, 10]} fov={50} near={0.1} far={1000} />
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                enableRotate={false} // Disable Touch Gestures
                enableZoom={false}   // Disable Touch Zoom
                minDistance={2}
                maxDistance={50}
            />
            <SceneController controlsRef={controlsRef} />

            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

            <Board3D />
            <Cat3D />
        </Canvas>
    );
};
