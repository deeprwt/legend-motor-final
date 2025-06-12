import React from 'react';
import {Image} from 'react-native';
import {useTheme} from 'src/context/ThemeContext';
// import { Asset } from 'expo-asset';

// Preload the image to avoid issues
// Asset.fromModule(require('../assets/images/LangaugeScreenLogo.png')).downloadAsync();

const Logo = ({width = 200, height = 80}) => {
  const {isDark} = useTheme();

  return (
    <Image
      source={
        isDark
          ? require('../assets/images/legend-motors-dark.png')
          : require('../assets/images/legend-motors-light.png')
      }
      style={{width, height, resizeMode: 'contain'}}
    />
  );
};

export default Logo;
