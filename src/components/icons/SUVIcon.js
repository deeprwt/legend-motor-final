import React from 'react';
import { Image } from 'react-native';

const SUVIcon = ({ width = 40, height = 30 }) => {
  return (
    <Image
      source={require('../../assets/images/hatchbackicon.png')}
      style={{ width, height, resizeMode: 'contain' }}
    />
  );
};

export default SUVIcon; 