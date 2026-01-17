
// Performance First: Use a mutable object to store input state
// This avoids React re-renders during high-frequency drag events (60/120Hz)
// The 3D scene (useFrame) will read this directly.

export const ControlState = {
    rotateDeltaX: 0,
    rotateDeltaY: 0,
    zoomDelta: 0,

    // Reset deltas after frame consumption
    reset: () => {
        ControlState.rotateDeltaX = 0;
        ControlState.rotateDeltaY = 0;
        ControlState.zoomDelta = 0;
    }
};
