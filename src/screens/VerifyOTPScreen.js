import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import {verifyPasswordResetOTP, requestPasswordResetOTP} from '../services/api';
import {getTranslation} from '../translations';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';

const VerifyOTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email} = route.params || {};
  const {selectedLanguage} = useCurrencyLanguage();
  const {theme, isDark} = useTheme();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);

  useEffect(() => {
    // Start countdown for resend button
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleOtpChange = (text, index) => {
    if (text.length > 1) {
      text = text[0]; // Only allow one character
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input if text entered
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // When backspace is pressed on an empty input, focus previous input
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await requestPasswordResetOTP(email);

      if (response.success) {
        Alert.alert(
          getTranslation('common.success', selectedLanguage),
          getTranslation('auth.otpSentSuccess', selectedLanguage),
        );
        // Reset countdown
        setCountdown(60);
        setResendDisabled(true);
      } else {
        Alert.alert(
          getTranslation('common.error', selectedLanguage),
          response.msg ||
            getTranslation('auth.failedToResendOTP', selectedLanguage),
        );
      }
    } catch (error) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        error.message ||
          getTranslation('auth.somethingWentWrong', selectedLanguage),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterCompleteOTP', selectedLanguage),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await verifyPasswordResetOTP(email, otpString);

      if (response.success && response.resetToken) {
        // Navigate to reset password screen with token
        navigation.navigate('ResetPassword', {
          email,
          resetToken: response.resetToken,
        });
      } else {
        Alert.alert(
          getTranslation('common.error', selectedLanguage),
          response.msg || getTranslation('auth.invalidOTP', selectedLanguage),
        );
      }
    } catch (error) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        error.message ||
          getTranslation('auth.failedToVerifyOTP', selectedLanguage),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: themeColors[theme].background},
      ]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow color={themeColors[theme].text} />
      </TouchableOpacity>

      <Text style={[styles.title, {color: themeColors[theme].text}]}>
        {getTranslation('auth.verifyEmail', selectedLanguage)}
      </Text>

      <Text style={[styles.description, {color: themeColors[theme].text}]}>
        {getTranslation('auth.otpSentToEmail', selectedLanguage).replace(
          '{email}',
          email,
        )}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              {
                borderColor: themeColors[theme].border,
                backgroundColor: isDark ? '#000' : '#FFFFFF',
                color: themeColors[theme].text,
              },
            ]}
            value={digit}
            onChangeText={text => handleOtpChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          {backgroundColor: themeColors[theme].primary},
        ]}
        onPress={handleVerifyOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>
            {getTranslation('common.continue', selectedLanguage)}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, {color: themeColors[theme].text}]}>
          {getTranslation('auth.didntReceiveCode', selectedLanguage)}{' '}
        </Text>
        {resendDisabled ? (
          <Text
            style={[styles.countdown, {color: isDark ? '#666666' : '#888888'}]}>
            {getTranslation('auth.resendIn', selectedLanguage)}
            {countdown}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
            <Text
              style={[styles.resendLink, {color: themeColors[theme].primary}]}>
              {getTranslation('auth.resendCode', selectedLanguage)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 14,
  },
});

export default VerifyOTPScreen;
