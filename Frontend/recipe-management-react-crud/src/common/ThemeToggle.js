import React from 'react';
import Button from 'react-bootstrap/Button';
import { useTheme } from './ThemeProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme} variant={theme === 'dark' ? 'light' : 'dark'}>
      {/* {theme === 'dark' ? 'Light' : 'Dark'} Mode? */}
      {theme === 'dark' ? <i className="bi bi-brightness-high-fill"></i> : <i className="bi bi-moon-stars-fill"></i>}
    </Button>
  );
};

export default ThemeToggle;
