import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Modal,
    TouchableOpacity,
    Dimensions,
    PanResponder,
    PanResponderInstance
} from 'react-native';
import { IconButton, Surface, useTheme } from 'react-native-paper';

interface ImagePreviewModalProps {
    visible: boolean;
    imageUrl: string;
    onDismiss: () => void;
}

const { width, height } = Dimensions.get('window');

const ImagePreviewModal = ({ visible, imageUrl, onDismiss }: ImagePreviewModalProps) => {
    const theme = useTheme();

    // Animated values for transformations
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    // Base values at the start of a gesture
    const baseScale = useRef(1);
    const baseTranslateX = useRef(0);
    const baseTranslateY = useRef(0);

    // Tracking current values for persistence across gestures
    const currentScale = useRef(1);
    const currentTranslateX = useRef(0);
    const currentTranslateY = useRef(0);

    // For pinch gesture distance tracking
    const initialDistance = useRef(0);

    // Sync current values (non-gesture values)
    useEffect(() => {
        const scaleId = scale.addListener(({ value }) => {
            currentScale.current = value;
        });
        const translateXId = translateX.addListener(({ value }) => {
            currentTranslateX.current = value;
        });
        const translateYId = translateY.addListener(({ value }) => {
            currentTranslateY.current = value;
        });

        return () => {
            scale.removeListener(scaleId);
            translateX.removeListener(translateXId);
            translateY.removeListener(translateYId);
        };
    }, [scale, translateX, translateY]);

    // Reset values when modal opens/closes
    useEffect(() => {
        if (!visible) {
            scale.setValue(1);
            translateX.setValue(0);
            translateY.setValue(0);
            currentScale.current = 1;
            currentTranslateX.current = 0;
            currentTranslateY.current = 0;
        }
    }, [visible, scale, translateX, translateY]);

    const calcDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    const panResponder = useRef<PanResponderInstance>(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                // Capture starting values for this gesture
                baseScale.current = currentScale.current;
                baseTranslateX.current = currentTranslateX.current;
                baseTranslateY.current = currentTranslateY.current;

                const touches = evt.nativeEvent.touches;
                if (touches.length === 2) {
                    initialDistance.current = calcDistance(
                        touches[0].pageX, touches[0].pageY,
                        touches[1].pageX, touches[1].pageY
                    );
                } else {
                    initialDistance.current = 0;
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length === 2) {
                    const currentDistance = calcDistance(
                        touches[0].pageX, touches[0].pageY,
                        touches[1].pageX, touches[1].pageY
                    );

                    if (initialDistance.current === 0) {
                        initialDistance.current = currentDistance;
                        baseScale.current = currentScale.current;
                    }

                    if (initialDistance.current > 0) {
                        const ratio = currentDistance / initialDistance.current;
                        let newScale = baseScale.current * ratio;
                        newScale = Math.max(1, Math.min(newScale, 5));
                        scale.setValue(newScale);
                    }
                } else if (touches.length === 1) {
                    if (initialDistance.current !== 0) {
                        initialDistance.current = 0;
                        baseTranslateX.current = currentTranslateX.current - (gestureState.dx / currentScale.current);
                        baseTranslateY.current = currentTranslateY.current - (gestureState.dy / currentScale.current);
                    }

                    if (currentScale.current > 1.05) {
                        translateX.setValue(baseTranslateX.current + gestureState.dx);
                        translateY.setValue(baseTranslateY.current + gestureState.dy);
                    }
                }
            },
            onPanResponderRelease: () => {
                // Bounce back if scale is near 1
                if (currentScale.current <= 1.1) {
                    Animated.parallel([
                        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
                        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
                        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
                    ]).start();
                }
            }
        })
    ).current;

    if (!imageUrl) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <View style={styles.overlay}>
                {/* Background area to dismiss */}
                <TouchableOpacity
                    style={styles.touchableBackground}
                    activeOpacity={1}
                    onPress={onDismiss}
                />

                <View style={styles.content}>
                    <Animated.View
                        {...panResponder.panHandlers}
                        style={[
                            styles.imageContainer,
                            {
                                transform: [
                                    { scale: scale },
                                    { translateX: translateX },
                                    { translateY: translateY },
                                ]
                            }
                        ]}
                    >
                        <Surface style={styles.surface} elevation={5}>
                            <Animated.Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </Surface>
                    </Animated.View>

                    <IconButton
                        icon="close"
                        mode="contained"
                        containerColor="rgba(0,0,0,0.5)"
                        iconColor="white"
                        size={30}
                        style={styles.closeButton}
                        onPress={onDismiss}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    touchableBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: width * 0.9,
        height: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    surface: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    }
});

export default ImagePreviewModal;
