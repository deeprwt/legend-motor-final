import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  InteractionManager,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import {Picker} from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';
import {registerUser, updateUserProfile} from '../services/api';
import api from '../services/api';
import {useTheme, themeColors} from '../context/ThemeContext';
import {useAuth} from 'src/context/AuthContext';
import {useCountryCodes} from 'src/context/CountryCodesContext';
import FlagIcon from 'src/components/common/FlagIcon';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import {Ionicons} from '../utils/icon';
import {COLORS} from 'src/utils/constants';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const FillProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [registrationToken, setRegistrationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const {theme, isDark} = useTheme();
  const [openDropdown, setOpenDropdown] = useState(null);
  const {countryCodes} = useCountryCodes();
  const {t} = useCurrencyLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+971', // Default country code for US
    phone: '',
    location: '',
    dateOfBirth: new Date(),
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [sso, setSso] = useState(false);

  const [datePickerValue, setDatePickerValue] = useState({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const {sendEventCleverTap} = useCleverTap();

  const {user} = useAuth();
  const [tempProfileImageId, setTempProfileImageId] = useState(null);

  useEffect(() => {
    sendEventCleverTap(CLEVERTAP_EVENTS.PROFILE_INCOMPLETE);
    if (route.params?.registrationToken) {
      setRegistrationToken(route.params?.registrationToken ?? '');
      setFormData(prev => ({...prev, email: route?.params?.email ?? ''}));
    } else if (route.params?.sso) {
      setSso(true);
      setFormData(prev => ({
        ...prev,
        email: user?.email ?? '',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
      }));
    }
    // Reset tempProfileImageId when component mounts
    setTempProfileImageId(null);
  }, [route.params, user]);

  // Add effect to handle profile image changes
  useEffect(() => {
    if (tempProfileImageId) {
      console.log('tempProfileImageId updated:', tempProfileImageId);
    }
  }, [tempProfileImageId]);

  // Get country code from dial code
  const getCountryCodeFromDialCode = dialCode => {
    const country = countryCodes.find(option => option.dialCode === dialCode);
    return country ? country.iso2 : 'AE';
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
    setFormData(prev => ({...prev, phone: formatted}));
  };

  // Handle country code selection with appropriate phone formatting update
  const handleCountrySelect = code => {
    // Store current phone without formatting
    const currentPhone = formData.phone.replace(/\D/g, '');

    // Update country code
    setFormData(prev => ({
      ...prev,
      countryCode: code,
    }));

    // Re-format phone number according to new country format
    setTimeout(() => {
      const newFormattedPhone = formatPhoneNumber(currentPhone);
      setFormData(prev => ({
        ...prev,
        phone: newFormattedPhone,
      }));
      setOpenDropdown(null);
    }, 100);
  };

  // Render the phone input with country code
  const renderPhoneInput = () => {
    const currentCountryCode = formData.countryCode;
    const countryFlagCode = getCountryCodeFromDialCode(currentCountryCode);

    return (
      <View style={styles.phoneInputContainer}>
        <View
          style={[styles.phoneContainer, isDark && styles.phoneContainerDark]}>
          <TouchableOpacity
            style={[styles.countryCode, isDark && styles.countryCodeDark]}
            onPress={() => setOpenDropdown('countryCode')}>
            <Text style={[styles.countryCodeText, isDark && styles.textDark]}>
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
            style={[styles.phoneInput, isDark && styles.inputDark]}
            placeholder={t('auth.phoneNumber')}
            placeholderTextColor={'#666666'}
            value={formData.phone}
            onChangeText={handlePhoneInput}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>
      </View>
    );
  };

  // Render the dropdown options for country code
  const renderCountryCodeDropdown = () => {
    if (openDropdown !== 'countryCode') return null;
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              {t('auth.selectCountryCode')}
            </Text>

            <FlatList
              data={countryCodes}
              keyExtractor={(item, index) =>
                item.iso2?.toString() + index?.toString()
              }
              style={styles.countryList}
              showsVerticalScrollIndicator={true}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    formData.countryCode === item.dialCode &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => handleCountrySelect(item.dialCode)}>
                  <View style={styles.countryInfo}>
                    <Image
                      source={{
                        uri: `https://flagsapi.com/${item?.iso2}/flat/32.png`,
                      }}
                      style={styles.flagImage}
                      resizeMode="cover"
                    />
                    <Text
                      style={[
                        styles.countryText,
                        isDark && styles.textDark,
                        formData.countryCode === item.code &&
                          styles.selectedCountryText,
                      ]}>
                      {item.dialCode}
                      {`  `} {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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

  const days = Array.from(
    {length: getDaysInMonth(datePickerValue.month, datePickerValue.year)},
    (_, i) => i + 1,
  );

  const isFormValid = () => {
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
    if (!formData.password && !sso) {
      Alert.alert(t('common.error'), t('auth.passwordRequired'));
      return false;
    }
    if (formData.password !== formData.confirmPassword && !sso) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleImagePick = () => {
    // Use InteractionManager to ensure the UI is ready
    InteractionManager.runAfterInteractions(() => {
      try {
        const options = {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 800,
          maxWidth: 800,
          quality: 0.8,
          selectionLimit: 1,
        };

        console.log('Starting image picker...');

        if (Platform.OS === 'android') {
          // For Android, use the modern approach
          ImagePicker.launchImageLibrary(options)
            .then(result => {
              if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
              }

              if (result.errorCode) {
                console.log('ImagePicker Error:', result.errorMessage);
                setTimeout(() => {
                  Alert.alert(
                    'Error',
                    'Failed to select image. Please try again.',
                  );
                }, 100);
                return;
              }

              if (result.assets && result.assets.length > 0) {
                console.log('Image selected:', result.assets[0]);
                // Upload the selected image
                uploadProfileImage(result.assets[0]);
              }
            })
            .catch(error => {
              console.error('Image picker error:', error);
              setTimeout(() => {
                Alert.alert(
                  'Error',
                  'Failed to open image picker. Please try again.',
                );
              }, 100);
            });
        } else {
          // For iOS, we can use the async/await approach
          ImagePicker.launchImageLibrary(options)
            .then(result => {
              if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
              }

              if (result.errorCode) {
                console.log('ImagePicker Error: ', result.errorMessage);
                Alert.alert(
                  'Error',
                  'Failed to select image. Please try again.',
                );
                return;
              }

              if (result.assets && result.assets.length > 0) {
                // Upload the selected image
                uploadProfileImage(result.assets[0]);
              }
            })
            .catch(error => {
              console.error('Image picker error:', error);
              Alert.alert(
                'Error',
                'Failed to open image picker. Please try again.',
              );
            });
        }
      } catch (error) {
        console.error('Image picker error:', error);
        setTimeout(() => {
          Alert.alert(
            'Error',
            'Failed to open image picker. Please try again.',
          );
        }, 100);
      }
    });
  };

  const uploadProfileImage = async imageAsset => {
    try {
      setUploadingImage(true);

      // First, upload the image to get an image ID
      const formData = new FormData();
      formData.append('file', {
        name: imageAsset.fileName || 'profile.jpg',
        type: imageAsset.type,
        uri: imageAsset.uri,
      });

      console.log('Uploading image with formData:', formData);

      // Make API call to upload image
      const uploadResult = await api.post('/file-system/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-parent-folder': 'profiles',
        },
      });
      console.log('Upload Result:', uploadResult);
      console.log('Upload Result Data:', uploadResult.data);

      // Store just the ID from the response
      if (uploadResult?.data?.id) {
        console.log('Setting tempProfileImageId to:', uploadResult.data.id);
        setTempProfileImageId(uploadResult.data.id); // This will be used in registration
        setProfileImage(imageAsset.uri); // This is just for UI preview
      } else {
        console.error('No image ID in upload response:', uploadResult);
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      Alert.alert(
        'Error',
        'Failed to upload profile picture. Please try again.',
      );
    } finally {
      setUploadingImage(false);
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

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    try {
      setLoading(true);

      // const formattedDate = formData.dateOfBirth.toISOString().split('T')[0];

      const formattedPhone = formData.phone.startsWith('+')
        ? formData.phone
        : `+${formData.phone}`;

      console.log('Current tempProfileImageId:', tempProfileImageId);
      let gender = formData.gender;
      if (gender === 'Prefer not to say') {
        gender = 'Other';
      }
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phone: formattedPhone,
        location: formData.location || null,
        gender: gender || null,
        email: formData.email,
        password: formData.password,
        registrationToken: registrationToken,
        countryCode: formData.countryCode,
      };

      // Add just the image ID if available
      if (tempProfileImageId) {
        console.log(
          'Adding profileImage ID to registration data:',
          tempProfileImageId,
        );
        registrationData.profileImage = tempProfileImageId; // Just passing the ID
      } else {
        console.log('No tempProfileImageId available for registration');
      }

      console.log(
        'Final registration payload:',
        JSON.stringify(registrationData),
      );

      if (sso) {
        delete registrationData.registrationToken;
      }
      const response = sso
        ? await updateUserProfile(registrationData)
        : await registerUser(registrationData);

      console.log('Registration/Update response:', response);

      sendEventCleverTap(CLEVERTAP_EVENTS.PROFILE_UPDATE);

      // If registration is successful, store the registration token in route params
      if (response.registrationToken) {
        navigation.setParams({
          registrationToken: response.registrationToken,
        });
      }

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully! Please login with your credentials.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (sso) {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Main'}],
                });
              } else {
                sendEventCleverTap(CLEVERTAP_EVENTS.WELCOME);

                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Login',
                      params: {
                        email: formData.email,
                        fromRegistration: true,
                      },
                    },
                  ],
                });
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Registration error:', error);

      // Log more detailed error information
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
      }

      Alert.alert('Registration Failed', error.toString());
    } finally {
      setLoading(false);
    }
  };

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Handle location selection
  const handleLocationSelect = location => {
    setFormData(prev => ({...prev, location}));
    setOpenDropdown(null);
  };

  // Render the dropdown options for location
  const renderLocationDropdown = () => {
    if (openDropdown !== 'location') return null;

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpenDropdown(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>
              {t('auth.selectCountry')}
            </Text>

            <FlatList
              data={countryCodes}
              keyExtractor={(item, index) =>
                item.iso2?.toString() + index?.toString()
              }
              style={styles.countryList}
              showsVerticalScrollIndicator={true}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    formData.location === item.name &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => handleLocationSelect(item.name)}>
                  <View style={styles.countryInfo}>
                    <Image
                      source={{
                        uri: `https://flagsapi.com/${item?.iso2}/flat/32.png`,
                      }}
                      style={styles.flagImage}
                      resizeMode="cover"
                    />

                    <Text
                      style={[
                        styles.countryText,
                        isDark && styles.textDark,
                        formData.location === item.name &&
                          styles.selectedCountryText,
                      ]}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  // Render the location input
  const renderLocationInput = () => {
    return (
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[
            styles.locationContainer,
            isDark && styles.locationContainerDark,
          ]}
          onPress={() => setOpenDropdown('location')}>
          <View style={styles.locationContent}>
            {formData.location && (
              <Image
                source={{
                  uri: `https://flagsapi.com/${
                    countryCodes.find(loc => loc.name === formData.location)
                      ?.iso2 ?? 'AE'
                  }/flat/32.png`,
                }}
                style={styles.flagImage}
                resizeMode="cover"
              />
            )}
            <Text
              style={[
                styles.locationText,
                isDark && styles.textDark,
                !formData.location && styles.placeholderText,
              ]}>
              {formData.location || t('auth.selectCountry')}
            </Text>
          </View>
          <Ionicons
            name="chevron-down"
            size={18}
            color={themeColors[theme].text}
            style={{marginRight: 3}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // Add this custom dropdown icon component after the other icon components
  const PickerDropdownIcon = ({color}) => (
    <Ionicons name="chevron-down" size={24} color={color} />
  );

  // Add gender options array at the top with other constants
  const genderOptions = ['Male', 'Female', 'Prefer not to say'];

  // Add this function after the state declarations
  const handleDropdownSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setOpenDropdown(null);
  };

  // Add this function to toggle dropdown
  const toggleDropdown = name => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <ScrollView style={isDark ? styles.containerDark : styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <BackArrow color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>
            {t('auth.fillProfile')}
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            {uploadingImage ? (
              <View style={styles.loadingAvatarContainer}>
                <ActivityIndicator size="large" color="#F47B20" />
              </View>
            ) : (
              <Image
                source={
                  profileImage
                    ? {uri: profileImage}
                    : route.params?.user?.profileImage
                    ? {
                        uri: `https://cdn.legendmotorsglobal.com${route.params.user.profileImage.path}`,
                      }
                    : route.params?.registrationToken
                    ? require('../assets/images/profile.jpg')
                    : require('../assets/images/profile.jpg')
                }
                style={[styles.profileImage, {borderRadius: 50}]}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('auth.firstName')}
              value={formData.firstName}
              onChangeText={text =>
                setFormData(prev => ({...prev, firstName: text}))
              }
              placeholderTextColor={'#666666'}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('auth.lastName')}
              value={formData.lastName}
              onChangeText={text =>
                setFormData(prev => ({...prev, lastName: text}))
              }
              placeholderTextColor={'#666666'}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('auth.email')}
              value={formData.email}
              onChangeText={text =>
                setFormData(prev => ({...prev, email: text}))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              placeholderTextColor={'#666666'}
            />
            <Ionicons
              name={'mail-outline'}
              size={22}
              style={styles.inputIcon}
              color={COLORS.primary}
            />
          </View>

          {renderPhoneInput()}

          {renderLocationInput()}

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDateModal(true)}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('auth.dateOfBirth')}
              value={formData.dateOfBirth}
              editable={false}
              placeholderTextColor={'#666666'}
            />
            <Ionicons
              name={'calendar-outline'}
              size={22}
              style={styles.inputIcon}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  borderColor: themeColors[theme].border,
                  backgroundColor: isDark ? '#1A1A1A' : '#FAFAFA',
                },
              ]}
              onPress={() => toggleDropdown('gender')}>
              <Text style={[styles.input, isDark && styles.inputDark]}>
                {formData.gender
                  ? formData.gender.toLowerCase()
                  : t('auth.selectGender')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={themeColors[theme].text}
                style={{
                  marginRight: 16,
                  position: 'absolute',
                  end: 0,
                  top: 13,
                }}
              />
            </TouchableOpacity>
          </View>

          {openDropdown === 'gender' && (
            <View
              style={[
                styles.dropdownOverlay,
                {backgroundColor: 'rgba(0,0,0,0.5)'},
              ]}>
              <View
                style={[
                  styles.dropdownPopup,
                  {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
                ]}>
                <Text
                  style={[
                    styles.dropdownTitle,
                    {color: themeColors[theme].text},
                  ]}>
                  {t('auth.selectGender')}
                </Text>
                <View style={styles.countryList}>
                  {genderOptions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
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
                        {item.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {sso ? (
            <></>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChangeText={text =>
                    setFormData(prev => ({...prev, password: text}))
                  }
                  secureTextEntry
                  placeholderTextColor={'#666666'}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, isDark && styles.inputDark]}
                  placeholder={t('auth.confirmPassword')}
                  value={formData.confirmPassword}
                  onChangeText={text =>
                    setFormData(prev => ({...prev, confirmPassword: text}))
                  }
                  secureTextEntry
                  placeholderTextColor={'#666666'}
                />
              </View>
            </>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (formData.firstName &&
                formData.lastName &&
                formData.email &&
                sso) ||
              (formData.password && formData.confirmPassword)
                ? styles.activeButton
                : {},
            ]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>
                {t('common.continue')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {renderCountryCodeDropdown()}
        {renderLocationDropdown()}
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
                display="spinner"
                onChange={(event, date) => {
                  setSelectedDate(date);
                }}
              />
              {/* <View style={styles.modalHeader}>
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
                    itemStyle={{fontSize: 16}}
                    selectedValue={datePickerValue.month}
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
                    itemStyle={{fontSize: 16}}
                    selectedValue={datePickerValue.year}
                    style={[styles.picker, isDark && styles.pickerDark]}
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
              </View> */}

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleDateChange(selectedDate)}>
                <Text style={styles.confirmButtonText}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 10,
  },
  textDark: {
    color: '#FFFFFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImageDark: {
    backgroundColor: '#000000',
  },
  cameraIcon: {
    fontSize: 40,
    color: '#F4821F',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  inputDark: {
    backgroundColor: '#000000',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  phoneInputContainer: {
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneContainerDark: {
    borderColor: '#333333',
  },
  countryCode: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeDark: {
    borderRightColor: '#333333',
    backgroundColor: '#000000',
  },
  countryCodeText: {
    marginRight: 8,
    fontSize: 16,
    color: '#333333',
  },
  flagImage: {
    width: 24,
    height: 16,
    borderRadius: 2,
    marginEnd: 10,
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#CCCCCC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: '#F4821F',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    marginHorizontal: 5,
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
  selectedCountryItem: {
    backgroundColor: '#F4821F',
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedCountryText: {
    color: '#FFFFFF',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  locationContainerDark: {
    borderColor: '#333333',
    backgroundColor: '#000000',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
  placeholderText: {
    color: '#666666',
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
  loadingAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FillProfileScreen;
