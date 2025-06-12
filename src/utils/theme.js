import React, { createContext, useContext } from 'react';
import constants from './constants';

// Create the theme context
const ThemeContext = createContext(constants);

// Custom hook to access the theme
export const useTheme = () => useContext(ThemeContext);

// Theme provider component to wrap the app
export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={constants}>
      {children}
    </ThemeContext.Provider>
  );
};

export default constants; 