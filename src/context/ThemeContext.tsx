import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themeColors = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#EF9439',
    secondary: '#6f4a8e',
    card: '#F2F2F7',
    border: '#C6C6C8',
    notification: '#FF3B30',
  },
  dark: {
    background: '#2D2D2D',
    text: '#FFFFFF',
    primary: '#EF9439',
    secondary: '#6f4a8e',
    card: '#1C1C1E',
    border: '#38383A',
    notification: '#FF453A',
  },
};

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(deviceTheme || 'light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{theme, toggleTheme, isDark: theme === 'dark'}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
