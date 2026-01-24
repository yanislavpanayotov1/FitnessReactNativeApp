import { createContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
    themeMode: 'auto',
    setThemeMode: async () => { },
    isDark: false,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
    const [isLoading, setIsLoading] = useState(true);
    const deviceColorScheme = useColorScheme();

    useEffect(() => {
        loadThemeMode();
    }, []);

    const loadThemeMode = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem('themeMode');
            if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
                setThemeModeState(storedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Error loading theme mode:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem('themeMode', mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme mode:', error);
        }
    };

    const isDark = themeMode === 'auto'
        ? deviceColorScheme === 'dark'
        : themeMode === 'dark';

    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};
