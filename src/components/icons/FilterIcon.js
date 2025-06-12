import React from 'react';
import { View, StyleSheet } from 'react-native';

const FilterIcon = ({ size = 20, color = "#ED8721" }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.funnel, { borderTopColor: color }]} />
      <View style={[styles.stem, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  funnel: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ED8721',
  },
  stem: {
    width: 4,
    height: 8,
    backgroundColor: '#ED8721',
    marginTop: -1,
  }
});

export default FilterIcon; 