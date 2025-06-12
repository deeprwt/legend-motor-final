import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Image,
  FlatList,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {getUserProfile, updateUserProfile} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {useCountryCodes} from '../context/CountryCodesContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import BackArrow from '../components/BackArrow';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import DateTimePicker from '@react-native-community/datetimepicker';

// Back Arrow Icon
const BackIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Calendar Icon
const CalendarIcon = ({color = '#212121'}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 2V5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 2V5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.5 9.09H20.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 4.5H5C4.17157 4.5 3.5 5.17157 3.5 6V19C3.5 19.8284 4.17157 20.5 5 20.5H19C19.8284 20.5 20.5 19.8284 20.5 19V6C20.5 5.17157 19.8284 4.5 19 4.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Email Icon
const EmailIcon = ({color = '#7A40C6'}) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M3.333 16.667c-.458 0-.85-.164-1.177-.49A1.605 1.605 0 011.666 15V5c0-.458.164-.85.49-1.177.326-.326.719-.49 1.177-.49h13.334c.458 0 .85.164 1.177.49.326.326.49.719.49 1.177v10c0 .458-.164.85-.49 1.177-.327.326-.72.49-1.178.49H3.333zM10 10.833l6.666-4.166V5L10 9.167 3.333 5v1.667L10 10.833z"
      fill={color}
    />
  </Svg>
);

// Dropdown Icon
const DropdownIcon = ({color = '#212121'}) => (
  <Ionicons name="chevron-down" size={24} color={color} />
);

// Add this custom dropdown icon component after the other icon components
const PickerDropdownIcon = ({color}) => (
  <Ionicons name="chevron-down" size={24} color={color} />
);

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const {user, logout, checkAuthStatus} = useAuth();
  const {theme, isDark} = useTheme();
  const {countryCodes, loading: loadingCountryCodes} = useCountryCodes();
  const {t} = useCurrencyLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    countryCode: '+1', // Default country code for US
    phone: '',
    location: '',
    gender: '',
    profileImage: null,
  });
  const [updating, setUpdating] = useState(false);

  // Replace modals with dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Add a ref for the ScrollView to handle dropdown scrolling
  const dropdownScrollViewRef = React.useRef(null);

  // Transform API country codes data to match the required format for location options
  const locationOptions = React.useMemo(() => {
    if (!countryCodes || countryCodes.length === 0) return [];

    return countryCodes.map(country => ({
      name: country.name,
      code: country.iso2,
    }));
  }, [countryCodes]);

  // Transform API country codes data to match the required format for country code options
  const countryCodeOptions = React.useMemo(() => {
    if (!countryCodes || countryCodes.length === 0) return [];

    return countryCodes.map(country => ({
      code: country.dialCode,
      country: country.name,
      countryCode: country.iso2,
    }));
  }, [countryCodes]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // First try to sync the auth token

      // If user context has data, pre-populate the form
      if (user) {
        setFormData(prevData => ({
          ...prevData,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        }));
      }

      // Then try to get the full profile from API
      const response = await getUserProfile();
      if (response.success && response.data) {
        const profile = response.data;
        console.log('Full profile data:', profile);

        // Format date from API format (YYYY-MM-DD) to display format (MM/DD/YYYY)
        const dateOfBirth = profile.dateOfBirth
          ? formatDateForDisplay(profile.dateOfBirth)
          : '';

        // Get country code from either dialCode (preferred) or countryCode field
        let countryCode = profile.dialCode || profile.countryCode || '1'; // Default to US

        // Format countryCode to ALWAYS include + if it doesn't already
        if (!countryCode.startsWith('+')) {
          countryCode = '+' + countryCode;
        }

        console.log(
          'Profile country/dial code from API:',
          profile.dialCode || profile.countryCode,
        );
        console.log('Formatted country code for UI:', countryCode);

        // Format phone with proper display format based on countryCode
        let formattedPhone = '';
        if (profile.phone) {
          // Get clean phone digits
          const phoneDigits = profile.phone.replace(/\D/g, '');

          // Apply formatting based on country code
          if (countryCode === '+1') {
            // US/Canada format: XXX-XXX-XXXX
            if (phoneDigits.length <= 3) {
              formattedPhone = phoneDigits;
            } else if (phoneDigits.length <= 6) {
              formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(
                3,
              )}`;
            } else {
              formattedPhone = `${phoneDigits.slice(0, 3)}-${phoneDigits.slice(
                3,
                6,
              )}-${phoneDigits.slice(6, 10)}`;
            }
          } else if (countryCode === '+91') {
            // India format: XXXXX XXXXX
            if (phoneDigits.length > 5) {
              formattedPhone = `${phoneDigits.slice(0, 5)} ${phoneDigits.slice(
                5,
              )}`;
            } else {
              formattedPhone = phoneDigits;
            }
          } else {
            // Default format (no special formatting)
            formattedPhone = phoneDigits;
          }
        }

        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          dateOfBirth: dateOfBirth,
          email: profile.email || '',
          countryCode: profile?.dialCode, // Always with + prefix
          phone: formattedPhone,
          location: profile.location || '',
          gender: profile.gender || '',
          profileImage: profile.profileImage ? profile.profileImage.id : null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      await checkAuthStatus();
      // Handle authentication errors
      if (error.message && error.message.includes('Authentication error')) {
      } else {
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display (MM/DD/YYYY)
  const formatDateForDisplay = apiDate => {
    // Convert from YYYY-MM-DD to MM/DD/YYYY
    try {
      if (!apiDate) return '';
      const [year, month, day] = apiDate.split('-');
      return `${month}/${day}/${year}`;
    } catch (e) {
      return apiDate || ''; // Return as is if format is unexpected
    }
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = displayDate => {
    // Convert from MM/DD/YYYY to YYYY-MM-DD
    try {
      if (!displayDate) return '';
      const [month, day, year] = displayDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
      console.error('Error formatting date for API:', e);
      return '';
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = name => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
      // Reset scroll position when opening dropdown
      setTimeout(() => {
        if (dropdownScrollViewRef.current) {
          dropdownScrollViewRef.current.scrollTo({x: 0, y: 0, animated: false});
        }
      }, 100);
    }
  };

  const handleDateChange = date => {
    setShowDateModal(false);
    // Format the date as MM/DD/YYYY for display
    const formattedDate = `${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date
      .getDate()
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
    console.log('formattedDate', formattedDate);
    setFormData(prev => ({...prev, dateOfBirth: formattedDate}));
  };
  // Handle selection for any dropdown
  const handleDropdownSelect = (field, value) => {
    handleChange(field, value);
    setOpenDropdown(null);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert(t('common.error'), t('auth.firstNameRequired'));
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert(t('common.error'), t('auth.lastNameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return false;
    }
    return true;
  };

  const {sendEventCleverTap} = useCleverTap();
  const handleUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    try {
      // Ensure token is synchronized before updating

      // Prepare data for API
      const updateData = {
        ...formData,
        dateOfBirth: formatDateForApi(formData.dateOfBirth),
      };

      // Format the phone number properly for API
      if (updateData.phone) {
        // Remove any formatting (hyphens, spaces, etc.)
        const cleanedPhone = updateData.phone.replace(/[^0-9]/g, '');
        updateData.phone = cleanedPhone;
      }

      // Ensure country code is properly formatted
      if (updateData.countryCode) {
        // API expects country code with "+" prefix
        if (!updateData.countryCode.startsWith('+')) {
          updateData.countryCode = `+${updateData.countryCode}`;
        }

        // Set dialCode field to match countryCode for API consistency
        updateData.dialCode = updateData.countryCode;
      }

      // Remove null, undefined, or empty values to prevent API errors
      Object.keys(updateData).forEach(key => {
        if (
          updateData[key] === null ||
          updateData[key] === undefined ||
          updateData[key] === ''
        ) {
          delete updateData[key];
        }
      });

      let gender = updateData.gender;
      if (gender === 'Prefer not to say') {
        gender = 'Other';
      }
      // Match API expected format - ensure we only send what the API expects
      const apiCompliantData = {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        countryCode: updateData.countryCode,
        phone: updateData.phone,
        gender: gender || undefined,
        location: updateData.location || undefined,
        dateOfBirth: updateData.dateOfBirth || undefined,
        profileImage: updateData.profileImage || undefined,
      };

      console.log(
        'Updating profile with data:',
        JSON.stringify(apiCompliantData),
      );
      const response = await updateUserProfile(apiCompliantData);
      sendEventCleverTap(CLEVERTAP_EVENTS.PROFILE_UPDATE);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      // Enhanced error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        // Extract specific validation errors if they exist
        const errorMessage =
          error.response.data?.message ||
          'An error occurred while updating your profile';
        Alert.alert('Error', errorMessage);
      } else if (
        error.message &&
        error.message.includes('Authentication error')
      ) {
        Alert.alert(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Redirect to login
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login'}],
                });
              },
            },
          ],
        );
      } else {
        Alert.alert('Error', 'An error occurred while updating your profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  // Add gender options
  const genderOptions = ['Male', 'Female', 'Prefer not to say'];

  // Location validation
  const validateLocation = text => {
    // Only allow letters, spaces, commas, and periods in location
    return text.replace(/[^a-zA-Z\s,.]/g, '');
  };

  // Phone validation
  const validatePhone = text => {
    // Only allow numbers
    return text.replace(/[^0-9]/g, '');
  };

  // Get country code from dial code
  const getCountryCodeFromDialCode = dialCode => {
    const country = countryCodeOptions.find(option => option.code === dialCode);
    return country ? country.countryCode : 'US';
  };

  // Get country flag component based on country code
  const getCountryFlag = dialCode => {
    const countryCode = getCountryCodeFromDialCode(dialCode);
    return (
      <Image
        source={{uri: `https://flagsapi.com/${countryCode}/flat/32.png`}}
        style={styles.flagImage}
        resizeMode="cover"
        key={`flag-${dialCode}-${countryCode}`} // Unique key to force re-render
      />
    );
  };

  // Format the phone number as it's being entered
  const formatPhoneNumber = text => {
    // Remove any non-numeric characters
    let cleaned = text.replace(/\D/g, '');

    // Apply different formatting based on country code
    if (formData.countryCode === '+1') {
      // US format: (XXX) XXX-XXXX
      if (cleaned.length > 0) {
        if (cleaned.length <= 3) {
          return cleaned;
        } else if (cleaned.length <= 6) {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        } else {
          return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
            6,
            10,
          )}`;
        }
      }
    } else if (formData.countryCode === '+91') {
      // India format: XXXXX XXXXX
      if (cleaned.length > 5) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
      }
    }

    // Default format for other countries (limit to reasonable length)
    return cleaned.slice(0, 15);
  };

  // Handle phone number input with formatting
  const handlePhoneInput = text => {
    const formatted = formatPhoneNumber(text);
    handleChange('phone', formatted);
  };

  // Handle country code selection with appropriate phone formatting update
  const handleCountrySelect = code => {
    // Store current phone without formatting
    const currentPhone = formData.phone.replace(/\D/g, '');

    // Update country code - use setState directly to ensure UI update
    setFormData({
      ...formData,
      countryCode: code,
    });

    // Re-format phone number according to new country format
    setTimeout(() => {
      const newFormattedPhone = formatPhoneNumber(currentPhone);
      setFormData(prevState => ({
        ...prevState,
        phone: newFormattedPhone,
      }));

      // Close dropdown
      setOpenDropdown(null);

      console.log(
        `Selected country code: ${code}, country: ${getCountryCodeFromDialCode(
          code,
        )}`,
      );
    }, 100);
  };

  // Render the phone input with country code
  const renderPhoneInput = () => {
    const currentCountryCode = formData.countryCode;
    const countryFlagCode = getCountryCodeFromDialCode(currentCountryCode);

    return (
      <View style={styles.phoneInputContainer}>
        {/* <Text style={[styles.inputLabel, {color: themeColors[theme].text}]}>
          Phone Number
        </Text> */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
            },
          ]}>
          <TouchableOpacity
            style={[
              styles.flagContainer,
              {borderRightColor: themeColors[theme].border},
            ]}
            onPress={() => toggleDropdown('countryCode')}>
            <Text
              style={{
                marginRight: 10,
                color: themeColors[theme].text,
                fontWeight: '500',
              }}>
              {currentCountryCode}
            </Text>
            <Image
              source={{
                uri: `https://flagsapi.com/${countryFlagCode}/flat/32.png`,
              }}
              style={styles.flagImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              styles.phoneInput,
              {color: themeColors[theme].text},
            ]}
            placeholder="Phone Number"
            placeholderTextColor={isDark ? '#888888' : '#666666'}
            value={formData.phone}
            onChangeText={handlePhoneInput}
            keyboardType="phone-pad"
            maxLength={15}
            onFocus={() => setOpenDropdown(null)}
          />
        </View>
      </View>
    );
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const years = Array.from(
    {length: 100},
    (_, i) => new Date().getFullYear() - i,
  );
  const months = [
    {value: 1, label: 'Jan'},
    {value: 2, label: 'Feb'},
    {value: 3, label: 'Mar'},
    {value: 4, label: 'Apr'},
    {value: 5, label: 'May'},
    {value: 6, label: 'Jun'},
    {value: 7, label: 'Jul'},
    {value: 8, label: 'Aug'},
    {value: 9, label: 'Sep'},
    {value: 10, label: 'Oct'},
    {value: 11, label: 'Nov'},
    {value: 12, label: 'Dec'},
  ];

  const [datePickerValue, setDatePickerValue] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const days = Array.from(
    {length: getDaysInMonth(datePickerValue?.month, datePickerValue?.year)},
    (_, i) => i + 1,
  );

  // Render the dropdown options for country code
  const renderCountryCodeDropdown = () => {
    if (openDropdown !== 'countryCode') return null;

    return (
      <View
        style={[styles.dropdownOverlay, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
        <View
          style={[
            styles.dropdownPopup,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <Text
            style={[styles.dropdownTitle, {color: themeColors[theme].text}]}>
            {t('auth.selectCountryCode')}
          </Text>

          <FlatList
            data={countryCodeOptions}
            keyExtractor={item => `${item.code}-${item.countryCode}`}
            style={styles.countryList}
            showsVerticalScrollIndicator={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  formData.countryCode === item.code && {
                    backgroundColor: '#F47B20',
                  },
                ]}
                onPress={() => handleCountrySelect(item.code)}>
                <View style={styles.countryInfo}>
                  <Image
                    source={{
                      uri: `https://flagsapi.com/${item.countryCode}/flat/32.png`,
                    }}
                    style={styles.flagImage}
                    resizeMode="cover"
                  />
                  <Text
                    style={[
                      styles.countryText,
                      {
                        color:
                          formData.countryCode === item.code
                            ? '#FFFFFF'
                            : themeColors[theme].text,
                      },
                    ]}>
                    {item.code} {item.country}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setOpenDropdown(null)}>
            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Handle location selection
  const handleLocationSelect = location => {
    handleChange('location', location);
    setOpenDropdown(null);
  };

  // Render the dropdown options for location
  const renderLocationDropdown = () => {
    if (openDropdown !== 'location') return null;

    return (
      <View
        style={[styles.dropdownOverlay, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
        <View
          style={[
            styles.dropdownPopup,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <Text
            style={[styles.dropdownTitle, {color: themeColors[theme].text}]}>
            {t('auth.selectCountry')}
          </Text>

          <FlatList
            data={locationOptions}
            keyExtractor={item => item.code}
            style={styles.countryList}
            showsVerticalScrollIndicator={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  formData.location === item.name && {
                    backgroundColor: '#F47B20',
                  },
                ]}
                onPress={() => {
                  handleLocationSelect(item.name);
                }}>
                <View style={styles.countryInfo}>
                  <Image
                    source={{
                      uri: `https://flagsapi.com/${item.code}/flat/32.png`,
                    }}
                    style={{
                      width: 24,
                      height: 16,
                      borderRadius: 2,
                    }}
                    resizeMode="cover"
                    key={item.code} // Add key to force re-render when location changes
                  />
                  <Text
                    style={[
                      styles.countryText,
                      {
                        color:
                          formData.location === item.name
                            ? '#FFFFFF'
                            : themeColors[theme].text,
                      },
                    ]}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setOpenDropdown(null)}>
            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render the dropdown options for gender
  const renderGenderDropdown = () => {
    if (openDropdown !== 'gender') return null;

    return (
      <View
        style={[styles.dropdownOverlay, {backgroundColor: 'rgba(0,0,0,0.5)'}]}>
        <View
          style={[
            styles.dropdownPopup,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <Text
            style={[styles.dropdownTitle, {color: themeColors[theme].text}]}>
            {t('auth.selectGender')}
          </Text>

          <FlatList
            data={genderOptions}
            keyExtractor={option => option}
            style={styles.countryList}
            showsVerticalScrollIndicator={true}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  formData.gender === item && {
                    backgroundColor: '#F47B20',
                  },
                ]}
                onPress={() => {
                  handleDropdownSelect('gender', item);
                }}>
                <Text
                  style={[
                    styles.countryText,
                    {
                      color:
                        formData.gender === item
                          ? '#FFFFFF'
                          : themeColors[theme].text,
                      textAlign: 'center',
                      alignSelf: 'center',
                      width: '100%',
                    },
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setOpenDropdown(null)}>
            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
        ]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, {color: themeColors[theme].text}]}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View
        style={[styles.header, {borderBottomColor: themeColors[theme].border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackArrow color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
          {t('profile.editProfile')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* First Name */}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
              },
            ]}>
            <TextInput
              style={[styles.input, {color: themeColors[theme].text}]}
              placeholder={t('auth.firstName')}
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={formData.firstName}
              onChangeText={text => handleChange('firstName', text)}
            />
          </View>

          {/* Last Name */}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
              },
            ]}>
            <TextInput
              style={[styles.input, {color: themeColors[theme].text}]}
              placeholder={t('auth.lastName')}
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={formData.lastName}
              onChangeText={text => handleChange('lastName', text)}
            />
          </View>

          {/* Date of Birth - Dropdown */}
          <View style={{marginBottom: 16}}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                  borderBottomLeftRadius:
                    openDropdown === 'dateOfBirth' ? 0 : 10,
                  borderBottomRightRadius:
                    openDropdown === 'dateOfBirth' ? 0 : 10,
                },
              ]}
              onPress={() => setShowDateModal(true)}>
              <Text
                style={[
                  styles.inputGender,
                  {
                    color: formData.dateOfBirth
                      ? themeColors[theme].text
                      : isDark
                      ? '#888888'
                      : '#666666',
                  },
                ]}>
                {formData.dateOfBirth || t('auth.dateOfBirth')}
              </Text>
              <View style={styles.inputIcon}>
                <CalendarIcon color={themeColors[theme].primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
              },
            ]}>
            <TextInput
              style={[styles.input, {color: themeColors[theme].text}]}
              placeholder={t('auth.email')}
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
              editable={false}
            />
            <View style={styles.inputIcon}>
              <EmailIcon color={themeColors[theme].primary} />
            </View>
          </View>

          {/* Location */}
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                },
              ]}
              onPress={() => toggleDropdown('location')}>
              <View style={styles.locationContainer}>
                {formData.location && (
                  <Image
                    source={{
                      uri: `https://flagsapi.com/${
                        locationOptions.find(
                          loc => loc.name === formData.location,
                        )?.code || 'US'
                      }/flat/32.png`,
                    }}
                    style={{
                      width: 24,
                      height: 16,
                      borderRadius: 2,
                    }}
                    resizeMode="cover"
                    key={formData.location}
                  />
                )}
                <Text
                  style={[
                    styles.input,
                    {
                      color: formData.location
                        ? themeColors[theme].text
                        : isDark
                        ? '#888888'
                        : '#666666',
                    },
                  ]}>
                  {formData.location || t('auth.selectCountry')}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={themeColors[theme].text}
                  style={{marginLeft: 5}}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Phone Number with Country Code Dropdown */}
          {renderPhoneInput()}

          {/* Gender Dropdown */}
          <View style={{marginBottom: 16}}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                },
              ]}
              onPress={() => toggleDropdown('gender')}>
              <Text
                style={[
                  styles.inputGender,
                  {
                    color: formData.gender
                      ? themeColors[theme].text
                      : isDark
                      ? '#888888'
                      : '#666666',
                  },
                ]}>
                {formData.gender || t('auth.selectGender')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={themeColors[theme].text}
                style={{marginRight: 16}}
              />
            </TouchableOpacity>
          </View>

          {/* Update Button */}
        </View>
        <TouchableOpacity
          style={[styles.updateButton, updating && styles.disabledButton]}
          onPress={handleUpdate}
          disabled={updating}>
          {updating ? (
            <ActivityIndicator
              size="small"
              color={isDark ? '#000000' : '#FFFFFF'}
            />
          ) : (
            <Text
              color={isDark ? '#000000' : '#FFFFFF'}
              style={styles.updateButtonText}>
              {t('common.save')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Render dropdowns outside of ScrollView */}
      {renderCountryCodeDropdown()}
      {renderLocationDropdown()}
      {renderGenderDropdown()}
      {showDateModal && Platform.OS === 'android' ? (
        <DateTimePicker
          value={selectedDate}
          textColor={isDark ? '#FFFFFF' : '#000000'}
          dateFormat="MM/DD/YYYY"
          mode="date"
          display={'default'}
          onChange={(event, date) => {
            setSelectedDate(date);
            if (Platform.OS === 'android') {
              handleDateChange(date);
            }
          }}
        />
      ) : null}

      <Modal
        // visible={false}
        visible={showDateModal && Platform.OS === 'ios'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <DateTimePicker
              value={selectedDate}
              textColor={isDark ? '#FFFFFF' : '#000000'}
              dateFormat="MM/DD/YYYY"
              mode="date"
              // themeVariant={isDark ? 'dark' : 'light'}
              display={'spinner'}
              onChange={(event, date) => {
                setSelectedDate(date);
              }}
            />
            {/* <>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>
                {t('auth.selectDateOfBirth')}
              </Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <Text style={[styles.closeButton, isDark && styles.textDark]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, isDark && styles.textDark]}>
                  {t('auth.month')}
                </Text>
                <Picker
                  selectedValue={datePickerValue.month}
                  itemStyle={{fontSize: 16}}
                  style={[styles.picker, isDark && styles.pickerDark]}
                  onValueChange={value =>
                    setDatePickerValue(prev => ({...prev, month: value}))
                  }
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                  mode="dropdown"
                  dropdownIcon={() => (
                    <PickerDropdownIcon
                      color={isDark ? '#FFFFFF' : '#000000'}
                    />
                  )}>
                  {months.map(month => (
                    <Picker.Item
                      key={month.value}
                      label={t(`auth.months.${month.label.toLowerCase()}`)}
                      value={month.value}
                      color={isDark ? '#FFFFFF' : '#000000'}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, isDark && styles.textDark]}>
                  {t('auth.day')}
                </Text>
                <Picker
                  itemStyle={{fontSize: 16}}
                  selectedValue={datePickerValue.day}
                  style={[styles.picker, isDark && styles.pickerDark]}
                  onValueChange={value =>
                    setDatePickerValue(prev => ({...prev, day: value}))
                  }
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                  mode="dropdown"
                  dropdownIcon={() => (
                    <PickerDropdownIcon
                      color={isDark ? '#FFFFFF' : '#000000'}
                    />
                  )}>
                  {days.map(day => (
                    <Picker.Item
                      key={day}
                      label={String(day)}
                      value={day}
                      color={isDark ? '#FFFFFF' : '#000000'}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={[styles.pickerLabel, isDark && styles.textDark]}>
                  {t('auth.year')}
                </Text>
                <Picker
                  selectedValue={datePickerValue.year}
                  style={[styles.picker, isDark && styles.pickerDark]}
                  itemStyle={{fontSize: 16}}
                  onValueChange={value =>
                    setDatePickerValue(prev => ({...prev, year: value}))
                  }
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                  mode="dropdown"
                  dropdownIcon={() => (
                    <PickerDropdownIcon
                      color={isDark ? '#FFFFFF' : '#000000'}
                    />
                  )}>
                  {years.map(year => (
                    <Picker.Item
                      key={year}
                      label={String(year)}
                      value={year}
                      color={isDark ? '#FFFFFF' : '#000000'}
                    />
                  ))}
                </Picker>
              </View>
            </View>

           
            </> */}
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleDateChange(selectedDate)}>
                <Text style={styles.confirmButtonText}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: '#F47B20',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  formContainer: {
    paddingVertical: 16,
    paddingBottom: 0,
  },
  inputContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 10,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputGender: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    height: '100%',
    marginTop: 30,
  },
  dropdownInput: {
    paddingVertical: 5,
  },
  phoneInput: {
    paddingLeft: 8,
    marginLeft: 40,
  },
  inputIcon: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    borderRightWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  updateButton: {
    backgroundColor: '#F47B20',
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: {
    backgroundColor: '#F8C4A6',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    marginTop: -1,
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    justifyContent: 'center',
    height: 45,
  },
  dropdownItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
  phoneInputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dropdownPopup: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    marginBottom: 4,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  flagImage: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },
  countryText: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#F47B20',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  modalContentDark: {
    backgroundColor: '#2D2D2D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  textDark: {
    color: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666666',
    padding: 5,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 0,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
    fontWeight: '500',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerDark: {
    color: '#FFFFFF',
  },
});

export default EditProfileScreen;
