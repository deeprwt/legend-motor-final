import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {Ionicons} from 'src/utils/icon';
import {useTheme} from '../../context/ThemeContext';

const CheckboxItem = ({
  label,
  isSelected,
  onSelect,
  icon = null,
  colorIndicator = null,
  status = '',
  customStyle = {},
}) => {
  const {isDark} = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.checkboxItem,
        isDark && styles.checkboxItemDark,
        isDark ? {backgroundColor: '#2D2D2D'} : customStyle,
      ]}
      onPress={onSelect}>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </View>

      {colorIndicator && (
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: colorIndicator,
            marginRight: 10,
            borderWidth: 1,
            borderColor: isDark ? '#444444' : '#DDDDDD',
          }}
        />
      )}

      {icon}

      <Text
        style={[
          styles.checkboxLabel,
          isDark && styles.checkboxLabelDark,
          isSelected && styles.selectedLabel,
        ]}>
        {label}
      </Text>

      {/* {status && <Text style={styles.itemStatus}>{status}</Text>} */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxItemDark: {
    borderBottomColor: '#333333',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#F47B20',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#F47B20',
    borderColor: '#F47B20',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
  },
  checkboxLabelDark: {
    color: '#CCCCCC',
  },
  selectedLabel: {
    fontWeight: '600',
  },
  itemStatus: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 'auto',
  },
});

export default CheckboxItem;
