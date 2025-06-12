import React from 'react';
import {View, FlatList, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

const FilterList = ({filterItems, activeFilter, onSelect}) => {
  const {isDark} = useTheme();

  const renderFilterItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        activeFilter === item.id && styles.activeFilterItem,
        isDark && styles.filterItemDark,
        isDark && activeFilter === item.id && styles.activeFilterItemDark,
      ]}
      onPress={() => onSelect(item.id)}>
      <Text
        style={[
          styles.filterItemText,
          activeFilter === item.id && styles.activeFilterItemText,
          isDark && styles.filterItemTextDark,
          isDark && activeFilter === item.id && styles.activeFilterItemTextDark,
        ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.filterList, isDark && styles.filterListDark]}>
      <FlatList
        data={filterItems}
        renderItem={renderFilterItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterList: {
    width: '35%',
    backgroundColor: '#FCE8CD',
    paddingVertical: 12,
  },
  filterListDark: {
    backgroundColor: '#382E1E',
  },
  filterItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterItemDark: {
    backgroundColor: '#382E1E',
  },
  activeFilterItem: {
    backgroundColor: '#FFFFFF',
    // borderLeftWidth: 3,
    borderLeftColor: '#F47B20',
  },
  activeFilterItemDark: {
    backgroundColor: '#1A1A1A',
    borderLeftColor: '#F47B20',
  },
  filterItemText: {
    fontSize: 16,
    color: '#000000',
  },
  filterItemTextDark: {
    color: '#CCCCCC',
  },
  activeFilterItemText: {
    color: '#F47B20',
    fontWeight: '600',
  },
  activeFilterItemTextDark: {
    color: '#F47B20',
    fontWeight: '600',
  },
});

export default FilterList;
