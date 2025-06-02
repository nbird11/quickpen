import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { useThemeManager } from '../hooks/useThemeManager';

type ThemeOption = {
  key: 'light' | 'dark' | 'system';
  label: string;
};

const themeOptions: ThemeOption[] = [
  { key: 'light', label: 'Light' },
  { key: 'system', label: 'System' },
  { key: 'dark', label: 'Dark' },
];

const ThemeToggle: React.FC = () => {
  const { preferredTheme, setThemePreference } = useThemeManager();

  return (
    <ButtonGroup aria-label="Theme selection">
      {themeOptions.map((option) => (
        <Button
          key={option.key}
          variant={preferredTheme === option.key ? 'primary' : 'secondary'} // Use primary for active, secondary for inactive
          active={preferredTheme === option.key}
          onClick={() => setThemePreference(option.key)}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default ThemeToggle; 