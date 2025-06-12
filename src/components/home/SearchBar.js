import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {FilterIcon} from '../icons';
import {COLORS, SPACING, BORDER_RADIUS} from '../../utils/constants';
import {Ionicons} from 'src/utils/icon';
import {useTheme} from '../../context/ThemeContext';

let timer = null;
const SearchBar = ({
  searchQuery = '',
  onSearch,
  onClearSearch,
  disabled = false,
  onApplyFilters,
  currentFilters = {},
  home = false,
}) => {
  const {isDark} = useTheme();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const isFirstRender = useRef(true);
  const navigation = useNavigation();
  const isNavigating = useRef(false);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleOpenFilter = () => {
    navigation.navigate('FilterScreen', {
      filterType: 'brands',
      onApplyCallback: handleFilterApply,
      currentFilters: currentFilters,
    });
  };

  const handleFilterApply = filters => {
    if (filters && onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const handleTextChange = text => {
    setLocalSearchQuery(text);
    if (onSearch && !home) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        onSearch(text);
      }, 500);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    if (onClearSearch) {
      onClearSearch();
    }
  };

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchSection,
          disabled && styles.disabledSearch,
          isDark && styles.searchSectionDark,
        ]}>
        <TouchableOpacity
          style={[styles.filterButton, isDark && styles.filterButtonDark]}
          onPress={handleOpenFilter}
          disabled={disabled}>
          <Text
            style={[
              styles.filterText,
              disabled && styles.disabledText,
              isDark && styles.filterTextDark,
            ]}>
            Filter
          </Text>
          <Text
            style={[
              styles.filterIcon,
              disabled && styles.disabledText,
              isDark && styles.filterIconDark,
            ]}>
            ▼
          </Text>
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <View style={styles.searchIconLeft}>
            <Ionicons
              name="search"
              size={20}
              color={disabled ? '#C0C0C0' : isDark ? '#FFFFFF' : '#5E366D'}
            />
          </View>
          <TextInput
            style={[
              styles.searchInput,
              disabled && styles.disabledInput,
              isDark && styles.searchInputDark,
            ]}
            numberOfLines={1}
            placeholder="Search by Keywords, Body type.."
            placeholderTextColor={
              disabled
                ? '#C0C0C0'
                : isDark
                ? '#CCCCCC'
                : COLORS.inputPlaceholder
            }
            value={localSearchQuery}
            onChangeText={handleTextChange}
            editable={!disabled}
            onSubmitEditing={() => {
              if (home) setLocalSearchQuery('');
              onSearch(localSearchQuery);
            }}
            enterKeyHint="search"
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
              disabled={disabled}>
              <Ionicons
                name="close-circle"
                size={18}
                color={disabled ? '#C0C0C0' : isDark ? '#FFFFFF' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconRight}
          onPress={handleOpenFilter}
          disabled={disabled}>
          <FilterIcon size={20} color={disabled ? '#C0C0C0' : COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginBottom: SPACING.sm,
  },
  searchSection: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#9E86A7',
    height: 44,
    overflow: 'hidden',
    alignItems: 'center',
  },
  searchSectionDark: {
    backgroundColor: '#2D2D2D',
    borderColor: '#6D3E7E',
  },
  disabledSearch: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
  },
  filterButton: {
    backgroundColor: '#DFD8E2',
    height: '100%',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22%',
    borderRightWidth: 1,
    borderRightColor: '#9E86A7',
  },
  filterButtonDark: {
    backgroundColor: '#6D3E7E',
    borderRightColor: '#6D3E7E',
  },
  filterText: {
    color: '#6f4a8e',
    fontWeight: '600',
    marginRight: SPACING.xs,
    fontSize: 16,
  },
  filterTextDark: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#a0a0a0',
  },
  filterIcon: {
    fontSize: 10,
    color: '#6f4a8e',
  },
  filterIconDark: {
    color: '#FFFFFF',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchIconLeft: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#555',
  },
  searchInputDark: {
    color: '#FFFFFF',
  },
  disabledInput: {
    color: '#a0a0a0',
  },
  filterIconRight: {
    paddingHorizontal: SPACING.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  resultText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default SearchBar;
