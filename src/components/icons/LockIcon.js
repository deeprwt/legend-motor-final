import React from 'react';
import Svg, { Path } from 'react-native-svg';

const LockIcon = ({ color = '#666666', size = 20 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M15.833 9.167H4.167c-.917 0-1.667.75-1.667 1.666v5c0 .917.75 1.667 1.667 1.667h11.666c.917 0 1.667-.75 1.667-1.667v-5c0-.916-.75-1.666-1.667-1.666z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.833 9.167V5.833a4.167 4.167 0 018.334 0v3.334"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default LockIcon; 