import React, {useEffect} from 'react';
import {
  CommonActions,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, Button} from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import FillProfileScreen from '../screens/FillProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import AllBrandsScreen from '../screens/AllBrandsScreen';
import FilterScreen from '../screens/FilterScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';
import MyWishlistScreen from '../screens/MyWishlistScreen';
import EnquiryFormScreen from '../screens/EnquiryFormScreen';

// Import new profile screens
import EditProfileScreen from '../screens/EditProfileScreen';
import LanguageScreen from '../screens/LanguageScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import BlogPostDetailScreen from '../screens/BlogPostDetailScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import CookiePolicyScreen from '../screens/CookiePolicyScreen';
import Notification from 'src/screens/Notification';
import NotificationSettings from 'src/screens/NotificationSettings';
import useCleverTap from 'src/services/NotificationHandler';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import CleverTap from 'clevertap-react-native';

// Test screen to help debug navigation
const TestNavigationScreen = ({navigation}) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
    <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20}}>
      Navigation Test
    </Text>
    <Button
      title="Go to Privacy Policy"
      onPress={() => {
        console.log('TestNavigationScreen: Navigating to PrivacyPolicy');
        navigation.navigate('PrivacyPolicy');
      }}
    />
  </View>
);

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const {setUpNotification} = useCleverTap();
  const navigation = useNavigation();
  const onNotificationReceived = async notification => {
    const newNotification = {
      ...notification,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem('push_notifications');
      const notifications = existing ? JSON.parse(existing) : [];
      notifications.unshift(newNotification); // Add new to top
      await AsyncStorage.setItem(
        'push_notifications',
        JSON.stringify(notifications),
      );
    } catch (e) {
      console.error('Error storing notification:', e);
    }
  };
  const handleNotification = e => {
    onNotificationReceived(e);
    switch (e.redirect) {
      case 'CarDetailScreen':
        navigation.navigate('CarDetailScreen', {carId: e.carId});
        break;
      case 'Home':
        navigation.navigate('Main');
        break;
      case 'Explore':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                state: {routes: [{name: 'ExploreTab'}]},
              },
              // {name: 'Explore', params: {filters}},
            ],
          }),
        );
        break;
      case 'Wishlist':
        navigation.navigate('MyWishlistScreen');
        break;
      case 'Enquiry':
        navigation.navigate('EnquiryFormScreen');
        break;
      case 'Profile':
        navigation.navigate('ProfileTab');
        break;
      default:
        navigation.navigate('Main');
        break;
    }
  };
  useEffect(() => {
    setUpNotification();
    GoogleSignin.configure({
      webClientId:
        '789807190580-mo23ir6p664eb69bug94iq12ciluesjl.apps.googleusercontent.com',
    });

    CleverTap.addListener(CleverTap.CleverTapPushNotificationClicked, e => {
      handleNotification(e);
    });

    function _handleCleverTapEvent(eventName, event) {
      console.log('CleverTap In App Event called - ', eventName, event);
    }
    CleverTap.addListener(
      CleverTap.CleverTapInAppNotificationButtonTapped,
      event => {
        _handleCleverTapEvent(
          CleverTap.CleverTapInAppNotificationButtonTapped,
          event,
        );
      },
    );
    return () => {
      CleverTap.removeListener(CleverTap.CleverTapPushNotificationClicked);
      CleverTap.removeListener(
        CleverTap.CleverTapInAppNotificationButtonTapped,
      );
    };
  }, []);
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="FillProfile" component={FillProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="AllBrands" component={AllBrandsScreen} />
      <Stack.Screen name="FilterScreen" component={FilterScreen} />
      <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
      <Stack.Screen name="MyWishlistScreen" component={MyWishlistScreen} />
      <Stack.Screen name="EnquiryFormScreen" component={EnquiryFormScreen} />

      {/* Profile Section Screens */}
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
      <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
      <Stack.Screen
        name="BlogPostDetailScreen"
        component={BlogPostDetailScreen}
      />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
      />
      <Stack.Screen
        name="TestNavigation"
        component={TestNavigationScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CookiePolicy"
        component={CookiePolicyScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
