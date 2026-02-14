import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { Text, IconButton, Divider, useTheme, List } from 'react-native-paper';

interface SideDrawerProps {
    visible: boolean;
    onClose: () => void;
    onItemPress: (action: string) => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const SideDrawer = ({ visible, onClose, onItemPress }: SideDrawerProps) => {
    const theme = useTheme();
    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const backgroundOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backgroundOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateX, {
                    toValue: -DRAWER_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backgroundOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, translateX, backgroundOpacity]);

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: backgroundOpacity }
                    ]}
                />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.drawerContainer,
                    {
                        backgroundColor: theme.colors.surface,
                        transform: [{ translateX }],
                        width: DRAWER_WIDTH
                    }
                ]}
            >
                <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
                    <IconButton icon="car" size={32} iconColor={theme.colors.onPrimaryContainer} />
                    <Text variant="titleLarge" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>
                        MyDiecast
                    </Text>
                </View>

                <View style={styles.menuItems}>
                    <List.Item
                        title="Search Collection"
                        left={props => <List.Icon {...props} icon="magnify" />}
                        onPress={() => onItemPress('search')}
                    />
                    <Divider />
                    <List.Item
                        title="Share Collection"
                        left={props => <List.Icon {...props} icon="share-variant" />}
                        onPress={() => onItemPress('share')}
                    />
                    <List.Item
                        title="Export (Save as JSON)"
                        left={props => <List.Icon {...props} icon="file-export" />}
                        onPress={() => onItemPress('export')}
                    />
                    <List.Item
                        title="Import Collection"
                        left={props => <List.Icon {...props} icon="file-import" />}
                        onPress={() => onItemPress('import')}
                    />
                    <Divider />
                    <List.Item
                        title="Settings"
                        left={props => <List.Icon {...props} icon="cog" />}
                        onPress={() => onItemPress('settings')}
                    />
                </View>

                <View style={styles.footer}>
                    <Text variant="labelSmall" style={{ opacity: 0.5 }}>v1.0.0 • Premium Edition</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    drawerContainer: {
        flex: 1,
        height: '100%',
        elevation: 16,
        zIndex: 1000,
    },
    header: {
        padding: 24,
        paddingTop: 48,
        alignItems: 'center',
        flexDirection: 'row',
    },
    menuItems: {
        flex: 1,
        paddingTop: 8,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    }
});

export default SideDrawer;
