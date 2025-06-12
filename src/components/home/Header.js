import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ImagePlaceholder} from '../common';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';
import {useTheme} from '../../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {getTranslation} from '../../translations';

const Header = ({user, onSettingsPress, onWishlistPress}) => {
  console.log('user', user);
  const {selectedCurrency, setSelectedCurrency, selectedLanguage} =
    useCurrencyLanguage();
  const {isDark} = useTheme();

  // Get firstName from user object or use default
  const getFirstName = () => {
    if (!user) return getTranslation('common.user', selectedLanguage);

    let name =
      user.firstName || getTranslation('common.user', selectedLanguage);

    // If the firstName looks like an email address, extract just the first part
    if (name.includes('@')) {
      // Extract part before @ symbol
      name = name.split('@')[0];
    }

    // If the name contains dots (like "gopal.khandelwal"), take only the first part
    if (name.includes('.')) {
      name = name.split('.')[0];
    }

    // Capitalize the first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const toggleCurrency = currency => {
    setSelectedCurrency(currency);
  };
  const navigation = useNavigation();
  const getProfileImageUrl = () => {
    if (user && user.profileImage) {
      const image = user.profileImage;

      return `https://cdn.staging.legendmotorsglobal.com${image.path}`;
    } else {
      return null;
      // return 'https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png';
    }
  };
  return (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ProfileTab');
          }}>
          {getProfileImageUrl() ? (
            <ImagePlaceholder
              img={{uri: getProfileImageUrl()}}
              style={styles.profileImage}
              color={isDark ? '#3D3D3D' : '#ccd'}
            />
          ) : (
            <ImagePlaceholder
              img={require('../../assets/images/profile.jpg')}
              style={styles.profileImage}
              color={isDark ? '#3D3D3D' : '#ccd'}
            />
          )}
        </TouchableOpacity>
        <View style={styles.greetingSection}>
          <Text
            style={[
              styles.greetingText,
              {color: isDark ? '#FFFFFF' : COLORS.textLight},
            ]}>
            {getTranslation('common.greeting', selectedLanguage)}{' '}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.nameText,
              {color: isDark ? '#FFFFFF' : COLORS.textDark},
            ]}>
            {getFirstName()}!
          </Text>
        </View>
      </View>

      <View style={styles.headerControls}>
        {user?.email ? (
          <View
            style={[
              styles.currencyToggle,
              {backgroundColor: isDark ? '#1A1A1A' : COLORS.white},
            ]}>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                selectedCurrency === 'AED'
                  ? isDark
                    ? styles.activeCurrencyButtonDark
                    : styles.activeCurrencyButton
                  : {},
              ]}
              onPress={() => toggleCurrency('AED')}>
              <Text
                style={[
                  selectedCurrency === 'AED'
                    ? isDark
                      ? {color: '#000'}
                      : styles.activeText
                    : isDark
                    ? {color: '#9E86A8'}
                    : styles.currencyText,
                  styles.toggleText,
                ]}>
                AED
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                selectedCurrency === 'USD'
                  ? isDark
                    ? styles.activeCurrencyButtonDark
                    : styles.activeCurrencyButton
                  : {},
              ]}
              onPress={() => toggleCurrency('USD')}>
              <Text
                style={[
                  selectedCurrency === 'USD'
                    ? isDark
                      ? {color: '#000'}
                      : styles.activeText
                    : isDark
                    ? {color: '#9E86A8'}
                    : styles.currencyText,
                  styles.toggleText,
                ]}>
                USD
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {user?.email ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              navigation.navigate('Notification');
            }}>
            <Ionicons
              name="notifications"
              size={24}
              color={isDark ? '#9E86A8' : '#5E366D'}
            />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.iconButton} onPress={onWishlistPress}>
          <Ionicons
            name="heart"
            size={24}
            color={isDark ? '#9E86A8' : '#5E366D'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greetingSection: {
    marginLeft: SPACING.md,
  },
  greetingText: {
    fontSize: FONT_SIZES.md,
  },
  nameText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    // flex: 1,
    width: Dimensions.get('window').width * 0.4,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyToggle: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 1,
    borderColor: COLORS.currency,
  },
  currencyButton: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    // minWidth: 40,
    alignItems: 'center',
  },
  activeCurrencyButton: {
    backgroundColor: COLORS.currency,
    borderRadius: BORDER_RADIUS.xl,
  },
  activeCurrencyButtonDark: {
    backgroundColor: '#9E86A8',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.currency,
  },
  currencyText: {
    fontWeight: '500',
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  activeText: {
    color: COLORS.white,
  },
  toggleText: {
    fontSize: 11,
  },
  iconButton: {
    marginLeft: SPACING.md,
  },
});

export default Header;
