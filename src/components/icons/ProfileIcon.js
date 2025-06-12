import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ProfileIcon = ({ width = 25, height = 24, color = "#9E9E9E" }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1849 15.3462C8.31726 15.3462 5.0144 15.931 5.0144 18.2729C5.0144 20.6148 8.29631 21.2205 12.1849 21.2205C16.0525 21.2205 19.3544 20.6348 19.3544 18.2938C19.3544 15.9529 16.0735 15.3462 12.1849 15.3462Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1848 12.0059C14.7229 12.0059 16.7801 9.94779 16.7801 7.40969C16.7801 4.8716 14.7229 2.81445 12.1848 2.81445C9.64674 2.81445 7.58865 4.8716 7.58865 7.40969C7.58008 9.93922 9.62389 11.9973 12.1525 12.0059H12.1848Z"
        stroke={color}
        strokeWidth="1.42857"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ProfileIcon; 