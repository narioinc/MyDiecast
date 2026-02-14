import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: '#BB86FC',
        accent: '#03DAC6',
        background: '#121212',
        surface: '#1E1E1E',
        error: '#CF6679',
        onPrimary: '#000000',
        onAccent: '#000000',
        onBackground: '#FFFFFF',
        onSurface: '#FFFFFF',
        onError: '#000000',
    },
};

export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6200EE',
        accent: '#03DAC6',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        error: '#B00020',
        onPrimary: '#FFFFFF',
        onAccent: '#000000',
        onBackground: '#000000',
        onSurface: '#000000',
        onError: '#FFFFFF',
    },
};

export const theme = darkTheme; // Default export for compatibility
