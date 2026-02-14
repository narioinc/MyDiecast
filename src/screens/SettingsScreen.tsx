import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Appbar, List, Switch, useTheme, Divider, Text, Button, Portal, Dialog } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';
import { useCollection } from '../context/CollectionContext';

const SettingsScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { themeMode, setThemeMode } = useSettings();
    const { clearCollection, importCollection } = useCollection();

    const [clearDialogVisible, setClearDialogVisible] = useState(false);

    const handleClearDB = async () => {
        setClearDialogVisible(false);
        await clearCollection();
        Alert.alert('Success', 'Collection has been cleared.');
    };

    const handleImport = async () => {
        const success = await importCollection();
        if (success) {
            Alert.alert('Success', 'Collection imported successfully!');
        } else {
            // Error already logged or user cancelled
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Settings" />
            </Appbar.Header>

            <ScrollView>
                <List.Section>
                    <List.Subheader>Appearance</List.Subheader>
                    <List.Item
                        title="Dark Mode"
                        description={themeMode === 'system' ? 'Following system' : themeMode === 'dark' ? 'On' : 'Off'}
                        left={props => <List.Icon {...props} icon="theme-light-dark" />}
                        right={() => (
                            <View style={styles.themeToggle}>
                                <Button
                                    mode={themeMode === 'light' ? 'contained' : 'outlined'}
                                    compact
                                    onPress={() => setThemeMode('light')}
                                    style={styles.modeButton}
                                >
                                    Light
                                </Button>
                                <Button
                                    mode={themeMode === 'dark' ? 'contained' : 'outlined'}
                                    compact
                                    onPress={() => setThemeMode('dark')}
                                    style={styles.modeButton}
                                >
                                    Dark
                                </Button>
                                <Button
                                    mode={themeMode === 'system' ? 'contained' : 'outlined'}
                                    compact
                                    onPress={() => setThemeMode('system')}
                                    style={styles.modeButton}
                                >
                                    Auto
                                </Button>
                            </View>
                        )}
                    />
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>Data Management</List.Subheader>
                    <List.Item
                        title="Import Collection"
                        description="Restore from a JSON file"
                        left={props => <List.Icon {...props} icon="file-import" />}
                        onPress={handleImport}
                    />
                    <List.Item
                        title="Clear Database"
                        description="Permanently delete all cars and brands"
                        left={props => <List.Icon {...props} icon="delete-forever" color={theme.colors.error} />}
                        titleStyle={{ color: theme.colors.error }}
                        onPress={() => setClearDialogVisible(true)}
                    />
                </List.Section>

                <Divider />

                <List.Section>
                    <List.Subheader>About</List.Subheader>
                    <List.Item
                        title="Version"
                        description="1.0.0"
                        left={props => <List.Icon {...props} icon="information" />}
                    />
                </List.Section>
            </ScrollView>

            <Portal>
                <Dialog visible={clearDialogVisible} onDismiss={() => setClearDialogVisible(false)}>
                    <Dialog.Title>Clear Database?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">This action cannot be undone. All your diecast records and custom brands will be permanently deleted.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setClearDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleClearDB} textColor={theme.colors.error}>Clear Everything</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modeButton: {
        marginHorizontal: 2,
        borderRadius: 4,
    }
});

export default SettingsScreen;
