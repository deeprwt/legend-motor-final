import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BlogIcon = ({ width = 19, height = 20, color = "#9E9E9E" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 20" fill="none">
      <Path
        d="M13.3163 14.2234H6.09631"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.3163 10.0369H6.09631"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.85144 5.86011H6.09644"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5087 0.749756C13.5087 0.749756 5.83171 0.753756 5.81971 0.753756C3.05971 0.770756 1.35071 2.58676 1.35071 5.35676V14.5528C1.35071 17.3368 3.07271 19.1598 5.85671 19.1598C5.85671 19.1598 13.5327 19.1568 13.5457 19.1568C16.3057 19.1398 18.0157 17.3228 18.0157 14.5528V5.35676C18.0157 2.57276 16.2927 0.749756 13.5087 0.749756Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BlogIcon; 