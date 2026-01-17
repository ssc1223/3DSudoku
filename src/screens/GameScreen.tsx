import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, PanResponder } from 'react-native';
import { Sudoku3DScene } from '../components/Sudoku3DScene';
import { useGameStore } from '../store/gameStore';
import { ControlState } from '../utils/controlState';

export const GameScreen: React.FC = () => {
    const {
        initGame,
        isNoteMode,
        toggleNoteMode,
        activeNumber,
        setActiveNumber,
        clearCell
    } = useGameStore();

    // PanResponder for Rotation
    const rotateResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                ControlState.rotateDeltaX = -gestureState.dx * 0.5;
                ControlState.rotateDeltaY = -gestureState.dy * 0.5;
            },
            onPanResponderRelease: () => {
                ControlState.reset();
            }
        })
    ).current;

    // PanResponder for Zoom
    const zoomResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                ControlState.zoomDelta = gestureState.dy;
            },
            onPanResponderRelease: () => {
                ControlState.reset();
            }
        })
    ).current;

    useEffect(() => {
        initGame('medium');
    }, []);

    const handleNumberPress = (num: number) => {
        const state = useGameStore.getState();
        const { selectedCell, initialBoard, activeNumber } = state;
        const isSelectingNewNumber = activeNumber !== num;

        setActiveNumber(num);

        if (isSelectingNewNumber && selectedCell) {
            const [r, c] = selectedCell;
            if (initialBoard[r][c] === null) {
                state.selectCell(r, c);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 頂部標題 (簡化) */}
            <View style={styles.header}>
                <Text style={styles.title}>🐱 貓咪數獨 🐱</Text>
            </View>

            {/* 3D 遊戲區域 */}
            <View style={styles.sceneContainer}>
                <Sudoku3DScene />
            </View>

            {/* 控制區：工具 + 相機控制 */}
            <View style={styles.controlBar}>
                {/* 左側工具按鈕 */}
                <TouchableOpacity
                    style={[styles.toolButton, isNoteMode && styles.activeToolButton]}
                    onPress={toggleNoteMode}
                >
                    <Text style={styles.toolText}>✏️ 筆記</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toolButton}
                    onPress={() => clearCell()}
                >
                    <Text style={styles.toolText}>🧹 清除</Text>
                </TouchableOpacity>

                {/* 相機控制 */}
                <View
                    style={styles.cameraButton}
                    {...rotateResponder.panHandlers}
                >
                    <Text style={styles.cameraText}>🔄 旋轉</Text>
                </View>

                <View
                    style={styles.cameraButton}
                    {...zoomResponder.panHandlers}
                >
                    <Text style={styles.cameraText}>🔍 遠近</Text>
                </View>

                <TouchableOpacity
                    style={styles.toolButton}
                    onPress={() => useGameStore.getState().resetCamera()}
                >
                    <Text style={styles.toolText}>🏠 重置</Text>
                </TouchableOpacity>
            </View>

            {/* 底部數字鍵盤 */}
            <View style={styles.footer}>
                <View style={styles.numpad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[
                                styles.numButton,
                                activeNumber === num && styles.activeNumButton
                            ]}
                            onPress={() => handleNumberPress(num)}
                        >
                            <Text style={[
                                styles.numText,
                                activeNumber === num && styles.activeNumText
                            ]}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

// 🎨 溫暖可愛配色
const COLORS = {
    background: '#FFF5E6',      // 奶油色
    headerBg: '#FFCDB2',        // 蜜桃色
    headerText: '#6D4C41',      // 咖啡棕
    controlBarBg: '#FFE5D9',    // 淺杏色
    toolButton: '#FFAB91',      // 珊瑚粉
    toolButtonActive: '#FF8A65', // 深珊瑚
    toolText: '#5D4037',        // 深棕
    cameraButton: '#B39DDB',    // 薰衣草紫
    cameraText: '#FFFFFF',
    footerBg: '#FFFBF0',        // 米白
    numText: '#8D6E63',         // 暖灰棕
    numTextActive: '#E65100',   // 橙色
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    header: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.headerBg,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.headerText,
    },
    sceneContainer: {
        flex: 1,
    },
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: COLORS.controlBarBg,
    },
    toolButton: {
        backgroundColor: COLORS.toolButton,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 2,
    },
    activeToolButton: {
        backgroundColor: COLORS.toolButtonActive,
    },
    toolText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.toolText,
    },
    cameraButton: {
        backgroundColor: COLORS.cameraButton,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 2,
    },
    cameraText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.cameraText,
    },
    footer: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: COLORS.footerBg,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        elevation: 8,
        shadowColor: '#FFB74D',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    numpad: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    numButton: {
        padding: 5,
        minWidth: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeNumButton: {
        transform: [{ scale: 1.25 }],
    },
    numText: {
        fontSize: 26,
        fontWeight: '500',
        color: COLORS.numText,
    },
    activeNumText: {
        color: COLORS.numTextActive,
        fontWeight: 'bold',
    },
});
