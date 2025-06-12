import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context/ThemeContext';

const FilterFooter = ({onReset, onApply, selectedCount = 0}) => {
  const {isDark} = useTheme();

  return (
    <View style={[styles.footer, isDark && styles.footerDark]}>
      <TouchableOpacity
        style={[styles.resetButton, isDark && styles.resetButtonDark]}
        onPress={onReset}>
        <Text
          style={[
            styles.resetButtonText,
            isDark && styles.resetButtonTextDark,
          ]}>
          Reset
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.applyButton} onPress={onApply}>
        <Text style={styles.applyButtonText}>
          Apply {selectedCount > 0 ? `(${selectedCount})` : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  footerDark: {
    borderTopColor: '#333333',
    backgroundColor: '#2D2D2D',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 25,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FCE8CD',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  resetButtonDark: {
    backgroundColor: '#4D3D2D',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  resetButtonTextDark: {
    color: '#FFFFFF',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 25,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F47B20',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterFooter;
