import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getBlogPosts} from '../../services/api';
import {useTheme} from 'src/context/ThemeContext';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';
import {getTranslation} from '../../translations';

const {width} = Dimensions.get('window');

const NewsBlogs = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [blogsData, setBlogsData] = useState([]);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);
  const {isDark} = useTheme();
  const {selectedLanguage} = useCurrencyLanguage();

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const blogsResponse = await getBlogPosts({type: 'articles', limit: 6});

      if (blogsResponse.success) {
        setBlogsData(blogsResponse.data || []);

        if (blogsResponse.data && blogsResponse.data.length > 0) {
          setFeaturedPost(blogsResponse.data[0]);
        }
      } else {
        setError(getTranslation('newsBlogs.errorLoading', selectedLanguage));
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError(getTranslation('newsBlogs.connectionError', selectedLanguage));
    } finally {
      setLoading(false);
    }
  };

  const handlePostPress = post => {
    navigation.navigate('BlogPostDetailScreen', {post});
    console.log('Post pressed:', post.title);
  };

  const renderBlogsContent = () => {
    if (blogsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, {color: isDark ? '#FFFFFF' : '#666'}]}>
            {getTranslation('newsBlogs.noBlogPosts', selectedLanguage)}
          </Text>
        </View>
      );
    }

    const firstBlog = blogsData[0];

    const featuredImageUrl = firstBlog.coverImage
      ? {
          uri: `https://cdn.legendmotorsglobal.com${firstBlog.coverImage.original}`,
        }
      : require('./car_Image.jpg');

    return (
      <View style={styles.blogsContainer}>
        <TouchableOpacity
          style={[
            styles.featuredCard,
            {backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF'},
          ]}
          onPress={() => handlePostPress(firstBlog)}>
          <Image
            source={featuredImageUrl}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredContent}>
            <Text
              style={[
                styles.featuredPostTitle,
                {color: isDark ? '#FFFFFF' : '#333'},
              ]}>
              {firstBlog.title}
            </Text>
            <Text
              style={[
                styles.featuredPostExcerpt,
                {color: isDark ? '#CCCCCC' : '#666'},
              ]}
              numberOfLines={2}>
              {firstBlog.excerpt ||
                getTranslation('newsBlogs.readMore', selectedLanguage)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
        ]}>
        <View
          style={[
            styles.loadingContainer,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text
            style={[styles.loadingText, {color: isDark ? '#FFFFFF' : '#666'}]}>
            {getTranslation('newsBlogs.loadingContent', selectedLanguage)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
        ]}>
        <View
          style={[
            styles.errorContainer,
            {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
          ]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBlogPosts}>
            <Text style={styles.retryText}>
              {getTranslation('common.retry', selectedLanguage)}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
      ]}>
      <View
        style={[
          styles.container,
          {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
        ]}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.normalTitleText,
              {color: isDark ? '#FFFFFF' : '#333'},
            ]}>
            {getTranslation('newsBlogs.title', selectedLanguage)}
          </Text>
        </View>

        {renderBlogsContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'none',
  },
  container: {
    width: 380,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    backgroundColor: 'none',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  normalTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 5,
  },
  loadingContainer: {
    width: 380,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    width: 380,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  blogsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'none',
  },
  featuredCard: {
    width: 348,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  featuredImage: {
    width: '100%',
    height: 256,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  featuredContent: {
    padding: 16,
  },
  featuredPostTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredPostExcerpt: {
    fontSize: 14,
    marginBottom: 8,
  },
});

export default NewsBlogs;
