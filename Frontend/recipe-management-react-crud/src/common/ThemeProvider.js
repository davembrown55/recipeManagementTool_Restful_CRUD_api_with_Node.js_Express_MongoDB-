import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
// import useMediaQuery from '@mui/material/useMediaQuery'
import "./DarkOrLight.css";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });
  // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)'); 
  const [theme, setTheme] = useState(prefersDarkMode ? 'dark' : 'light');

  useEffect(() => {
    setTheme(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const themeVariants = {
    variant: theme === 'dark' ? 'dark' : 'light',
    bg: theme === 'dark' ? 'dark' : 'light',
    text: theme === 'dark' ? 'light' : 'dark',
    'data-bs-theme': theme === 'dark' ? 'dark' : 'light',
  };
  
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#0d0711' : '#d9e9e4';
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#0d0711' : '#d9e9e44';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeVariants, setTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
