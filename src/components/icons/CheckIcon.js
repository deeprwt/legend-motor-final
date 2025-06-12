import React from 'react';
import Svg, { Path } from 'react-native-svg';

const CheckIcon = ({ color = '#FFFFFF', size = 12 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M10 3l-5.5 5.5L2 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CheckIcon; 