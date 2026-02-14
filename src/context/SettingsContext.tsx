import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDarkMode: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@mydiecast_theme_mode';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        const loadSettings = async () => {
            const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (storedTheme) {
                setThemeModeState(storedTheme as ThemeMode);
            }
        };
        loadSettings();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    };

    const isDarkMode = themeMode === 'system'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    return (
        <SettingsContext.Provider value={{ themeMode, setThemeMode, isDarkMode }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
