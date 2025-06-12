import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { useTheme } from '../../context/ThemeContext'

function SvgComponent(props) {
  const { isDark } = useTheme()
  
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M23.333 14.32c0 .443-.33.81-.756.867l-.119.008h-17.5a.875.875 0 01-.119-1.742l.119-.008h17.5c.483 0 .875.392.875.875z"
        fill={isDark ? '#FFFFFF' : '#212121'}
      />
      <Path
        d="M12.634 20.728a.875.875 0 01-1.136 1.325l-.099-.085-7.058-7.027a.875.875 0 01-.085-1.142l.085-.099 7.058-7.029a.875.875 0 011.32 1.142l-.085.098-6.435 6.41 6.435 6.407z"
        fill={isDark ? '#FFFFFF' : '#212121'}
      />
    </Svg>
  )
}

export default SvgComponent