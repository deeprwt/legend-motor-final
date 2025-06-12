import {Platform, PermissionsAndroid} from 'react-native';
import CleverTap from 'clevertap-react-native';
import messaging from '@react-native-firebase/messaging';
export const CLEVERTAP_EVENTS = {
  WELCOME: 'REGISTER',
  WELCOME_BACK: 'LOGIN',
  VIEW_CAR_DETAILS: 'VIEW_CAR_DETAILS',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  VIEW_CAR_INQUIRY: 'VIEW_CAR_ENQUIRY',
  INQUIRE_CAR: 'INQUIRE_CAR',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  LOG_OUT: 'LOG_OUT',
  DAILY_CHECK_IN: 'DAILY_CHECK_IN',
  SEARCH_CAR: 'SEARCH_CAR',
  NOTIFICATION_PERMISSION: 'NOTIFICATION_PERMISSION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  BROWSING_AS_GUEST: 'BROWSING_AS_GUEST',
  WISHLIST_GUEST: 'WISHLIST_GUEST',
  INQUIRE_GUEST: 'WISHLIST_GUEST',
  BROWSING_CAR_GUEST: 'BROWSING_CAR_GUEST',
  GUEST_LOGIN: 'GUEST_LOGIN',
};
export default function useCleverTap() {
  const setUpNotification = () => {
    // Enable CleverTap debug logs
    CleverTap.setDebugLevel(3);

    // Prompt for push permission (iOS)
    CleverTap.promptForPushPermission(true);

    // Request POST_NOTIFICATIONS permission for Android 13+
    async function requestNotificationPermission() {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }
    }

    requestNotificationPermission();

    CleverTap.isPushPermissionGranted((err, granted) => {
      console.log('Push permission granted:', granted);
      if (granted) {
        sendEventCleverTap(CLEVERTAP_EVENTS.NOTIFICATION_PERMISSION, {
          granted: true,
        });
      } else {
        sendEventCleverTap(CLEVERTAP_EVENTS.NOTIFICATION_PERMISSION, {
          granted: false,
        });
      }
    });

    // Register for Push (iOS only)
    if (Platform.OS === 'ios') {
      CleverTap.registerForPush();
    }

    // Get CleverTap ID (debugging)
    CleverTap.getCleverTapID((err, id) => {
      console.log('CleverTap ID:', id);
    });

    CleverTap.createNotificationChannel(
      'legend-motors', // Channel ID
      'General Notifications', // Name
      'General notifications from the app', // Description
      4, // Importance (1-5)
      true, // Show Badge
    );
    // console.log('Sending user profile to CleverTap:', userProfile);

    // Push profile to CleverTap

    // ✅ Get FCM Token & Push it to CleverTap
    async function getFCMToken() {
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      if (fcmToken) {
        CleverTap.setFCMPushToken(fcmToken);
        console.log('Push token sent to CleverTap');
      }
    }

    getFCMToken();
  };
  const setUserProfileCleverTap = user => {
    const userProfile = {
      FirstName: user?.firstName,
      LastName: user?.lastName,
      Phone: user?.phone,
      Identity: user?.id, // Unique identity
      Email: user?.email,
      GeneralNotifications: true,
      AppUpdates: true,
    };
    CleverTap.onUserLogin(userProfile);
  };

  const sendEventCleverTap = (event, data = {}) => {
    CleverTap.recordEvent(event, data);
  };

  return {
    setUpNotification,
    setUserProfileCleverTap,
    sendEventCleverTap,
  };
}
