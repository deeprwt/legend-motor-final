import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import EmailIcon from '../components/icons/EmailIcon';
import {requestPasswordResetOTP} from '../services/api';
import {getTranslation} from '../translations';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const {selectedLanguage} = useCurrencyLanguage();
  const {theme, isDark} = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOTP = async () => {
    if (!email || !email.trim()) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterValidEmail', selectedLanguage),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await requestPasswordResetOTP(email);

      if (response.success) {
        // Navigate to OTP verification screen
        navigation.navigate('VerifyOTP', {email});
      } else {
        Alert.alert(
          getTranslation('common.error', selectedLanguage),
          response.msg ||
            getTranslation('auth.failedToSendOTP', selectedLanguage),
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
        {getTranslation('auth.forgotPasswordTitle', selectedLanguage)}
      </Text>

      <View style={styles.iconContainer}>
        <EmailIcon width={50} height={50} />
      </View>

      <Text style={[styles.description, {color: themeColors[theme].text}]}>
        {getTranslation('auth.forgotPasswordDescription', selectedLanguage)}
      </Text>

      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#000' : '#FFFFFF',
            },
          ]}>
          <EmailIcon />
          <TextInput
            style={[styles.input, {color: themeColors[theme].text}]}
            placeholder={getTranslation('auth.email', selectedLanguage)}
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          {backgroundColor: themeColors[theme].primary},
        ]}
        onPress={handleRequestOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>
            {getTranslation('common.continue', selectedLanguage)}
          </Text>
        )}
      </TouchableOpacity>
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    marginLeft: 8,
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
});

export default ForgotPasswordScreen;
