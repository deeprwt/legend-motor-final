import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simple placeholder component for brand logos
export const MercedesLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>M</Text>
  </View>
);

export const TeslaLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>T</Text>
  </View>
);

export const BMWLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>B</Text>
  </View>
);

export const ToyotaLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>T</Text>
  </View>
);

export const VolvoLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>V</Text>
  </View>
);

export const BugattiLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>B</Text>
  </View>
);

export const HondaLogo = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>H</Text>
  </View>
);

export const MoreIcon = ({ size = 40, color = '#000' }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.5, color }]}>...</Text>
  </View>
);

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
  },
});

export default {
  MercedesLogo,
  TeslaLogo,
  BMWLogo,
  ToyotaLogo,
  VolvoLogo,
  BugattiLogo,
  HondaLogo,
  MoreIcon,
}; 