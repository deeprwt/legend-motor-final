import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  COLORS,
} from '../../utils/constants';
import {useTheme} from '../../context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';
import {MaterialCommunityIcons} from 'src/utils/icon';
import {Ionicons} from 'src/utils/icon/index';

const EmptyState = ({onClearFilters, brandName, onExploreAll}) => {
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();

  const message = brandName
    ? `${t('emptyState.noCarsForBrand')} ${brandName}`
    : t('emptyState.noCarsForFilters');

  const suggestion = brandName
    ? t('emptyState.suggestionForBrand')
    : t('emptyState.suggestionForFilters');

  return (
    <View
      style={[
        styles.emptyContainer,
        {backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF'},
      ]}>
      <Ionicons
        name="car-sport-outline"
        size={64}
        color={isDark ? '#FFFFFF' : COLORS.primary}
        style={styles.icon}
      />
      <Text
        style={[styles.emptyTitle, {color: isDark ? '#FFFFFF' : '#000000'}]}>
        {t('emptyState.noCarsFound')}
      </Text>
      <Text
        style={[
          styles.emptyDescription,
          {color: isDark ? '#CCCCCC' : '#757575'},
        ]}>
        {message}
      </Text>
      <Text
        style={[
          styles.emptySuggestion,
          {color: isDark ? '#CCCCCC' : '#757575'},
        ]}>
        {suggestion}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={onClearFilters}>
          <Text style={styles.clearButtonText}>
            {t('emptyState.clearFilters')}
          </Text>
        </TouchableOpacity>
        {brandName && (
          <TouchableOpacity
            style={[styles.button, styles.exploreButton]}
            onPress={onExploreAll}>
            <Text style={styles.exploreButtonText}>
              {t('emptyState.exploreAllBrands')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    minHeight: 400,
  },
  icon: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  emptySuggestion: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  button: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 200,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.primary,
  },
  exploreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  exploreButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default EmptyState;
