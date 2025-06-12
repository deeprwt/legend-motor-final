import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {COLORS, SPACING, FONT_SIZES, BORDER_RADIUS} from '../utils/constants';
import {Ionicons} from '../utils/icon';
import {submitCarEnquiry} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useCountryCodes} from '../context/CountryCodesContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import Logo from '../components/Logo';
import LoginPromptModal from '../components/LoginPromptModal';
import {useLoginPrompt} from '../hooks/useLoginPrompt';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import Dhyram from 'src/components/Dhyram';
import {useCurrencyLanguage} from 'src/context/CurrencyLanguageContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const EnquiryFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {user} = useAuth();
  const {countryCodes, loading: loadingCountryCodes} = useCountryCodes();
  const {theme, isDark} = useTheme();

  // Add the login prompt hook
  const {
    loginModalVisible,
    hideLoginPrompt,
    navigateToLogin,
    checkAuthAndShowPrompt,
  } = useLoginPrompt();

  // Get car details from route params
  const {carId, carTitle, carImage, carPrice, currency, onEnquirySubmit} =
    route.params || {};

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sameAsProfile, setSameAsProfile] = useState(false);

  // Success modal state
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  // Already submitted state
  const [alreadySubmittedModalVisible, setAlreadySubmittedModalVisible] =
    useState(false);

  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  const [countrySearch, setCountrySearch] = useState('');
  const [filteredCountryCodes, setFilteredCountryCodes] = useState([]);

  // Get translations
  const {t} = useCurrencyLanguage();

  // Transform API country codes to the format expected by the component
  const formattedCountryCodes = React.useMemo(() => {
    if (!countryCodes || countryCodes.length === 0) return [];

    return countryCodes.map(country => ({
      countryCode: country.dialCode,
      country: country.name,
    }));
  }, [countryCodes]);

  useEffect(() => {
    // Set initial filtered country codes from the API
    if (formattedCountryCodes.length > 0) {
      setFilteredCountryCodes(formattedCountryCodes);
    }
  }, [formattedCountryCodes]);

  // Check authentication when component mounts
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const isAuthorized = await checkAuthAndShowPrompt();
  //     if (!isAuthorized) {
  //       // If not authenticated, the login prompt will show automatically
  //       // We'll stay on this screen until they log in or dismiss the prompt
  //     } else {
  //       // If authenticated, pre-fill form with user data if available
  //       if (user) {
  //         console.log('user', user);
  //       }
  //     }
  //   };

  //   checkAuth();
  // }, [user, checkAuthAndShowPrompt]);

  // Handle checkbox toggle
  const toggleSameAsProfile = () => {
    const newState = !sameAsProfile;
    setSameAsProfile(newState);

    // If toggling on, fill the form with user data
    if (newState && user) {
      setName(user.firstName + ' ' + user.lastName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone || '');

      // Handle phone and country code properly
      if (user.phone) {
        let userPhone = user.phone;
        let userDialCode = user.dialCode || user.countryCode;

        // If we have a dialCode, use it directly
        if (userDialCode) {
          // Make sure dialCode starts with a +
          if (!userDialCode.startsWith('+')) {
            userDialCode = '+' + userDialCode;
          }

          // Set the country code
          setCountryCode(userDialCode);

          // If phone starts with dialCode, remove it
          if (userPhone.startsWith(userDialCode)) {
            setPhoneNumber(userPhone.slice(userDialCode.length).trim());
          } else if (
            userPhone.startsWith('+') &&
            userDialCode.startsWith('+')
          ) {
            // Handle case where phone has + but doesn't match dialCode exactly
            const dialCodeWithoutPlus = userDialCode.substring(1);
            if (userPhone.substring(1).startsWith(dialCodeWithoutPlus)) {
              setPhoneNumber(
                userPhone.substring(1 + dialCodeWithoutPlus.length).trim(),
              );
            } else {
              setPhoneNumber(userPhone.replace(/^\+/, '').trim());
            }
          } else {
            // Just use the phone number as is
            setPhoneNumber(userPhone.replace(/^\+/, '').trim());
          }
        } else {
          // No dialCode, try to extract from the phone number
          if (userPhone.startsWith('+')) {
            // Try to find a matching country code
            let foundCode = false;
            for (const country of formattedCountryCodes) {
              if (userPhone.startsWith(country.countryCode)) {
                setCountryCode(country.countryCode);
                setPhoneNumber(
                  userPhone.slice(country.countryCode.length).trim(),
                );
                foundCode = true;
                break;
              }
            }

            // If no country code found, keep the current one and use phone as is
            if (!foundCode) {
              // Remove the + if it exists and use the current country code
              setPhoneNumber(userPhone.replace(/^\+/, '').trim());
            }
          } else {
            // No + in phone number, just use as is with current country code
            setPhoneNumber(userPhone.trim());
          }
        }
      }

      // Clear any validation errors
      setErrors({
        name: '',
        email: '',
        phoneNumber: '',
      });
    }
  };

  // Format phone number to meet country standards
  const formatPhoneNumber = (phone, code) => {
    if (!phone) return '';

    // Remove any leading zeros
    let formattedPhone = phone.trim();
    while (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Remove any non-digit characters except for the plus sign at the beginning
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');

    // Remove any + sign since we'll add the country code
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Remove the country code if it's already included
    if (code && formattedPhone.startsWith(code.replace('+', ''))) {
      formattedPhone = formattedPhone.substring(code.replace('+', '').length);
    }

    return formattedPhone;
  };

  // Validate the form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phoneNumber: '',
    };

    // Validate name
    if (!name.trim()) {
      newErrors.name = t('enquiryForm.validation.nameRequired');
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = t('enquiryForm.validation.emailRequired');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('enquiryForm.validation.emailInvalid');
      isValid = false;
    }

    // Validate phone number
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t('enquiryForm.validation.phoneRequired');
      isValid = false;
    } else {
      // Basic phone validation - ensure it has enough digits based on country code
      const formattedPhone = formatPhoneNumber(phoneNumber, countryCode);

      // Different country codes have different requirements
      // Here we're just doing a simple length check
      if (formattedPhone.length < 4) {
        // Minimum digits for a valid number
        newErrors.phoneNumber = t('enquiryForm.validation.phoneInvalid');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const {sendEventCleverTap} = useCleverTap();

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Format phone number properly
      const formattedPhone = formatPhoneNumber(phoneNumber, countryCode);

      // Prepare data for API
      const enquiryData = {
        carId: parseInt(carId, 10) || 0, // Ensure carId is a number
        name: name.trim(),
        phoneNumber: formattedPhone, // Send just the formatted number without country code
        emailAddress: email.trim(),
        pageUrl: `https://legendmotorsglobal.com/cars/${carId}`,
        countryCode: countryCode, // Send country code separately
      };

      console.log('Submitting enquiry with data:', JSON.stringify(enquiryData));

      const response = await submitCarEnquiry(enquiryData);

      sendEventCleverTap(CLEVERTAP_EVENTS.INQUIRE_CAR, {
        carId,
        carTitle,
      });
      if (response.success) {
        console.log(
          'Enquiry submitted successfully:',
          JSON.stringify(response.data),
        );

        // Show success modal instead of alert
        setSuccessModalVisible(true);

        // Call the callback if provided
        if (onEnquirySubmit) {
          onEnquirySubmit(true, false);
        }
      } else {
        console.error('Failed to submit enquiry:', response.msg);
        Alert.alert(
          'Error',
          response.msg || 'Failed to submit enquiry. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error in submit handler:', error);

      // Check if this is a 409 conflict (already submitted) error
      if (error.response && error.response.status === 409) {
        console.log('Already submitted inquiry:', error.response.data);

        // Show the already submitted modal instead of an error
        setAlreadySubmittedModalVisible(true);

        // Call the callback if provided, with isAlreadySubmitted=true
        if (onEnquirySubmit) {
          onEnquirySubmit(false, true);
        }
      } else {
        Alert.alert(
          'Error',
          'An error occurred while submitting your enquiry. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close and navigation
  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
    // Navigate after modal is closed
    navigation.goBack();
  };

  // Handle already submitted modal close
  const handleAlreadySubmittedModalClose = () => {
    setAlreadySubmittedModalVisible(false);
    // Navigate after modal is closed
    navigation.goBack();
  };

  // Handle navigation to enquiries screen
  const navigateToEnquiries = () => {
    setSuccessModalVisible(false);
    setAlreadySubmittedModalVisible(false);
    // Set a small timeout to ensure modal is dismissed
    setTimeout(() => {
      // Navigate to the Main tab navigator first, then to the EnquiriesTab
      navigation.navigate('Main', {screen: 'EnquiriesTab'});
    }, 300);
  };

  // Handle going back
  const goBack = () => {
    navigation.goBack();
  };

  // Filter countries based on search
  useEffect(() => {
    if (!countrySearch) {
      setFilteredCountryCodes(formattedCountryCodes);
      return;
    }

    const searchTerm = countrySearch.toLowerCase();
    const filtered = formattedCountryCodes.filter(country =>
      country.country.toLowerCase()?.includes(searchTerm),
    );

    setFilteredCountryCodes(filtered);
  }, [countrySearch, formattedCountryCodes]);

  // Reset country search when modal is closed
  useEffect(() => {
    if (!countryPickerVisible) {
      setCountrySearch('');
    }
  }, [countryPickerVisible]);

  // Render country code item
  const renderCountryCodeItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.countryCodeItem,
        {borderBottomColor: themeColors[theme].border},
      ]}
      onPress={() => {
        setCountryCode(item.countryCode);
        setCountryPickerVisible(false);
      }}>
      <Text
        style={[styles.countryCodeItemText, {color: themeColors[theme].text}]}>
        {item.countryCode} ({item.country})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: themeColors[theme].background},
      ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={themeColors[theme].text}
              />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo width={286} height={115} />
          </View>

          {/* Form Title */}
          <Text style={[styles.formTitle, {color: themeColors[theme].text}]}>
            {t('enquiryForm.title')}
          </Text>

          {/* Car Info */}
          <View
            style={[
              styles.carInfoContainer,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: themeColors[theme].card,
              },
            ]}>
            <View style={styles.carDetailsWrapper}>
              <View style={styles.carInfoLeft}>
                <View style={styles.carTitleContainer}>
                  <Text
                    style={[
                      styles.carTitle,
                      {
                        color: isDark
                          ? themeColors[theme].primary
                          : themeColors[theme].secondary,
                      },
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {carTitle}
                  </Text>
                </View>
                <View style={styles.priceWrapper}>
                  <Text
                    style={[
                      styles.priceLabel,
                      {color: isDark ? '#aaa' : '#757575'},
                    ]}>
                    Price
                  </Text>
                  <Text
                    style={[
                      styles.priceValue,
                      {
                        color: isDark
                          ? themeColors[theme].primary
                          : themeColors[theme].secondary,
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {currency === 'USD' ? (
                      '$'
                    ) : (
                      <Dhyram
                        style={{
                          tintColor: isDark
                            ? themeColors[theme].primary
                            : themeColors[theme].secondary,
                        }}
                      />
                    )}{' '}
                    {carPrice
                      ? Math.floor(carPrice).toLocaleString()
                      : '175,000'}
                  </Text>
                </View>
              </View>
              <View style={styles.carImageContainer}>
                {carImage ? (
                  <Image
                    source={{uri: carImage.uri}}
                    style={styles.carImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.placeholderImage,
                      {
                        backgroundColor: isDark
                          ? '#1A1A1A'
                          : themeColors[theme].card,
                      },
                    ]}>
                    <Ionicons
                      name="car"
                      size={40}
                      color={isDark ? '#666' : '#ccc'}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.baseInput,
                  {
                    backgroundColor: isDark
                      ? '#1A1A1A'
                      : themeColors[theme].background,
                    borderColor: themeColors[theme].border,
                    color: themeColors[theme].text,
                  },
                  errors.name ? styles.inputError : null,
                ]}
                placeholder={t('enquiryForm.namePlaceholder')}
                placeholderTextColor={isDark ? '#666' : '#777'}
                value={name}
                onChangeText={setName}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.baseInput,
                  {
                    backgroundColor: isDark
                      ? '#1A1A1A'
                      : themeColors[theme].background,
                    borderColor: themeColors[theme].border,
                  },
                  errors.email ? styles.inputError : null,
                  styles.iconInputContainer,
                ]}>
                <Ionicons
                  name="mail"
                  size={20}
                  color={isDark ? COLORS.primary : COLORS.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.iconInput, {color: themeColors[theme].text}]}
                  placeholder={t('enquiryForm.emailPlaceholder')}
                  placeholderTextColor={isDark ? '#666' : '#777'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.baseInput,
                  {
                    backgroundColor: isDark
                      ? '#1A1A1A'
                      : themeColors[theme].background,
                    borderColor: themeColors[theme].border,
                  },
                  errors.phoneNumber ? styles.inputError : null,
                  styles.phoneContainer,
                ]}>
                <TouchableOpacity
                  style={[
                    styles.countryCodeButton,
                    {borderRightColor: themeColors[theme].border},
                  ]}
                  onPress={() => setCountryPickerVisible(true)}>
                  <Ionicons
                    name="flag"
                    size={20}
                    color={
                      isDark
                        ? themeColors[theme].primary
                        : themeColors[theme].secondary
                    }
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.countryCodeText,
                      {color: themeColors[theme].text},
                    ]}>
                    {countryCode}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={isDark ? '#666' : '#777'}
                  />
                </TouchableOpacity>
                <TextInput
                  style={[
                    styles.phoneNumberInput,
                    {color: themeColors[theme].text},
                  ]}
                  placeholder={t('enquiryForm.phonePlaceholder')}
                  placeholderTextColor={isDark ? '#666' : '#777'}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={text => {
                    const digitsOnly = text.replace(/\D/g, '');
                    setPhoneNumber(digitsOnly);
                  }}
                />
              </View>
              {errors.phoneNumber ? (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              ) : null}
            </View>

            {/* Auto-fill Checkbox (only if user is authenticated) */}
            {user && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleSameAsProfile}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.checkbox,
                    {borderColor: themeColors[theme].primary},
                    sameAsProfile && {
                      backgroundColor: themeColors[theme].primary,
                      borderColor: themeColors[theme].primary,
                    },
                  ]}>
                  {sameAsProfile && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.checkboxLabel,
                    {color: themeColors[theme].text},
                  ]}>
                  {t('enquiryForm.autoFillProfile')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Country Code Picker Modal */}
            <Modal
              visible={countryPickerVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setCountryPickerVisible(false)}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setCountryPickerVisible(false)}>
                <View
                  style={[
                    styles.modalContent,
                    {
                      backgroundColor: isDark
                        ? '#1A1A1A'
                        : themeColors[theme].background,
                    },
                  ]}
                  onStartShouldSetResponder={() => true}
                  onTouchEnd={e => e.stopPropagation()}>
                  <View
                    style={[
                      styles.modalHeader,
                      {borderBottomColor: themeColors[theme].border},
                    ]}>
                    <Text
                      style={[
                        styles.modalTitle,
                        {color: themeColors[theme].text},
                      ]}>
                      {t('enquiryForm.selectCountryCode')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setCountryPickerVisible(false)}
                      style={styles.closeButton}>
                      <Ionicons
                        name="close"
                        size={24}
                        color={themeColors[theme].text}
                      />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.searchContainer,
                      {
                        backgroundColor: isDark
                          ? '#1A1A1A'
                          : themeColors[theme].card,
                        borderBottomColor: themeColors[theme].border,
                      },
                    ]}>
                    <Ionicons
                      name="search"
                      size={20}
                      color={isDark ? '#666' : '#777'}
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={[
                        styles.searchInput,
                        {color: themeColors[theme].text},
                      ]}
                      placeholder="Search country"
                      placeholderTextColor={isDark ? '#666' : '#777'}
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      autoCapitalize="none"
                    />
                    {countrySearch ? (
                      <TouchableOpacity onPress={() => setCountrySearch('')}>
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={isDark ? '#666' : '#777'}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <FlatList
                    data={filteredCountryCodes}
                    renderItem={renderCountryCodeItem}
                    keyExtractor={item => `${item.country}-${item.countryCode}`}
                    style={styles.countryCodeList}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <View style={styles.noResultsContainer}>
                        <Text
                          style={[
                            styles.noResultsText,
                            {color: isDark ? '#666' : '#777'},
                          ]}>
                          {t('enquiryForm.noCountriesFound')}
                        </Text>
                      </View>
                    }
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {backgroundColor: themeColors[theme].primary},
              ]}
              onPress={handleSubmit}
              disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('enquiryForm.inquireNow')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Success Modal */}
          <Modal
            visible={successModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleSuccessModalClose}>
            <TouchableOpacity
              style={[
                styles.successModalOverlay,
                // {
                //   backgroundColor: isDark
                //     ? 'rgba(255,255,255,0.7)'
                //     : 'rgba(0,0,0,0.7)',
                // },
              ]}
              activeOpacity={1}
              onPress={handleSuccessModalClose}>
              <View
                style={[
                  styles.successModalContent,
                  {
                    backgroundColor: isDark
                      ? '#1A1A1A'
                      : themeColors[theme].background,
                  },
                ]}
                onStartShouldSetResponder={() => true}
                onTouchEnd={e => e.stopPropagation()}>
                <TouchableOpacity
                  style={styles.successModalCloseButton}
                  onPress={handleSuccessModalClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={themeColors[theme].text}
                  />
                </TouchableOpacity>

                <Text
                  style={[
                    styles.successModalTitle,
                    {color: themeColors[theme].secondary},
                  ]}>
                  {t('enquiryForm.successTitle')}
                </Text>

                <Text
                  style={[
                    styles.successModalMessage,
                    {color: themeColors[theme].text},
                  ]}>
                  {t('enquiryForm.successMessage')}
                </Text>

                <View style={styles.successModalButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.successModalButton,
                      {backgroundColor: themeColors[theme].primary},
                    ]}
                    onPress={navigateToEnquiries}>
                    <Text style={styles.successModalButtonText}>
                      {t('enquiryForm.viewMyInquiries')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.successModalButton,
                      styles.successModalSecondaryButton,
                      {borderColor: themeColors[theme].primary},
                    ]}
                    onPress={handleSuccessModalClose}>
                    <Text
                      style={[
                        styles.successModalSecondaryButtonText,
                        {color: themeColors[theme].primary},
                      ]}>
                      {t('enquiryForm.continueExploring')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Already Submitted Modal */}
          <Modal
            visible={alreadySubmittedModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleAlreadySubmittedModalClose}>
            <TouchableOpacity
              style={[styles.successModalOverlay]}
              activeOpacity={1}
              onPress={handleAlreadySubmittedModalClose}>
              <View
                style={[
                  styles.successModalContent,
                  {
                    backgroundColor: isDark
                      ? '#1A1A1A'
                      : themeColors[theme].background,
                  },
                ]}
                onStartShouldSetResponder={() => true}
                onTouchEnd={e => e.stopPropagation()}>
                <TouchableOpacity
                  style={styles.successModalCloseButton}
                  onPress={handleAlreadySubmittedModalClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={themeColors[theme].text}
                  />
                </TouchableOpacity>

                <Text
                  style={[
                    styles.successModalTitle,
                    {color: themeColors[theme].secondary},
                  ]}>
                  {t('enquiryForm.alreadyInquiredTitle')}
                </Text>

                <Text
                  style={[
                    styles.successModalMessage,
                    {color: themeColors[theme].text},
                  ]}>
                  {t('enquiryForm.alreadyInquiredMessage')}
                </Text>

                <View style={styles.successModalButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.successModalButton,
                      {backgroundColor: themeColors[theme].primary},
                    ]}
                    onPress={navigateToEnquiries}>
                    <Text style={styles.successModalButtonText}>
                      {t('enquiryForm.viewMyEnquiries')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.successModalButton,
                      styles.successModalSecondaryButton,
                      {borderColor: themeColors[theme].primary},
                    ]}
                    onPress={handleAlreadySubmittedModalClose}>
                    <Text
                      style={[
                        styles.successModalSecondaryButtonText,
                        {color: themeColors[theme].primary},
                      ]}>
                      {t('enquiryForm.continueExploring')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={loginModalVisible}
        onClose={hideLoginPrompt}
        onLoginPress={navigateToLogin}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
  },
  logoBox: {
    width: 24,
    height: 24,
    backgroundColor: '#5E366D',
    marginHorizontal: 4,
    position: 'relative',
  },
  motorsText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#5E366D',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  carInfoContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 16,
    marginBottom: SPACING.lg,
    marginHorizontal: 2,
  },
  carTitleContainer: {
    marginBottom: 8,
    width: '100%',
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5E366D',
    width: '100%',
    lineHeight: 22,
    flexWrap: 'wrap',
    marginRight: 0,
  },
  carDetailsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  carInfoLeft: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'flex-start',
    maxWidth: '60%',
  },
  priceWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5E366D',
    flexShrink: 1,
  },
  carImageContainer: {
    width: 165,
    height: 153,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 0,
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    marginRight: 4,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  baseInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    height: 56,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: 12,
    // color: '#5E366D',
  },
  iconInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    height: '100%',
    paddingVertical: 14,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    borderRightStyle: 'dashed',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#212121',
    marginRight: 8,
  },
  phoneNumberInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    height: '100%',
    paddingVertical: 14,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F47B20',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#212121',
  },
  submitButton: {
    backgroundColor: '#F47B20',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    height: 60,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.6,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: FONT_SIZES.md,
    color: '#212121',
  },
  countryCodeList: {
    flex: 1,
    width: '100%',
  },
  countryCodeItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    width: '100%',
  },
  countryCodeItemText: {
    fontSize: FONT_SIZES.md,
    color: '#212121',
  },
  noResultsContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    color: '#777',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(107, 101, 101, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  successModalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 1,
  },
  successModalLogoContainer: {
    marginVertical: SPACING.md,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#5E366D',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  successModalMessage: {
    fontSize: 16,
    color: '#212121',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  successModalButtonsContainer: {
    width: '100%',
    marginTop: SPACING.md,
  },
  successModalButton: {
    backgroundColor: '#F47B20',
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successModalSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F47B20',
  },
  successModalSecondaryButtonText: {
    color: '#F47B20',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnquiryFormScreen;
