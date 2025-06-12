import React from 'react';
import {Image} from 'react-native';

const BodyTypeIconComponent = ({width = 40, height = 30, img = ''}) => {
  return (
    <Image
      source={img || require('../../assets/images/hatchbackicon.png')}
      style={{width, height, resizeMode: 'contain'}}
    />
  );
};

export default BodyTypeIconComponent;
