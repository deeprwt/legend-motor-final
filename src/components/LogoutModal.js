import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import {useTheme, themeColors} from '../context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';

const LogoutModal = ({visible, onCancel, onLogout}) => {
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {backgroundColor: isDark ? '#3D3D3D' : '#FFFFFF'},
          ]}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
          <Text
            style={[styles.confirmationText, {color: themeColors[theme].text}]}>
            {t('auth.confirmLogout')}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5'},
              ]}
              onPress={onCancel}>
              <Text
                style={[
                  styles.cancelButtonText,
                  {color: themeColors[theme].text},
                ]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>{t('auth.yesLogout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Pressable style={styles.outsidePress} onPress={onCancel} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F47B20',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  outsidePress: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    left: 0,
    right: 0,
  },
});

export default LogoutModal;
