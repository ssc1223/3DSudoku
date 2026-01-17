
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
    // Polyfill Global Window
    if (typeof (global as any).window === 'undefined') {
        (global as any).window = global;
    }

    // Polyfill Window Event Listeners (Crucial for Three.js/Troika)
    if (typeof (global as any).window.addEventListener === 'undefined') {
        (global as any).window.addEventListener = () => { };
        (global as any).window.removeEventListener = () => { };
    }

    // Polyfill Document
    if (typeof (global as any).document === 'undefined') {
        (global as any).document = {
            createElement: (tagName: string) => {
                // Minimal shim for Canvas
                if (tagName === 'canvas') {
                    return {
                        getContext: () => ({
                            measureText: () => ({ width: 0, height: 0 }),
                            fillText: () => { },
                            strokeText: () => { },
                            fillRect: () => { },
                            getImageData: () => ({ data: [] }),
                        }),
                        width: 0,
                        height: 0,
                        style: { width: 0, height: 0 },
                        addEventListener: () => { },
                        removeEventListener: () => { },
                    };
                }
                // Minimal shim for Image
                if (tagName === 'img') {
                    return {
                        style: {},
                        addEventListener: () => { },
                        removeEventListener: () => { },
                        src: '',
                        width: 0,
                        height: 0,
                    }
                }
                // Fallback
                return {
                    style: {},
                    addEventListener: () => { },
                    removeEventListener: () => { },
                };
            },
            addEventListener: () => { },
            removeEventListener: () => { },
            body: {},
            documentElement: { clientWidth: 0, clientHeight: 0 }
        };
    }

    // Polyfill Worker (Optional, suppresses warnings but usually main thread fallback works)
    // If we define it, Troika might try to use it and fail harder if not a real worker.
    // Better to leave it undefined so it falls back gracefully, OR define a dummy if fallback fails.
    // Warning says "falling back to main thread execution", which is GOOD. So we don't need to fake Worker.

    // Polyfill performance
    if (typeof (global as any).performance === 'undefined') {
        (global as any).performance = { now: () => Date.now() };
    }
}
