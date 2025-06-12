import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {useTheme, themeColors} from '../../context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';

const ResultsHeader = ({
  totalCars,
  searchQuery = '',
  isViewingSpecificCar = false,
  carId = '',
  filteredBySearch = false,
  hasFilters = false,
  onClearFilters,
  categoryTitle = '',
}) => {
  const {isDark, theme} = useTheme();
  const {t} = useCurrencyLanguage();

  // Format number with commas
  const formatNumber = num => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Determine the appropriate text to display
  const getResultsText = () => {
    if (isViewingSpecificCar) {
      return (
        <Text
          style={[styles.resultsText, {color: isDark ? '#FFFFFF' : '#000000'}]}>
          {t('resultsHeader.viewingCarDetails', {carId: carId || 'unknown'})}
        </Text>
      );
    } else if (categoryTitle) {
      // Show category title if present (Hot Deals, Just Arrived, Most Popular)
      return (
        <Text
          style={[
            styles.categoryTitle,
            {color: isDark ? '#FFFFFF' : '#000000'},
          ]}>
          {categoryTitle} ({totalCars} {t('common.cars')})
        </Text>
      );
    } else if (filteredBySearch && searchQuery) {
      return (
        <View style={styles.searchResultsContainer}>
          <Text
            style={[
              styles.resultsText,
              {color: isDark ? '#FFFFFF' : '#000000'},
            ]}>
            {t('resultsHeader.resultsFor')}
            {searchQuery}
          </Text>
        </View>
      );
    } else if (hasFilters) {
      return (
        <Text
          style={[styles.resultsText, {color: isDark ? '#FFFFFF' : '#000000'}]}>
          {t('resultsHeader.showingCars')} {totalCars}
        </Text>
      );
    } else {
      return (
        <Text
          style={[styles.resultsText, {color: isDark ? '#FFFFFF' : '#000000'}]}>
          {t('resultsHeader.totalCars')} {totalCars}
        </Text>
      );
    }
  };

  const getCountText = () => {
    if (filteredBySearch && searchQuery) {
      return (
        <Text style={styles.totalCountText}>
          {formatNumber(totalCars)} {t('resultsHeader.found')}
        </Text>
      );
    }
    return null;
  };

  return (
    <View
      style={[
        styles.resultsHeader,
        {borderBottomColor: isDark ? '#444444' : '#F0F0F0'},
      ]}>
      <View style={styles.resultTextContainer}>{getResultsText()}</View>

      <View style={styles.rightContainer}>
        {getCountText()}

        {!isViewingSpecificCar && (hasFilters || filteredBySearch) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={onClearFilters}>
            <Text style={styles.clearFiltersText}>
              {t('resultsHeader.clear')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  resultTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchQueryText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalCountText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.md,
  },
  clearFiltersButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  clearFiltersText: {
    fontSize: FONT_SIZES.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResultsHeader;
