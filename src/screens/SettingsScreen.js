import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Button,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {useTheme, themeColors} from '../context/ThemeContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const {user, logout} = useAuth();
  const {theme, isDark} = useTheme();

  // Add focus effect to detect when screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('SettingsScreen is focused');
      return () => {
        console.log('SettingsScreen is unfocused');
      };
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Yes, Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const navigateToPrivacyPolicy = () => {
    console.log('Attempting to navigate to TestNavigation screen');
    // Navigate to the test screen first
    navigation.navigate('TestNavigation');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Test Navigation Button */}
      <View style={styles.testButtonContainer}>
        <Button 
          title="Test Privacy Policy Navigation" 
          onPress={navigateToPrivacyPolicy} 
          color={isDark ? '#FFFFFF' : "#F47B20"}
        />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
            Settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
            Account
          </Text>
          <View
            style={[
              styles.card,
              {backgroundColor: isDark ? '#3D3D3D' : '#FFFFFF'},
            ]}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, {color: themeColors[theme].text}]}>
                {user?.firstName || ''} {user?.lastName || ''}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  {color: isDark ? '#FFFFFF' : themeColors[theme].textSecondary},
                ]}>
                {user?.email || ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
            Preferences
          </Text>
          <TouchableOpacity
            style={[
              styles.menuItem,
              {borderBottomColor: themeColors[theme].border},
            ]}
            onPress={() => navigation.navigate('LanguageScreen')}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Language
            </Text>
            <Text
              style={[
                styles.menuItemValue,
                {color: isDark ? '#FFFFFF' : themeColors[theme].primary},
              ]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.menuItem,
              {borderBottomColor: themeColors[theme].border},
            ]}
            onPress={() => navigation.navigate('NotificationSettings')}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Notifications
            </Text>
            <Text
              style={[
                styles.menuItemValue,
                {color: isDark ? '#FFFFFF' : themeColors[theme].primary},
              ]}>
              On
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
            Account & Security
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Change Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Privacy Settings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: themeColors[theme].text}]}>
            Help & Support
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Contact Support
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Terms of Service
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text
              style={[styles.menuItemText, {color: themeColors[theme].text}]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {backgroundColor: themeColors[theme].error},
          ]}
          onPress={handleLogout}>
          <Text style={[styles.logoutButtonText, {color: '#FFFFFF'}]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testButtonContainer: {
    padding: 16,
  },
});

export default SettingsScreen;
