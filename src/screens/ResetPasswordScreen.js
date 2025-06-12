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
import {useNavigation, useRoute} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import LockIcon from '../components/icons/LockIcon';
import EyeIcon from '../components/icons/EyeIcon';
import {resetPassword} from '../services/api';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import {getTranslation} from '../translations';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {email, resetToken} = route.params || {};
  const {selectedLanguage} = useCurrencyLanguage();
  const {theme, isDark} = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {sendEventCleverTap} = useCleverTap();

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.enterNewPassword', selectedLanguage),
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.passwordTooShort', selectedLanguage),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        getTranslation('common.error', selectedLanguage),
        getTranslation('auth.passwordsDoNotMatch', selectedLanguage),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(email, newPassword, resetToken);

      if (response.success) {
        sendEventCleverTap(CLEVERTAP_EVENTS.PASSWORD_RESET);
        Alert.alert(
          getTranslation('common.success', selectedLanguage),
          getTranslation('auth.passwordUpdated', selectedLanguage),
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Login', params: {email}}],
                }),
            },
          ],
        );
      } else {
        Alert.alert(
          getTranslation('common.error', selectedLanguage),
          response.msg ||
            getTranslation('auth.somethingWentWrong', selectedLanguage),
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
        {getTranslation('auth.createNewPassword', selectedLanguage)}
      </Text>

      <View style={styles.iconContainer}>
        <LockIcon width={50} height={50} />
      </View>

      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#000' : '#FFFFFF',
            },
          ]}>
          <LockIcon />
          <TextInput
            style={[styles.input, {color: themeColors[theme].text}]}
            placeholder={getTranslation('auth.newPassword', selectedLanguage)}
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}>
            <EyeIcon isOpen={showNewPassword} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: themeColors[theme].border,
              backgroundColor: isDark ? '#000' : '#FFFFFF',
            },
          ]}>
          <LockIcon />
          <TextInput
            style={[styles.input, {color: themeColors[theme].text}]}
            placeholder={getTranslation(
              'auth.confirmPassword',
              selectedLanguage,
            )}
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}>
            <EyeIcon isOpen={showConfirmPassword} />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        style={[
          styles.passwordRequirements,
          {color: isDark ? '#666666' : '#888888'},
        ]}>
        {getTranslation('auth.passwordRequirements', selectedLanguage)}
      </Text>

      <TouchableOpacity
        style={[
          styles.continueButton,
          {backgroundColor: themeColors[theme].primary},
        ]}
        onPress={handleResetPassword}
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
  inputContainer: {
    gap: 16,
    marginBottom: 16,
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
  eyeIcon: {
    padding: 8,
  },
  passwordRequirements: {
    fontSize: 14,
    marginBottom: 30,
    lineHeight: 20,
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

export default ResetPasswordScreen;
