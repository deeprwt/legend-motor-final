import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {COLORS} from 'src/utils/constants';

// Back Arrow Icon
const BackIcon = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={themeColors[theme].text}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Radio Button Selected
const RadioSelected = () => {
  const {theme, isDark} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="11"
        stroke={isDark ? '#FFFFFF' : themeColors[theme].primary}
        strokeWidth="2"
      />
      <Circle
        cx="12"
        cy="12"
        r="6"
        fill={isDark ? '#FFFFFF' : themeColors[theme].primary}
      />
    </Svg>
  );
};

// Radio Button Unselected
const RadioUnselected = () => {
  const {theme} = useTheme();
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="11"
        stroke={themeColors[theme].border}
        strokeWidth="2"
      />
    </Svg>
  );
};

const LanguageScreen = () => {
  const navigation = useNavigation();
  const {selectedLanguage, setSelectedLanguage} = useCurrencyLanguage();
  const {theme, isDark} = useTheme();
  const [currentLanguage, setCurrentLanguage] = useState(
    selectedLanguage || 'en',
  );

  const handleSelectLanguage = language => {
    setCurrentLanguage(language.id);
    // setSelectedLanguage(language.id);
  };
  const applyLanguage = () => {
    setSelectedLanguage(currentLanguage);
    navigation.goBack();
  };

  const suggestedLanguages = [
    {id: 'en', name: 'English (US)'},
    {id: 'ar', name: 'Arabic'},
  ];

  const otherLanguages = [
    {id: 'zh-CN', name: 'Chinese'},
    {id: 'es', name: 'Spanish'},
    {id: 'ru', name: 'Russian'},
    {id: 'fr', name: 'French'},
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View
        style={[styles.header, {borderBottomColor: themeColors[theme].border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
          Language
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {color: isDark ? '#EF9439' : themeColors[theme].primary},
            ]}>
            Suggested
          </Text>

          {suggestedLanguages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageItem,
                {borderBottomColor: themeColors[theme].border},
              ]}
              onPress={() => handleSelectLanguage(language)}>
              <Text
                style={[
                  styles.languageName,
                  {color: themeColors[theme].text},
                  language.id === currentLanguage && {
                    color: isDark ? '#EF9439' : themeColors[theme].primary,
                  },
                ]}>
                {language.name}
              </Text>
              {currentLanguage === language.id ? (
                <RadioSelected />
              ) : (
                <RadioUnselected />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {color: isDark ? '#EF9439' : themeColors[theme].primary},
            ]}>
            Language
          </Text>

          {otherLanguages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageItem,
                {borderBottomColor: themeColors[theme].border},
              ]}
              onPress={() => handleSelectLanguage(language)}>
              <Text
                style={[
                  styles.languageName,
                  {color: themeColors[theme].text},
                  currentLanguage === language.id && {
                    color: isDark ? '#EF9439' : themeColors[theme].primary,
                  },
                ]}>
                {language.name}
              </Text>
              {currentLanguage === language.id ? (
                <RadioSelected />
              ) : (
                <RadioUnselected />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.applyButtonContainer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyLanguage}>
          <Text style={styles.applyButtonText}>Apply Language</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  languageName: {
    fontSize: 18,
  },
  applyButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 24,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LanguageScreen;
