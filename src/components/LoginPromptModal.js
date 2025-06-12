import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useAuth} from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {getTranslation} from '../translations';

// Use SVG for the lock icon to avoid image loading issues
const LockIcon = () => (
  <Image
    source={require('./icons/promptModel.png')}
    style={{width: 80, height: 80}}
    resizeMode="contain"
  />
);

const PROMPT_SHOWN_KEY = 'login_prompt_dismissed';

const LoginPromptModal = ({visible, onClose, onLoginPress}) => {
  const {isDark} = useTheme();
  const {selectedLanguage} = useCurrencyLanguage();
  const [shouldShowModal, setShouldShowModal] = useState(visible);

  // Update modal visibility when prop changes
  useEffect(() => {
    if (visible) {
      setShouldShowModal(true);
    } else {
      setShouldShowModal(false);
    }
  }, [visible]);

  const handleDismiss = async () => {
    try {
      // Mark the prompt as dismissed in AsyncStorage
      await AsyncStorage.setItem(PROMPT_SHOWN_KEY, 'true');
      console.log('Login prompt marked as dismissed');
      setShouldShowModal(false);
      onClose();
    } catch (error) {
      console.error('Error saving prompt dismissed status:', error);
    }
  };

  const handleLoginPress = () => {
    setShouldShowModal(false);
    onLoginPress();
  };

  if (!shouldShowModal) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      // style={{backgroundColor: 'red',padding:30}}
      visible={shouldShowModal}
      // visible={true}
      statusBarTranslucent={true}
      onRequestClose={handleDismiss}>
      <View style={styles.container}>
        <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={{top: 15, right: 15, bottom: 15, left: 15}}>
            <Text
              style={[
                styles.closeButtonText,
                isDark && styles.closeButtonTextDark,
              ]}>
              ×
            </Text>
          </TouchableOpacity>

          <View style={styles.modalBody}>
            <View style={styles.iconRow}>
              <LockIcon />
            </View>

            <Text style={[styles.title, isDark && styles.titleDark]}>
              {getTranslation('auth.login', selectedLanguage)}
            </Text>
            <Text
              style={[styles.description, isDark && styles.descriptionDark]}>
              {getTranslation('auth.loginToViewPrice', selectedLanguage)}
            </Text>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}>
              <Text style={styles.loginButtonText}>
                {getTranslation('auth.login', selectedLanguage)} /{' '}
                {getTranslation('auth.signup', selectedLanguage)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    width: 340,
    height: 373,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContentDark: {
    backgroundColor: '#2D2D2D',
  },
  modalBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#666666',
    fontWeight: '600',
  },
  closeButtonTextDark: {
    color: '#FFFFFF',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  descriptionDark: {
    color: '#CCCCCC',
  },
  loginButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginPromptModal;
