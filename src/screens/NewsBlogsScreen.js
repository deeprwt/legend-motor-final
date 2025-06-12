import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getBlogPosts} from '../services/api';
import {useTheme} from '../context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {getTranslation} from '../translations';

const {width} = Dimensions.get('window');

const NewsBlogsScreen = () => {
  const navigation = useNavigation();
  const {isDark} = useTheme();
  const {selectedLanguage} = useCurrencyLanguage();
  const [activeTab, setActiveTab] = useState('News');
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch news
      const newsResponse = await getBlogPosts({type: 'news', limit: 6});

      // Fetch blogs (articles)
      const blogsResponse = await getBlogPosts({type: 'articles', limit: 6});

      if (newsResponse.success && blogsResponse.success) {
        // Process and set news data
        setNewsData(newsResponse.data || []);

        // Process and set blogs data
        setBlogsData(blogsResponse.data || []);

        // Set featured post (first news item)
        if (newsResponse.data && newsResponse.data.length > 0) {
          setFeaturedPost(newsResponse.data[0]);
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

  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  const handlePostPress = post => {
    // Navigate to post detail screen with the post data
    navigation.navigate('BlogPostDetailScreen', {post});
    console.log('Post pressed:', post.title);
  };

  const renderTabIndicator = () => (
    <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'News' && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange('News')}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'News' && styles.activeTabText,
            isDark && styles.tabTextDark,
          ]}>
          {getTranslation('newsBlogs.news', selectedLanguage)}
        </Text>
        {activeTab === 'News' && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'Blogs' && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange('Blogs')}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'Blogs' && styles.activeTabText,
            isDark && styles.tabTextDark,
          ]}>
          {getTranslation('newsBlogs.blogs', selectedLanguage)}
        </Text>
        {activeTab === 'Blogs' && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
    </View>
  );

  const renderNewsItem = ({item, index}) => {
    // Construct image URL
    const imageUrl = item.coverImage
      ? {uri: `https://cdn.legendmotorsglobal.com${item.coverImage.original}`}
      : require('../components/home/car_Image.jpg');

    return (
      <TouchableOpacity
        style={[styles.newsCard, isDark && styles.newsCardDark]}
        onPress={() => handlePostPress(item)}>
        <View style={styles.cardInnerContainer}>
          <View style={styles.cardImageSection}>
            <Image
              source={imageUrl}
              style={styles.cardImage}
              resizeMode="cover"
            />
            {/* <View style={styles.numberOverlay}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View> */}
            <View style={styles.readTimeContainer}>
              <Text style={styles.readTimeText}>
                {getTranslation('newsBlogs.readTime', selectedLanguage)}
              </Text>
            </View>
          </View>

          <View style={styles.cardTextSection}>
            <Text
              style={[styles.cardTitle, isDark && styles.cardTitleDark]}
              numberOfLines={3}>
              {item.title}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.authorContainer}>
                <View
                  style={[
                    styles.authorAvatar,
                    isDark && styles.authorAvatarDark,
                  ]}>
                  <Text
                    style={[
                      styles.authorInitials,
                      isDark && styles.authorInitialsDark,
                    ]}>
                    {item.author
                      ? `${item.author.firstName.charAt(
                          0,
                        )}${item.author.lastName.charAt(0)}`
                      : ''}
                  </Text>
                </View>
                <Text
                  style={[styles.authorName, isDark && styles.authorNameDark]}>
                  {item.author
                    ? `${item.author.firstName} ${item.author.lastName}`
                    : 'Lorem ipsum'}
                </Text>
              </View>
              <View
                style={[
                  styles.dateContainer,
                  isDark && styles.dateContainerDark,
                ]}>
                <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                  30 Mar
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedPost = () => {
    if (!featuredPost) return null;

    // Construct image URL
    const imageUrl = featuredPost.coverImage
      ? {
          uri: `https://cdn.legendmotorsglobal.com${featuredPost.coverImage.original}`,
        }
      : require('../components/home/car_Image.jpg');

    return (
      <View style={styles.featuredSection}>
        <TouchableOpacity
          style={[styles.newsCard, isDark && styles.newsCardDark]}
          onPress={() => handlePostPress(featuredPost)}>
          <View style={styles.cardInnerContainer}>
            <View style={styles.cardImageSection}>
              <Image
                source={imageUrl}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {/* <View style={styles.numberOverlay}>
                <Text style={styles.numberText}>1</Text>
              </View> */}
              <View style={styles.readTimeContainer}>
                <Text style={styles.readTimeText}>
                  {getTranslation('newsBlogs.readTime', selectedLanguage)}
                </Text>
              </View>
            </View>

            <View style={styles.cardTextSection}>
              <Text
                style={[styles.cardTitle, isDark && styles.cardTitleDark]}
                numberOfLines={3}>
                {featuredPost.title}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.authorContainer}>
                  <View
                    style={[
                      styles.authorAvatar,
                      isDark && styles.authorAvatarDark,
                    ]}>
                    <Text
                      style={[
                        styles.authorInitials,
                        isDark && styles.authorInitialsDark,
                      ]}>
                      {featuredPost.author
                        ? `${featuredPost.author.firstName.charAt(
                            0,
                          )}${featuredPost.author.lastName.charAt(0)}`
                        : ''}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.authorName,
                      isDark && styles.authorNameDark,
                    ]}>
                    {featuredPost.author
                      ? `${featuredPost.author.firstName} ${featuredPost.author.lastName}`
                      : 'Lorem ipsum'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.dateContainer,
                    isDark && styles.dateContainerDark,
                  ]}>
                  <Text
                    style={[styles.dateText, isDark && styles.dateTextDark]}>
                    30 Mar
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBlogsContent = () => {
    if (blogsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            {getTranslation('newsBlogs.noBlogPosts', selectedLanguage)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.blogsContainer}>
        {renderFeaturedPost()}

        <FlatList
          data={blogsData.slice(1)} // Skip the first item as it's shown as featured
          renderItem={({item, index}) => {
            // Construct image URL
            const imageUrl = item.coverImage
              ? {
                  uri: `https://cdn.legendmotorsglobal.com${item.coverImage.original}`,
                }
              : require('../components/home/car_Image.jpg');

            // Adjust index to start from 2 since featured post is 1
            const displayIndex = index + 2;

            return (
              <TouchableOpacity
                style={[styles.newsCard, isDark && styles.newsCardDark]}
                onPress={() => handlePostPress(item)}>
                <View style={styles.cardInnerContainer}>
                  <View style={styles.cardImageSection}>
                    <Image
                      source={imageUrl}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    <View style={styles.numberOverlay}>
                      <Text style={styles.numberText}>{displayIndex}</Text>
                    </View>
                    <View style={styles.readTimeContainer}>
                      <Text style={styles.readTimeText}>
                        {getTranslation('newsBlogs.readTime', selectedLanguage)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardTextSection}>
                    <Text
                      style={[styles.cardTitle, isDark && styles.cardTitleDark]}
                      numberOfLines={3}>
                      {item.title}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.authorContainer}>
                        <View
                          style={[
                            styles.authorAvatar,
                            isDark && styles.authorAvatarDark,
                          ]}>
                          <Text
                            style={[
                              styles.authorInitials,
                              isDark && styles.authorInitialsDark,
                            ]}>
                            {item.author
                              ? `${item.author.firstName.charAt(
                                  0,
                                )}${item.author.lastName.charAt(0)}`
                              : ''}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.authorName,
                            isDark && styles.authorNameDark,
                          ]}>
                          {item.author
                            ? `${item.author.firstName} ${item.author.lastName}`
                            : 'Lorem ipsum'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.dateContainer,
                          isDark && styles.dateContainerDark,
                        ]}>
                        <Text
                          style={[
                            styles.dateText,
                            isDark && styles.dateTextDark,
                          ]}>
                          30 Mar
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable scrolling as it's inside a ScrollView
        />
      </View>
    );
  };

  const renderNewsContent = () => {
    if (newsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {getTranslation('newsBlogs.noNews', selectedLanguage)}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={newsData}
        renderItem={renderNewsItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable scrolling as it's inside a ScrollView
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#2D2D2D' : '#FFFFFF'}
        />
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {getTranslation('newsBlogs.title', selectedLanguage)}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            {getTranslation('newsBlogs.loadingContent', selectedLanguage)}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={isDark ? '#2D2D2D' : '#FFFFFF'}
        />
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {getTranslation('newsBlogs.title', selectedLanguage)}
        </Text>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, isDark && styles.retryButtonDark]}
            onPress={fetchBlogPosts}>
            <Text style={styles.retryText}>
              {getTranslation('common.retry', selectedLanguage)}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#2D2D2D' : '#FFFFFF'}
      />
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        {getTranslation('newsBlogs.title', selectedLanguage)}
      </Text>

      {renderTabIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'News' ? renderNewsContent() : renderBlogsContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  containerDark: {
    backgroundColor: '#2D2D2D',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  loadingTextDark: {
    color: '#CCCCCC',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTextDark: {
    color: '#FF6B6B',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  retryButtonDark: {
    backgroundColor: '#F47B20',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 16,
  },
  tabsContainerDark: {
    borderBottomColor: '#333333',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  tabTextDark: {
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#F47B20',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: '#F47B20',
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#CCCCCC',
  },
  newsCard: {
    marginHorizontal: 2,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'solid',
  },
  newsCardDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
  },
  cardInnerContainer: {
    flexDirection: 'row',
    height: 124,
  },
  cardImageSection: {
    width: '35%',
    height: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  numberOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
  },
  numberText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  readTimeContainer: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readTimeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  cardTextSection: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 8,
  },
  cardTitleDark: {
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  authorAvatarDark: {
    backgroundColor: '#333333',
  },
  authorInitials: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666666',
  },
  authorInitialsDark: {
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 12,
    color: '#666666',
    width: '70%',
  },
  authorNameDark: {
    color: '#CCCCCC',
  },
  dateContainer: {
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateContainerDark: {
    backgroundColor: '#2A2A2A',
  },
  dateText: {
    fontSize: 10,
    color: '#666666',
  },
  dateTextDark: {
    color: '#CCCCCC',
  },
  blogsContainer: {
    paddingVertical: 8,
  },
  featuredSection: {
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F47B20',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  featuredCard: {
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  featuredCardDark: {
    backgroundColor: '#1A1A1A',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredContent: {
    padding: 16,
  },
  featuredPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  featuredPostTitleDark: {
    color: '#FFFFFF',
  },
  featuredPostExcerpt: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  featuredPostExcerptDark: {
    color: '#CCCCCC',
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredTimeText: {
    fontSize: 12,
    color: '#F47B20',
    marginRight: 16,
  },
  featuredReadTime: {
    fontSize: 12,
    color: '#666666',
  },
  featuredReadTimeDark: {
    color: '#CCCCCC',
  },
  arrowButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F47B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NewsBlogsScreen;
