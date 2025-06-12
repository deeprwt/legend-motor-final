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
import axios from 'axios';
import {API_BASE_URL, API_KEY} from '../utils/apiConfig';
import api from 'src/services/api';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {t} = useCurrencyLanguage();
  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState(null);
  const [error, setError] = useState(null);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchPolicyData();
  }, []);

  const fetchPolicyData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`page/getBySlug?slug=privacy_policy`);

      if (response.data && response.data.success) {
        setPolicyData(response.data.data);
      } else {
        setError(t('privacyPolicy.errorLoading'));
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      setError(t('privacyPolicy.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  // Find the content section
  const contentSection = policyData?.sections?.find(
    section => section.sectionKey === 'privacy_content',
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
              {policyData?.title || t('privacyPolicy.title')}
            </Text>
          </View>
          <Text
            style={[styles.lastUpdated, {color: themeColors[theme].primary}]}>
            {t('privacyPolicy.lastUpdated')}:{' '}
            {policyData?.updatedAt
              ? new Date(policyData.updatedAt).toDateString()
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
                {t('privacyPolicy.loading')}
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
                onPress={fetchPolicyData}>
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
              {t('privacyPolicy.noContent')}
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

export default PrivacyPolicyScreen;
