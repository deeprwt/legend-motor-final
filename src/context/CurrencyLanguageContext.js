import React, {createContext, useState, useContext, useEffect} from 'react';
import api from '../services/api';
import i18n from '../translations';
import {I18nManager, Image} from 'react-native';
import {useTheme} from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyLanguageContext = createContext();
export const symbol = {
  USD: '$',
  AED: () => {
    const {isDark} = useTheme();
    return (
      <Image
        style={{height: 20, width: 20, tintColor: isDark ? '#fff' : '#5E366D'}}
        source={require('../assets/images/dhyram.png')}
      />
    );
  },
};

export const CurrencyLanguageProvider = ({children}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Function to change language
  const changeLanguage = async language => {
    console.log('language', language);
    setSelectedLanguage(language);
    i18n.locale = language;

    // Save language to AsyncStorage
    try {
      await AsyncStorage.setItem('selectedLanguage', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }

    // Handle RTL languages
    const isRTL = language === 'ar';
    // I18nManager.allowRTL(isRTL);
    // I18nManager.forceRTL(isRTL);

    // Update API default params
    api.defaults.params = {
      lang: language,
    };
  };

  // Function to change currency
  const changeCurrency = async currency => {
    setSelectedCurrency(currency);
    try {
      await AsyncStorage.setItem('selectedCurrency', currency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  // Initialize language and currency on mount
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        const savedCurrency = await AsyncStorage.getItem('selectedCurrency');

        if (savedLanguage) {
          changeLanguage(savedLanguage);
        }
        if (savedCurrency) {
          setSelectedCurrency(savedCurrency);
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    };

    initializeSettings();
  }, []);

  // Context value
  const value = {
    selectedLanguage,
    setSelectedLanguage: changeLanguage,
    t: (key, params = selectedLanguage) => i18n.t(key, params),
    selectedCurrency,
    setSelectedCurrency: changeCurrency,
  };

  return (
    <CurrencyLanguageContext.Provider value={value}>
      {children}
    </CurrencyLanguageContext.Provider>
  );
};

export const useCurrencyLanguage = () => {
  const context = useContext(CurrencyLanguageContext);
  if (!context) {
    throw new Error(
      'useCurrencyLanguage must be used within an CurrencyLanguageProvider',
    );
  }
  return context;
};

export default CurrencyLanguageContext;
