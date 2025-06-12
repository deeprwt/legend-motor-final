import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import {COLORS, SPACING, BORDER_RADIUS} from '../../utils/constants';
import {useTheme} from 'src/context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';
import {getTranslation} from '../../translations';

const CategoryFilter = () => {
  const {isDark} = useTheme();
  const {selectedLanguage} = useCurrencyLanguage();

  const categories = [
    getTranslation('explore.brands', selectedLanguage),
    getTranslation('explore.trims', selectedLanguage),
    getTranslation('explore.models', selectedLanguage),
    getTranslation('carDetails.year', selectedLanguage),
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryButton,
              {
                backgroundColor: isDark ? '#3D3D3D' : COLORS.white,
                borderColor: isDark ? '#FF8C00' : COLORS.primary,
              },
            ]}>
            <Text
              style={[
                styles.categoryText,
                {color: isDark ? '#FF8C00' : COLORS.primary},
              ]}>
              {category}
            </Text>
            <Text
              style={[
                styles.dropdownIcon,
                {color: isDark ? '#FF8C00' : COLORS.primary},
              ]}>
              ▼
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
    paddingHorizontal: 23,
  },
  scrollContent: {
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  categoryButton: {
    height: 48,
    borderWidth: 2,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginRight: SPACING.md,
    minWidth: 115,
  },
  categoryText: {
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default CategoryFilter;
