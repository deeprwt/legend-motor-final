import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, themeColors} from '../context/ThemeContext';
import HTML from 'react-native-render-html';
import {Dimensions} from 'react-native';
import api from 'src/services/api';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';

const CookiePolicyScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();
  const [loading, setLoading] = useState(true);
  const [cookieData, setCookieData] = useState(null);
  const [error, setError] = useState(null);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchCookiePolicyData();
  }, []);

  const fetchCookiePolicyData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`page/getBySlug?slug=cookie_policy`);

      if (response.data && response.data.success) {
        setCookieData(response.data.data);
      } else {
        setError(t('cookiePolicy.errorLoading'));
      }
    } catch (err) {
      console.error('Error fetching cookie policy:', err);
      setError(t('cookiePolicy.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Find the content section
  const contentSection = cookieData?.sections?.find(
    section =>
      section.sectionKey.includes('cookie_') ||
      section.sectionKey.includes('policy'),
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text
                style={[
                  styles.backButtonText,
                  {color: themeColors[theme].primary},
                ]}>
                {t('common.back')}
              </Text>
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, {color: themeColors[theme].text}]}>
              {cookieData?.title || t('cookiePolicy.title')}
            </Text>
          </View>
          <Text
            style={[styles.lastUpdated, {color: themeColors[theme].primary}]}>
            {t('cookiePolicy.lastUpdated')}:{' '}
            {cookieData?.updatedAt
              ? new Date(cookieData.updatedAt).toDateString()
              : ''}
          </Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={themeColors[theme].primary}
              />
              <Text
                style={[styles.loadingText, {color: themeColors[theme].text}]}>
                {t('cookiePolicy.loading')}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text
                style={[styles.errorText, {color: themeColors[theme].text}]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  {backgroundColor: themeColors[theme].primary},
                ]}
                onPress={fetchCookiePolicyData}>
                <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
              </TouchableOpacity>
            </View>
          ) : contentSection ? (
            <HTML
              source={{html: contentSection.content}}
              contentWidth={windowWidth - 32}
              baseStyle={{
                color: isDark ? '#FFFFFF' : '#333333',
                fontSize: 16,
                lineHeight: 24,
              }}
              tagsStyles={{
                p: {
                  marginBottom: 16,
                },
                a: {
                  color: themeColors[theme].primary,
                  textDecorationLine: 'underline',
                },
              }}
            />
          ) : (
            <Text style={[styles.paragraph, {color: themeColors[theme].text}]}>
              {t('cookiePolicy.noContent')}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
});

export default CookiePolicyScreen;
