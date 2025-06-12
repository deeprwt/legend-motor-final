import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Switch,
  InteractionManager,
  Platform,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import LogoutModal from '../components/LogoutModal';
import api, {
  getUserProfile,
  syncAuthToken,
  logoutUser,
  updateUserProfile,
} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {languages} from './LanguageSelectScreen';
import {COLORS} from 'src/utils/constants';
import {getAuth, signOut} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Ionicons} from '../utils/icon';
import {useWishlist} from 'src/context/WishlistContext';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getTranslation} from '../translations';
// SVG icons as React components
const UserIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8445 22.1618C8.15273 22.1618 5 21.5873 5 19.2865C5 16.9858 8.13273 14.8618 11.8445 14.8618C15.5364 14.8618 18.6891 16.9652 18.6891 19.266C18.6891 21.5658 15.5564 22.1618 11.8445 22.1618Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8375 11.6735C14.2602 11.6735 16.2239 9.7099 16.2239 7.28718C16.2239 4.86445 14.2602 2.8999 11.8375 2.8999C9.41477 2.8999 7.45022 4.86445 7.45022 7.28718C7.44204 9.70172 9.39204 11.6654 11.8066 11.6735C11.8175 11.6735 11.8275 11.6735 11.8375 11.6735Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const BellIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9964 3.01416C7.5621 3.01416 5.63543 7.0294 5.63543 9.68368C5.63543 11.6675 5.92305 11.0837 4.82496 13.5037C3.484 16.9523 8.87638 18.3618 11.9964 18.3618C15.1154 18.3618 20.5078 16.9523 19.1678 13.5037C18.0697 11.0837 18.3573 11.6675 18.3573 9.68368C18.3573 7.0294 16.4297 3.01416 11.9964 3.01416Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.306 21.0122C13.0117 22.4579 10.9927 22.4751 9.68604 21.0122"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const InfoIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.6785 3.84872C12.9705 4.66372 12.6885 9.78872 13.5115 10.6127C14.3345 11.4347 19.2795 11.0187 20.4675 10.0837C23.3255 7.83272 15.9385 1.24672 13.6785 3.84872Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1377 14.2902C19.2217 15.3742 16.3477 21.5542 10.6517 21.5542C6.39771 21.5542 2.94971 18.1062 2.94971 13.8532C2.94971 8.55317 8.17871 5.16317 9.67771 6.66217C10.5407 7.52517 9.56871 11.5862 11.1167 13.1352C12.6647 14.6842 17.0537 13.2062 18.1377 14.2902Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ShieldIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="18" height="21" viewBox="0 0 18 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.98457 20.1057C11.3196 20.1057 16.6566 17.7837 16.6566 11.3787C16.6566 4.97473 16.9346 4.47373 16.3196 3.85773C15.7036 3.24173 12.4936 1.25073 8.98457 1.25073C5.47557 1.25073 2.26557 3.24173 1.65057 3.85773C1.03457 4.47373 1.31257 4.97473 1.31257 11.3787C1.31257 17.7837 6.65057 20.1057 8.98457 20.1057Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.38574 10.3749L8.27774 12.2699L12.1757 8.36987"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ProfileImageIcon = props => (
  <Svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}>
    <Circle cx="16" cy="16" r="16" fill="#EF9439" />
    <Path
      d="M21 11.75L20.25 11M16 21H22M9 16L18.25 11.5L20.5 13.75L16 23H9V16Z"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GlobeIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.75 12.5C2.75 5.563 5.063 3.25 12 3.25C18.937 3.25 21.25 5.563 21.25 12.5C21.25 19.437 18.937 21.75 12 21.75C5.063 21.75 2.75 19.437 2.75 12.5Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.2045 14.3999H15.2135"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.2045 10.3999H12.2135"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.19521 14.3999H9.20421"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const DocumentIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.7161 16.2234H8.49609"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.7161 12.0369H8.49609"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.2511 7.86011H8.49609"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.9085 2.75C15.9085 2.75 8.23149 2.754 8.21949 2.754C5.45949 2.771 3.75049 4.587 3.75049 7.357V16.553C3.75049 19.337 5.47249 21.16 8.25649 21.16C8.25649 21.16 15.9325 21.157 15.9455 21.157C18.7055 21.14 20.4155 19.323 20.4155 16.553V7.357C20.4155 4.573 18.6925 2.75 15.9085 2.75Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const HelpIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 21.25C17.109 21.25 21.25 17.109 21.25 12C21.25 6.891 17.109 2.75 12 2.75C6.891 2.75 2.75 6.891 2.75 12C2.75 17.109 6.891 21.25 12 21.25Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16.9551V17.0442"
        stroke={themeColors[theme].text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13.52C12 12.56 12.42 12.07 13.05 11.64C13.66 11.22 14.3 10.73 14.36 10.06C14.48 8.75 13.46 7.75 12.15 7.75C11.07 7.75 10.15 8.43 9.88 9.43C9.79 9.79 9.73 10.17 9.69 10.56"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const MoonIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ChevronIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <Path
        d="M1 1L7 7L1 13"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const LogoutIcon = ({color}) => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.016 7.38948V6.45648C15.016 4.42148 13.366 2.77148 11.331 2.77148H6.45597C4.42197 2.77148 2.77197 4.42148 2.77197 6.45648V17.5865C2.77197 19.6215 4.42197 21.2715 6.45597 21.2715H11.341C13.37 21.2715 15.016 19.6265 15.016 17.5975V16.6545"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.8096 12.0215H9.76855"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.8813 9.1062L21.8093 12.0212L18.8813 14.9372"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Add a phone icon for better UI
const PhoneIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.97 18.33c0 .36-.08.73-.25 1.09-.17.36-.39.7-.68 1.02-.49.54-1.03.93-1.64 1.18-.6.25-1.25.38-1.95.38-1.02 0-2.11-.24-3.26-.73s-2.3-1.15-3.44-1.98c-1.14-.83-2.2-1.76-3.19-2.8-.99-1.04-1.88-2.17-2.66-3.37C4.11 12.17 3.6 11.09 3.3 10s-.37-2.13-.19-3.1c.11-.58.32-1.13.63-1.63.31-.5.76-.92 1.34-1.26.65-.4 1.34-.5 2.02-.3.29.08.54.22.76.42.22.2.4.45.57.74l1.38 2.44c.17.29.25.55.25.79 0 .24-.08.46-.22.64-.14.18-.3.32-.48.44-.18.12-.34.23-.49.35-.15.12-.22.22-.22.34.08.33.27.74.58 1.23.31.49.68.97 1.11 1.45.45.48.91.93 1.38 1.35.47.42.89.7 1.27.85.09.03.19.05.28.05.17 0 .32-.08.45-.24.13-.16.29-.32.46-.49.17-.17.35-.33.54-.49.19-.16.4-.28.62-.36.22-.08.44-.12.65-.12.24 0 .48.06.74.19l2.65 1.56c.29.16.52.36.68.61.16.25.24.52.24.81Z"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {user, logout, isAuthenticated, checkAuthStatus, updateUser} =
    useAuth();
  const {selectedLanguage, setSelectedLanguage} = useCurrencyLanguage();
  const {theme, toggleTheme, isDark} = useTheme();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const {clearWishlist} = useWishlist();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      let isAuth = await checkAuthStatus();
      if (isAuth) {
        setUserProfile(user);
      } else {
        let token = await AsyncStorage.getItem('token');
        // Alert.alert(
        //   token ? 'Session Expired' : 'Please Login',
        //   token
        //     ? 'Your session has expired. Please log in again.'
        //     : 'Please log in to continue.',
        //   [{text: 'OK', onPress: handleLogout}],
        // );
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show tooltip when long pressing profile image
  const handleLongPress = () => {
    setShowTooltip(true);
    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  };

  // Handle image picker
  const handleImagePicker = async () => {
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

        if (Platform.OS === 'android') {
          // For Android, use the modern approach
          launchImageLibrary(options)
            .then(result => {
              if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
              }

              if (result.errorCode) {
                console.log('ImagePicker Error: ', result.errorMessage);
                // Use a timeout to avoid the "not attached to activity" error
                setTimeout(() => {
                  Alert.alert(
                    'Error',
                    'Failed to select image. Please try again.',
                  );
                }, 100);
                return;
              }

              if (result.assets && result.assets.length > 0) {
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
          launchImageLibrary(options)
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

  // Upload profile image to server and update profile
  const uploadProfileImage = async imageAsset => {
    try {
      setUploadingImage(true);

      // First, upload the image to get an image ID
      // Implement the image upload API call based on your backend
      const formData = new FormData();
      formData.append('file', {
        name: imageAsset.fileName || 'profile.jpg',
        type: imageAsset.type,
        uri: imageAsset.uri,
      });

      // Make API call to upload image
      const uploadResult = await api.post('file-system/upload', formData, {
        // params: {
        //
        // },
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-parent-folder': 'profiles',
        },
      });
      console.log('uploadResult', uploadResult);

      // if (!uploadResult?.success) {
      //   throw new Error(uploadResult.message || 'Failed to upload image');
      // }

      // Now update user profile with the new image ID
      const profileData = {
        profileImage: uploadResult.data.id,
      };

      const updateResponse = await updateUserProfile(profileData);
      console.log('updateResponse', updateResponse);

      if (updateResponse.success) {
        // Update local user data
        setUserProfile({
          ...userProfile,
          profileImage: updateResponse.data.profileImage,
        });

        // Update auth context
        if (updateUser) {
          updateUser({
            ...user,
            profileImage: updateResponse.data.profileImage,
          });
        }

        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        throw new Error(updateResponse.msg || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile image update error:', error);
      Alert.alert(
        'Error',
        'Failed to update profile picture. Please try again.',
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Initial fetch when screen mounts
  const isFocused = useIsFocused();
  useEffect(() => {
    fetchUserProfile();
  }, [isFocused]);

  // Refresh profile when screen comes into focus

  const handleNavigate = screenName => {
    navigation.navigate(screenName);
  };

  const {sendEventCleverTap} = useCleverTap();

  const handleLogout = async () => {
    sendEventCleverTap(CLEVERTAP_EVENTS.LOG_OUT);
    try {
      setShowLogoutModal(false);
      // Call logout API
      await logoutUser();
      // Call context logout
      await logout();
      clearWishlist();

      //sso - signout
      let ssoUser = getAuth().currentUser;
      if (ssoUser) {
        await signOut(getAuth());
        if (GoogleSignin.getCurrentUser()) await GoogleSignin.revokeAccess();
      }

      // Navigate to Login screen
      // navigation.reset({
      //   index: 0,
      //   routes: [{name: 'Login'}],
      // });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AsyncStorage.removeItem('push_notifications');
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('userData');
      AsyncStorage.removeItem('refreshToken');
      AsyncStorage.clear();
      AsyncStorage.setItem('firstTimeUser', 'true');

      let ssoUser = getAuth().currentUser;
      if (ssoUser) {
        await signOut(getAuth());
        if (GoogleSignin.getCurrentUser()) await GoogleSignin.revokeAccess();
      }
      // Even if there's an error, still try to log out locally
      logout();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    }
  };

  // Format user name from profile data
  const getUserName = () => {
    if (!userProfile) return 'User';
    const firstName = userProfile.firstName || '';
    const lastName = userProfile.lastName || '';
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (userProfile.email) {
      // If no name, use first part of email
      return userProfile.email.split('@')[0];
    }
    return 'User';
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (user && user.profileImage) {
      const image = user.profileImage;
      console.log('image', image);
      console.log('https://cdn.staging.legendmotorsglobal.com' + image.path);
      return `https://cdn.staging.legendmotorsglobal.com${image.path}`;
      // Try different image paths
      const imagePath =
        image.webp || image.original || image.thumbnailPath || image.path;
      if (imagePath) {
        // If path starts with http, use as is, otherwise prepend a base URL
        if (imagePath.startsWith('http')) {
          return imagePath;
        } else {
          return `https://cdn.legendmotorsglobal.com${imagePath}`;
        }
      }
    } else {
      return null;
      // return 'https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png';
    }
  };

  // Get user phone with formatting
  const getUserPhone = () => {
    if (!userProfile || !userProfile.phone) return '';

    // Get clean phone digits
    const phoneDigits = userProfile.phone.replace(/\D/g, '');

    // // Use dialCode from the API response (preferred) or fallback to countryCode
    const countryCodeValue =
      userProfile?.dialCode || userProfile?.countryCode || '';

    // // Format with country code if available
    // if (countryCodeValue) {
    //   // Make sure country code has a plus sign
    //   const formattedCountryCode = countryCodeValue.startsWith('+')
    //     ? countryCodeValue
    //     : '+' + countryCodeValue;

    //   console.log('Profile country/dial code from API:', countryCodeValue);
    //   console.log('Formatted country code for display:', formattedCountryCode);

    //   // Apply different formatting based on country code
    //   if (formattedCountryCode === '+1') {
    //     // US/Canada format: +1 XXX-XXX-XXXX
    //     if (phoneDigits.length <= 3) {
    //       return `${formattedCountryCode} ${phoneDigits}`;
    //     } else if (phoneDigits.length <= 6) {
    //       return `${formattedCountryCode} ${phoneDigits.slice(
    //         0,
    //         3,
    //       )}-${phoneDigits.slice(3)}`;
    //     } else {
    //       return `${formattedCountryCode} ${phoneDigits.slice(
    //         0,
    //         3,
    //       )}-${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
    //     }
    //   } else if (formattedCountryCode === '+91') {
    //     // India format: +91 XXXXX XXXXX
    //     if (phoneDigits.length > 5) {
    //       return `${formattedCountryCode} ${phoneDigits.slice(
    //         0,
    //         5,
    //       )} ${phoneDigits.slice(5)}`;
    //     } else {
    //       return `${formattedCountryCode} ${phoneDigits}`;
    //     }
    //   } else {
    //     // Default format for other country codes
    //     return `${formattedCountryCode} ${phoneDigits}`;
    //   }
    // }

    // If no country code, just return the phone number
    return countryCodeValue + ' ' + phoneDigits;
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
        ]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, {color: themeColors[theme].text}]}>
            {getTranslation('common.loading', selectedLanguage)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!isAuthenticated)
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
        ]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={themeColors[theme].background}
        />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileContainer}>
            <View style={styles.profileHeader}>
              <Text style={[styles.logoText, {color: themeColors[theme].text}]}>
                {getTranslation('tabs.profile', selectedLanguage)}
              </Text>
            </View>
            <View style={styles.profileInfoContainer}>
              <TouchableOpacity
                style={styles.avatarContainer}
                disabled={true}
                onPress={() => {}}
                onLongPress={() => {}}>
                {uploadingImage ? (
                  <View style={styles.loadingAvatarContainer}>
                    <ActivityIndicator size="large" color="#F47B20" />
                  </View>
                ) : (
                  <Image
                    source={require('../assets/images/profile.jpg')}
                    style={styles.avatar}
                  />
                )}
                {/* <View style={styles.badgeContainer}>
                  <ProfileImageIcon width={24} height={24} />
                </View> */}
                {showTooltip && (
                  <View style={styles.tooltipContainer}>
                    <Text style={styles.tooltipText}>
                      {getTranslation(
                        'profile.changeProfilePicture',
                        selectedLanguage,
                      )}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={[styles.userName, {color: themeColors[theme].text}]}>
                {getUserName()}
              </Text>

              {/* Enhanced phone display with country code */}

              <View style={styles.menuContainer}>
                {/* Edit Profile */}
                {isAuthenticated ? (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {borderBottomColor: themeColors[theme].border},
                    ]}
                    onPress={() => handleNavigate('EditProfileScreen')}>
                    <View style={styles.menuIconContainer}>
                      <UserIcon />
                    </View>
                    <Text
                      style={[
                        styles.menuText,
                        {color: themeColors[theme].text},
                      ]}>
                      {getTranslation('profile.editProfile', selectedLanguage)}
                    </Text>
                    <ChevronIcon />
                  </TouchableOpacity>
                ) : null}
                {/* Notification */}
                {isAuthenticated ? (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      {borderBottomColor: themeColors[theme].border},
                    ]}
                    onPress={() => handleNavigate('NotificationSettings')}>
                    <View style={styles.menuIconContainer}>
                      <Ionicons
                        name="notifications-outline"
                        size={24}
                        color={themeColors[theme].text}
                      />
                    </View>
                    <Text
                      style={[
                        styles.menuText,
                        {color: themeColors[theme].text},
                      ]}>
                      {getTranslation(
                        'settings.notifications',
                        selectedLanguage,
                      )}
                    </Text>
                    <View style={styles.rightContainer}>
                      <ChevronIcon />
                    </View>
                  </TouchableOpacity>
                ) : null}
                {/* Language */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {borderBottomColor: themeColors[theme].border},
                  ]}
                  onPress={() => handleNavigate('LanguageScreen')}>
                  <View style={styles.menuIconContainer}>
                    <GlobeIcon />
                  </View>
                  <Text
                    style={[styles.menuText, {color: themeColors[theme].text}]}>
                    {getTranslation('settings.language', selectedLanguage)}
                  </Text>
                  <View style={styles.rightContainer}>
                    <Text
                      style={[
                        styles.languageValue,
                        {color: isDark ? 'white' : '#7A40C6'},
                      ]}>
                      {
                        languages.find(lang => lang.id == selectedLanguage)
                          ?.name
                      }
                    </Text>
                    <ChevronIcon />
                  </View>
                </TouchableOpacity>
                {/* Privacy Policy */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {borderBottomColor: themeColors[theme].border},
                  ]}
                  onPress={() => navigation.navigate('PrivacyPolicy')}>
                  <View style={styles.menuIconContainer}>
                    <DocumentIcon />
                  </View>
                  <Text
                    style={[styles.menuText, {color: themeColors[theme].text}]}>
                    {getTranslation('settings.privacyPolicy', selectedLanguage)}
                  </Text>
                  <ChevronIcon />
                </TouchableOpacity>
                {/* Terms and Conditions */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {borderBottomColor: themeColors[theme].border},
                  ]}
                  onPress={() => navigation.navigate('TermsAndConditions')}>
                  <View style={styles.menuIconContainer}>
                    <DocumentIcon />
                  </View>
                  <Text
                    style={[styles.menuText, {color: themeColors[theme].text}]}>
                    {getTranslation(
                      'settings.termsOfService',
                      selectedLanguage,
                    )}
                  </Text>
                  <ChevronIcon />
                </TouchableOpacity>
                {/* Cookie Policy */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {borderBottomColor: themeColors[theme].border},
                  ]}
                  onPress={() => navigation.navigate('CookiePolicy')}>
                  <View style={styles.menuIconContainer}>
                    <DocumentIcon />
                  </View>
                  <Text
                    style={[styles.menuText, {color: themeColors[theme].text}]}>
                    {getTranslation('settings.cookiePolicy', selectedLanguage)}
                  </Text>
                  <ChevronIcon />
                </TouchableOpacity>
                {/* Help Center */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {borderBottomColor: themeColors[theme].border},
                  ]}
                  onPress={() => handleNavigate('HelpCenterScreen')}>
                  <View style={styles.menuIconContainer}>
                    <HelpIcon />
                  </View>
                  <Text
                    style={[styles.menuText, {color: themeColors[theme].text}]}>
                    {getTranslation('settings.help', selectedLanguage)}
                  </Text>
                  <ChevronIcon />
                </TouchableOpacity>
                {/* Dark Mode */}
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    {borderBottomColor: themeColors[theme].border},
                  ]}
                  onPress={toggleTheme}>
                  <View style={styles.menuItemLeft}>
                    <MoonIcon />
                    <Text
                      style={[
                        styles.menuItemText,
                        {color: themeColors[theme].text},
                      ]}>
                      {getTranslation('settings.darkMode', selectedLanguage)}
                    </Text>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{
                      false: '#767577',
                      true: themeColors[theme].primary,
                    }}
                    thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
                  />
                </TouchableOpacity>
                {/* Logout */}
                {isAuthenticated ? (
                  <TouchableOpacity
                    style={styles.logoutItem}
                    onPress={() => setShowLogoutModal(true)}>
                    <View style={styles.logoutIconContainer}>
                      <LogoutIcon color={COLORS.primary} />
                    </View>
                    <Text style={[styles.logoutText, {color: COLORS.primary}]}>
                      {getTranslation('auth.logout', selectedLanguage)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.logoutItem}
                    onPress={() => navigation.navigate('Login')}>
                    <View style={styles.logoutIconContainer}>
                      <Ionicons
                        name="log-in-outline"
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={[styles.logoutText, {color: COLORS.primary}]}>
                      {getTranslation('auth.login', selectedLanguage)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        <LogoutModal
          visible={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onLogout={handleLogout}
        />
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors[theme].background}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Text style={[styles.logoText, {color: themeColors[theme].text}]}>
              {getTranslation('tabs.profile', selectedLanguage)}
            </Text>
          </View>
          <View style={styles.profileInfoContainer}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleImagePicker}
              onLongPress={handleLongPress}
              disabled={uploadingImage}>
              {uploadingImage ? (
                <View style={styles.loadingAvatarContainer}>
                  <ActivityIndicator size="large" color="#F47B20" />
                </View>
              ) : (
                <Image
                  source={
                    getProfileImageUrl()
                      ? {uri: getProfileImageUrl()}
                      : require('../assets/images/profile.jpg')
                  }
                  style={styles.avatar}
                />
              )}
              <View style={styles.badgeContainer}>
                <ProfileImageIcon width={24} height={24} />
              </View>
              {showTooltip && (
                <View style={styles.tooltipContainer}>
                  <Text style={styles.tooltipText}>
                    {getTranslation(
                      'profile.changeProfilePicture',
                      selectedLanguage,
                    )}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.userName, {color: themeColors[theme].text}]}>
              {getUserName()}
            </Text>

            {/* Enhanced phone display with country code */}
            {userProfile && userProfile.phone && (
              <View style={styles.phoneContainer}>
                <PhoneIcon />
                <Text
                  style={[
                    styles.userPhone,
                    {color: isDark ? '#ffffff' : '#888888', marginLeft: 8},
                  ]}>
                  {getUserPhone()}
                </Text>
              </View>
            )}

            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('EditProfileScreen')}>
                <View style={styles.menuIconContainer}>
                  <UserIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('profile.editProfile', selectedLanguage)}
                </Text>
                <ChevronIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('NotificationSettings')}>
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={themeColors[theme].text}
                  />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('settings.notifications', selectedLanguage)}
                </Text>
                <View style={styles.rightContainer}>
                  <ChevronIcon />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('LanguageScreen')}>
                <View style={styles.menuIconContainer}>
                  <GlobeIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('settings.language', selectedLanguage)}
                </Text>
                <View style={styles.rightContainer}>
                  <Text
                    style={[
                      styles.languageValue,
                      {color: isDark ? 'white' : '#7A40C6'},
                    ]}>
                    {languages.find(lang => lang.id == selectedLanguage)?.name}
                  </Text>
                  <ChevronIcon />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                <View style={styles.menuIconContainer}>
                  <DocumentIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('settings.privacyPolicy', selectedLanguage)}
                </Text>
                <ChevronIcon />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => navigation.navigate('TermsAndConditions')}>
                <View style={styles.menuIconContainer}>
                  <DocumentIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('settings.termsOfService', selectedLanguage)}
                </Text>
                <ChevronIcon />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => navigation.navigate('CookiePolicy')}>
                <View style={styles.menuIconContainer}>
                  <DocumentIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('settings.cookiePolicy', selectedLanguage)}
                </Text>
                <ChevronIcon />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={() => handleNavigate('HelpCenterScreen')}>
                <View style={styles.menuIconContainer}>
                  <HelpIcon />
                </View>
                <Text
                  style={[styles.menuText, {color: themeColors[theme].text}]}>
                  {getTranslation('settings.help', selectedLanguage)}
                </Text>
                <ChevronIcon />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {borderBottomColor: themeColors[theme].border},
                ]}
                onPress={toggleTheme}>
                <View style={styles.menuItemLeft}>
                  <MoonIcon />
                  <Text
                    style={[
                      styles.menuItemText,
                      {color: themeColors[theme].text},
                    ]}>
                    {getTranslation('settings.darkMode', selectedLanguage)}
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: '#767577',
                    true: themeColors[theme].primary,
                  }}
                  thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutItem}
                onPress={() => setShowLogoutModal(true)}>
                <View style={styles.logoutIconContainer}>
                  <LogoutIcon color={COLORS.primary} />
                </View>
                <Text style={[styles.logoutText, {color: COLORS.primary}]}>
                  {getTranslation('auth.logout', selectedLanguage)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  profileContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loadingAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 12,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{rotate: '-45deg'}],
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
  },
  userPhone: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    width: '100%',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageValue: {
    fontSize: 14,
    color: '#7A40C6',
    marginRight: 8,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  logoutIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    right: -30,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProfileScreen;
