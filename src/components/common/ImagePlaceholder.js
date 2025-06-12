import React from 'react';
import {View, StyleSheet, Image} from 'react-native';

// This component creates a colored placeholder that can be used instead of actual images
// during development
const ImagePlaceholder = ({style, color = '#E0E0E0', img}) => {
  if (img) return <Image source={img} style={[styles.placeholder, style]} />;
  return <View style={[styles.placeholder, {backgroundColor: color}, style]} />;
};

const styles = StyleSheet.create({
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
});

export default ImagePlaceholder;
