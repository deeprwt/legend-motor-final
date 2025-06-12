import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import Logo from '../components/Logo';
import EmailIcon from '../components/icons/EmailIcon';
import LockIcon from '../components/icons/LockIcon';
import EyeIcon from '../components/icons/EyeIcon';
import CheckIcon from '../components/icons/CheckIcon';
import AppleIcon from '../components/icons/AppleIcon';
import GoogleIcon from '../components/icons/GoogleIcon';
import {useAuth} from '../context/AuthContext';
import {useTheme} from 'src/context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {getTranslation} from '../translations';
import {
  onAppleButtonPressAndroid,
  onAppleButtonPressIOS,
  onGoogleButtonPress,
} from 'src/services/socialAuth';
import {COLORS} from 'src/utils/constants';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialEmail = route.params?.email || '';
  const {isDark} = useTheme();
  const {selectedLanguage} = useCurrencyLanguage();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Get authentication context
  const {login, loading, error, ssoApi} = useAuth();

  // Effect for when coming from registration with an email
  useEffect(() => {
    if (route.params?.email && route.params?.fromRegistration) {
      Alert.alert(
        getTranslation('auth.registrationComplete', selectedLanguage),
        getTranslation('auth.registrationSuccess', selectedLanguage),
      );
    }
  }, [route.params, selectedLanguage]);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterEmail', selectedLanguage),
      );
      return;
    }
    if (!password) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterPassword', selectedLanguage),
      );
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        sendEventCleverTap(CLEVERTAP_EVENTS.WELCOME_BACK);
        // Clear any previous navigation history and go to main screen
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } else {
        // Show specific error message from API if available
        Alert.alert(
          getTranslation('auth.loginFailed', selectedLanguage),
          result.error ||
            getTranslation('auth.invalidCredentials', selectedLanguage),
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        getTranslation('auth.loginError', selectedLanguage),
        getTranslation('auth.unexpectedError', selectedLanguage),
      );
    }
  };
  const {sendEventCleverTap} = useCleverTap();
  const handleSsoLogin = async (idToken, isNewUser) => {
    try {
      const ssoResult = await ssoApi(idToken);
      console.log('SSO result:', ssoResult, idToken);
      if (ssoResult.success) {
        setAppleLoading(false);
        setGoogleLoading(false);
        if (isNewUser) {
          sendEventCleverTap(CLEVERTAP_EVENTS.WELCOME);
          navigation.replace('FillProfile', {
            sso: true,
          });
        } else {
          sendEventCleverTap(CLEVERTAP_EVENTS.WELCOME_BACK);
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        }
      }
    } catch (error) {
      console.error('sso sign-in error:', error);
    } finally {
      setAppleLoading(false);
      setGoogleLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const result = await onGoogleButtonPress();
      let idToken = await result.user.getIdToken();
      let isNewUser = result.additionalUserInfo.isNewUser;
      handleSsoLogin(idToken, isNewUser);
    } catch (error) {
      setGoogleLoading(false);
      console.error('Google sign-in error:', error);
    }
  };
  const handleAppleLogin = async () => {
    try {
      setAppleLoading(true);
      const result =
        Platform.OS === 'ios'
          ? await onAppleButtonPressIOS()
          : await onAppleButtonPressAndroid();
      let idToken = await result.user.getIdToken();
      console.log('Apple sign-in result:', idToken);
      let isNewUser = result.additionalUserInfo.isNewUser;
      handleSsoLogin(idToken, isNewUser);
    } catch (error) {
      setAppleLoading(false);
      console.error('Apple sign-in error:', error);
    }
  };

  return (
    <View style={isDark ? styles.containerDark : styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.reset({
              index: 0,
              routes: [{name: 'Main'}],
            });
          }
        }}>
        <BackArrow color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Logo width={200} height={80} />
      </View>

      <Text style={[styles.title, isDark && styles.titleDark]}>
        {getTranslation('auth.loginToAccount', selectedLanguage)}
      </Text>

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
          <EmailIcon />
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder={getTranslation('auth.email', selectedLanguage)}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={'#666666'}
          />
        </View>

        <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
          <LockIcon />
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder={getTranslation('auth.password', selectedLanguage)}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor={'#666666'}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}>
            <EyeIcon isOpen={showPassword} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rememberContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRememberMe(!rememberMe)}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <CheckIcon />}
          </View>
          <Text style={[styles.rememberText, isDark && styles.textDark]}>
            {getTranslation('auth.rememberMe', selectedLanguage)}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>
            {getTranslation('auth.login', selectedLanguage)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.forgotPasswordText, isDark && styles.textDark]}>
          {getTranslation('auth.forgotPassword', selectedLanguage)}
        </Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={[styles.registerText, isDark && styles.textDark]}>
          {getTranslation('auth.dontHaveAccount', selectedLanguage)}{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>
            {getTranslation('auth.signup', selectedLanguage)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity
          onPress={handleAppleLogin}
          style={[styles.socialButton, isDark && styles.socialButtonDark]}>
          {appleLoading ? (
            <ActivityIndicator color={isDark ? '#FFFFFF' : COLORS.primary} />
          ) : (
            <>
              <AppleIcon size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text
                style={[styles.socialButtonText, isDark && styles.textDark]}>
                {getTranslation('auth.continueWithApple', selectedLanguage)}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          style={[styles.socialButton, isDark && styles.socialButtonDark]}>
          {googleLoading ? (
            <ActivityIndicator color={isDark ? '#FFFFFF' : COLORS.primary} />
          ) : (
            <>
              <GoogleIcon size={24} />
              <Text
                style={[styles.socialButtonText, isDark && styles.textDark]}>
                {getTranslation('auth.continueWithGoogle', selectedLanguage)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2D2D2D',
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperDark: {
    backgroundColor: '#000000',
    borderColor: '#333333',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  inputDark: {
    color: '#FFFFFF',
  },
  eyeIcon: {
    padding: 8,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#F4821F',
    borderColor: '#F4821F',
  },
  rememberText: {
    fontSize: 14,
    color: '#666666',
  },
  textDark: {
    color: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#666666',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  registerText: {
    color: '#666666',
    fontSize: 14,
  },
  registerLink: {
    color: '#F4821F',
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  socialButtonDark: {
    backgroundColor: '#000000',
    borderColor: '#333333',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default LoginScreen;
