import React from 'react';
import Svg, { Path } from 'react-native-svg';

const EmailIcon = ({ color = '#666666', size = 20 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.667 3.333H3.333c-.916 0-1.666.75-1.666 1.667v10c0 .917.75 1.667 1.666 1.667h13.334c.916 0 1.666-.75 1.666-1.667V5c0-.917-.75-1.667-1.666-1.667z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.333 5.833L10 11.667 1.667 5.833"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default EmailIcon; 