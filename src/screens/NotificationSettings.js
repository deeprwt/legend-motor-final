import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
} from 'react-native';
import {Ionicons} from '../utils/icon';
import {useNavigation} from '@react-navigation/native';
import {useTheme, themeColors} from '../context/ThemeContext';
import {useAuth} from 'src/context/AuthContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import CleverTap from 'clevertap-react-native';

const NotificationSettings = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();
  const [generalNotifications, setGeneralNotifications] = React.useState();
  const [appUpdates, setAppUpdates] = React.useState();
  const {user} = useAuth();

  useEffect(() => {
    CleverTap.profileGetProperty('GeneralNotifications', value => {
      console.log('GeneralNotifications', value);
      setGeneralNotifications(value);
    });
    CleverTap.profileGetProperty('AppUpdates', value => {
      console.log('AppUpdates', value);
      setAppUpdates(value);
    });
  }, []);

  useEffect(() => {
    const userProfile = {
      FirstName: user?.firstName,
      LastName: user?.lastName,
      Phone: user?.phone,
      Identity: user?.id, // Unique identity
      Email: user?.email,
      GeneralNotifications: generalNotifications,
      AppUpdates: appUpdates,
    };
    CleverTap.profileSet(userProfile);
  }, [appUpdates, generalNotifications]);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: themeColors[theme].background},
      ]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={themeColors[theme].text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerText, {color: themeColors[theme].text}]}>
          {t('notifications.title')}
        </Text>
      </View>
      <Text style={[styles.description, {color: themeColors[theme].text}]}>
        {t('notifications.description')}
      </Text>
      <View
        style={[styles.settingRow, {backgroundColor: themeColors[theme].card}]}>
        <Text style={[styles.settingLabel, {color: themeColors[theme].text}]}>
          {t('notifications.generalNotifications')}
        </Text>
        <Switch
          value={generalNotifications}
          onValueChange={setGeneralNotifications}
          trackColor={{
            false: isDark ? '#444' : '#ddd',
            true: themeColors[theme].primary,
          }}
          thumbColor={generalNotifications ? '#fff' : '#fff'}
        />
      </View>
      <View
        style={[styles.settingRow, {backgroundColor: themeColors[theme].card}]}>
        <Text style={[styles.settingLabel, {color: themeColors[theme].text}]}>
          {t('notifications.appUpdates')}
        </Text>
        <Switch
          value={appUpdates}
          onValueChange={setAppUpdates}
          trackColor={{
            false: isDark ? '#444' : '#ddd',
            true: themeColors[theme].primary,
          }}
          thumbColor={appUpdates ? '#fff' : '#fff'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 25,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
});

export default NotificationSettings;
