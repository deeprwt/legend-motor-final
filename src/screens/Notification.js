import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Ionicons} from '../utils/icon';
import {useNavigation} from '@react-navigation/native';
import {useTheme, themeColors} from '../context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import CleverTap from 'clevertap-react-native';
import axios from 'axios';

const Notification = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  const getStoredNotifications = async () => {
    const stored = await AsyncStorage.getItem('push_notifications');
    return stored ? JSON.parse(stored) : [];
  };
  const renderNotification = ({item}) => {
    return (
      <View>
        <Text style={[styles.sectionHeader, {color: themeColors[theme].text}]}>
          {t('notifications.today')}
        </Text>
        <View
          style={[
            styles.notificationCard,
            {backgroundColor: themeColors[theme].card},
          ]}>
          <View
            style={[
              styles.iconCircle,
              {backgroundColor: themeColors[theme].primary},
            ]}>
            <Ionicons name="notifications" size={24} color={'#FFFFFF'} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, {color: themeColors[theme].text}]}>
              {item?.title}
            </Text>
            <Text style={[styles.message, {color: isDark ? '#aaa' : '#666'}]}>
              {item?.message}
            </Text>
            {/* <TouchableOpacity
              style={[
                styles.button,
                {borderColor: themeColors[theme].primary},
              ]}>
              <Text
                style={[
                  styles.buttonText,
                  {color: themeColors[theme].primary},
                ]}>
                {t('notifications.viewDetails')}
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    );
  };

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

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        ListEmptyComponent={
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: isDark ? '#fff' : '#000'}}>
              {t('notifications.noNotifications')}
            </Text>
          </View>
        }
        style={{flex: 1}}
        contentContainerStyle={{flexGrow: 1}}
      />
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
    marginBottom: 10,
    marginTop: 25,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  notificationCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginVertical: 4,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default Notification;
