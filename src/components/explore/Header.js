import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {COLORS, SPACING, FONT_SIZES} from '../../utils/constants';
import Logo from '../Logo';
import {useTheme} from '../../context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';

const Header = ({isViewingSpecificCar = false, onBackToAllCars}) => {
  const {isDark} = useTheme();
  const {t} = useCurrencyLanguage();
  return (
    <View style={styles.header}>
      <View style={{flexDirection: 'row'}}>
        <Image
          style={styles.logo}
          source={require('../../assets/images/logo.png')}
        />
        <Text
          style={[
            styles.headerTitle,
            {color: isDark ? '#FFFFFF' : COLORS.textDark},
          ]}>
          {t('explore.title')}
        </Text>
      </View>
      {isViewingSpecificCar && (
        <TouchableOpacity style={styles.backButton} onPress={onBackToAllCars}>
          <Text style={styles.backButtonText}>← Back to All Cars</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default Header;
