import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import LogoImage from '../assets/images/LangaugeScreenLogo.png';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import CleverTap from 'clevertap-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const languages = [
  {id: 'en', name: 'English (US)'},
  {id: 'zh-CN', name: 'Chinese'},
  {id: 'es', name: 'Spanish'},
  {id: 'ar', name: 'Arabic'},
  {id: 'ru', name: 'Russian'},
  {id: 'fr', name: 'French'},
];

const LanguageSelectScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const navigation = useNavigation();
  const context = useCurrencyLanguage();
  const handleNext = () => {
    // Example user profile data
    // id = '__52ab427647384beebe0608ee3cc407b8';
    // const userProfile = {
    //   Identity: 1991, // Unique Identity (MANDATORY)
    //   Email: 'satyamsen624@gmail.com', // Email ID
    //   // Phone: '+917247243141', // Phone with country code
    //   // custom1: 43,
    //   // ct_is_test_user: true,
    //   Name: 'Satyam Sen',
    // };

    // // Call this after login/signup or app start
    // CleverTap.setDebugLevel(3);
    // CleverTap.profileSet(userProfile);
    // console.log('settt Profile');

    // Navigate directly to Main screen
    AsyncStorage.setItem('firstTimeUser', 'true');
    context.setSelectedLanguage(selectedLanguage);
    navigation.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  };

  const handleLanguageSelect = langId => {
    setSelectedLanguage(langId);
    // You could save the selected language here if needed
    // For example: AsyncStorage.setItem('userLanguage', langId);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/legend-motors-light.png')}
          style={{width: 250, height: 100, resizeMode: 'contain'}}
        />
      </View>

      <Text style={styles.title}>Select a Language</Text>

      <ScrollView style={styles.languageList}>
        {languages.map(language => (
          <TouchableOpacity
            key={language.id}
            style={styles.languageItem}
            onPress={() => handleLanguageSelect(language.id)}>
            <Text style={styles.languageText}>{language.name}</Text>
            <View
              style={[
                styles.radio,
                selectedLanguage === language.id && styles.radioSelected,
              ]}>
              {selectedLanguage === language.id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
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
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 30,
    textAlign: 'center',
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  languageText: {
    fontSize: 16,
    color: '#333333',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#F4821F',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F4821F',
  },
  nextButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LanguageSelectScreen;
