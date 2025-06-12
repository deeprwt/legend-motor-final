import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useTheme} from '../context/ThemeContext';

const Dhyram = ({style = {}}) => {
  const {isDark} = useTheme();
  return (
    <Image
      style={{
        height: 16,
        width: 16,
        tintColor: isDark ? '#fff' : '#5E366D',
        ...style,
      }}
      source={require('../assets/images/dhyram.png')}
    />
  );
};

export default Dhyram;

const styles = StyleSheet.create({});
