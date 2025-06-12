import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Ionicons} from 'src/utils/icon';
import {useTheme} from '../../context/ThemeContext';

const FilterHeader = ({onBack, title = 'Filters'}) => {
  const {isDark} = useTheme();

  return (
    <View style={[styles.header, isDark && styles.headerDark]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={isDark ? '#FFFFFF' : '#333333'}
        />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    borderBottomColor: '#333333',
    backgroundColor: '#2D2D2D',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
});

export default FilterHeader;
