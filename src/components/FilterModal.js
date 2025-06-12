import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FilterTrigger = ({ initialFilter = 'brands', onApplyCallback }) => {
  const navigation = useNavigation();
  
  const handleOpenFilter = () => {
    navigation.navigate('FilterScreen', {
      filterType: initialFilter,
      onApplyCallback
    });
  };
  
  return (
    <TouchableOpacity 
      style={styles.filterButton}
      onPress={handleOpenFilter}
    >
      <Text style={styles.filterButtonText}>Filters</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    padding: 10,
    backgroundColor: '#F4821F',
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default FilterTrigger; 