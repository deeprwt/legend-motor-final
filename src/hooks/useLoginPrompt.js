import {useState, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from 'src/context/AuthContext';

/**
 * Hook to manage the login prompt modal
 * @returns {Object} The login prompt state and functions
 */
export const useLoginPrompt = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const navigation = useNavigation();

  // Show login prompt modal
  const showLoginPrompt = useCallback(() => {
    setLoginModalVisible(true);
  }, []);

  // Hide login prompt modal
  const hideLoginPrompt = useCallback(() => {
    setLoginModalVisible(false);
  }, []);

  // Navigate to login screen
  const navigateToLogin = useCallback(() => {
    setLoginModalVisible(false);
    navigation.navigate('Login');
  }, [navigation]);

  // Check if user is authenticated and show login prompt if not
  const {isAuthenticated, checkAuthStatus} = useAuth();
  const checkAuthAndShowPrompt = useCallback(async () => {
    let isAuth = await checkAuthStatus();
    if (!isAuth) {
      showLoginPrompt();
      return false;
    }
    return true;
  }, [showLoginPrompt]);

  return {
    loginModalVisible,
    showLoginPrompt,
    hideLoginPrompt,
    navigateToLogin,
    checkAuthAndShowPrompt,
  };
};
