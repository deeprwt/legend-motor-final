import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {requestOTP} from '../services/api';
import {useTheme} from 'src/context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {getTranslation} from '../translations';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const {isDark} = useTheme();
  const {selectedLanguage} = useCurrencyLanguage();

  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterEmail', selectedLanguage),
      );
      return;
    }

    try {
      setLoading(true);
      await requestOTP(email);
      // Navigate to OTP verification screen with email
      navigation.navigate('OTPVerification', {email});
    } catch (error) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        error.message ||
          getTranslation('auth.failedToSendOTP', selectedLanguage),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={isDark ? styles.containerDark : styles.container}>
      <Text style={[styles.title, isDark && styles.textDark]}>
        {getTranslation('auth.createAccount', selectedLanguage)}
      </Text>
      <Text style={[styles.subtitle, isDark && styles.textDark]}>
        {getTranslation('auth.enterEmailForCode', selectedLanguage)}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, isDark && styles.textDark]}>
          {getTranslation('auth.email', selectedLanguage)}
        </Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder={getTranslation('auth.enterYourEmail', selectedLanguage)}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={isDark ? '#666666' : undefined}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRequestOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {getTranslation('auth.requestWelcomeCode', selectedLanguage)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.goBack()}>
        <Text style={styles.loginLinkText}>
          {getTranslation('auth.alreadyHaveAccount', selectedLanguage)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  inputDark: {
    backgroundColor: '#000000',
    borderColor: '#333333',
    color: '#FFFFFF',
  },
  textDark: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#F4821F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#F4821F',
    fontSize: 14,
  },
});

export default RegisterScreen;
