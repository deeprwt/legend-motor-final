import React from 'react';
import {View, FlatList, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {AntDesign, Ionicons} from 'src/utils/icon/index';
import {useTheme} from '../../context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';

const FilterTabs = ({categories, activeFilter, onSelect, home = false}) => {
  const {isDark} = useTheme();
  const {t} = useCurrencyLanguage();

  const renderFilterItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item.id && styles.activeFilterButton,
        isDark && styles.filterButtonDark,
      ]}
      onPress={() => onSelect(item.id)}>
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === item.id && styles.activeFilterText,
          isDark && styles.filterButtonTextDark,
        ]}>
        {item.label}{' '}
      </Text>
      <AntDesign
        name={'caretdown'}
        size={8}
        color={
          isDark
            ? '#000'
            : activeFilter === item.id
            ? '#ffffff'
            : COLORS.primary
        }
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.filtersContainer}>
      {home ? null : (
        <Text
          style={[
            styles.filtersTitle,
            {color: isDark ? '#FFFFFF' : COLORS.textDark},
          ]}>
          {t('explore.advancedFilters')}
        </Text>
      )}
      <FlatList
        horizontal
        data={categories}
        renderItem={renderFilterItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filtersList: {
    paddingVertical: SPACING.xs,
    gap: 8,
  },
  filtersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  filterButton: {
    width: 115,
    height: 38,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterButtonDark: {
    // backgroundColor: '#2D2D2D',
    backgroundColor: '#FF8C00',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  filterButtonTextDark: {
    color: '#000',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});

export default FilterTabs;
