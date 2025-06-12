import React from 'react';
import {useTheme} from '../../context/ThemeContext';

export const withTheme = IconComponent => {
  return ({color, ...props}) => {
    const {theme, isDark} = useTheme();
    const defaultColor = isDark ? '#FFFFFF' : '#8E8E8E';
    return <IconComponent color={color || defaultColor} {...props} />;
  };
};
