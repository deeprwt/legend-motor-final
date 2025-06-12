import React from 'react';
import { Image } from 'react-native';

const HatchbackIcon = ({ width = 40, height = 30 }) => {
  return (
    <Image
      source={require('../../assets/images/hatchbackicon.png')}
      style={{ width, height, resizeMode: 'contain' }}
    />
  );
};

export default HatchbackIcon; 