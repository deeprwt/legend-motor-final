import React, {useEffect, useState, useCallback, useRef, memo} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SearchBar,
  CategoryFilter,
  PromotionBanner,
  PopularBrands,
  HotDeals,
  BodyTypeSearch,
  NewsBlogs,
  MostPopularCars,
  JustArrived,
} from '../components/home';
import LoginPromptModal from '../components/LoginPromptModal';
import {getCarList} from '../services/api';
import {SPACING, COLORS} from '../utils/constants';
import Header from '../components/home/Header';
import {FilterTabs} from '../components/explore';
import {useTheme} from '../context/ThemeContext';
import CleverTap from 'clevertap-react-native';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';

// Memoize components that don't need frequent re-renders
const MemoizedHeader = memo(Header);
const MemoizedSearchBar = memo(SearchBar);
const MemoizedCategoryFilter = memo(CategoryFilter);
const MemoizedPromotionBanner = memo(PromotionBanner);

// Key for AsyncStorage
const LOGIN_PROMPT_SHOWN = 'login_prompt_dismissed';

// Create a component for deferred loading
const DeferredComponent = memo(
  ({component: Component, isVisible, ...props}) => {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
      if (isVisible && !shouldRender) {
        // Shorter delay for rendering
        setTimeout(() => {
          setShouldRender(true);
        }, 100);
      }
    }, [isVisible, shouldRender]);

    if (!shouldRender) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#5E366D" />
        </View>
      );
    }
    return <Component {...props} />;
  },
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const {user, isAuthenticated, checkAuthStatus} = useAuth();
  const {isDark} = useTheme();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [checkedPromptStatus, setCheckedPromptStatus] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    header: true,
    search: true,
    categoryFilter: true,
    promotionBanner: true,
    popularBrands: true,
    hotDeals: true,
    justArrived: true,
    mostPopularCars: true,
    bodyTypeSearch: true,
    newsBlogs: true,
  });
  const scrollViewRef = useRef(null);
  const filterCategories = [
    {id: 'all', label: 'All'},
    {id: 'brands', label: 'Brands'},
    {id: 'models', label: 'Models'},
    {id: 'trims', label: 'Trims'},
    {id: 'years', label: 'Years'},
    {id: 'advanced', label: 'Advanced Filters'},
  ];
  // Load initial data and track scroll position
  const handleOpenFilter = useCallback(
    filterId => {
      // Navigate to FilterScreen with current filters
      navigation.navigate('FilterScreen', {
        filterType: ['all', 'advanced'].includes(filterId)
          ? 'brands'
          : filterId,
        // Use a callback that sets applied filters directly
        onApplyCallback: newFilters => {
          // Update filters state
          navigation.navigate('ExploreTab', {filters: newFilters});

          // The useEffect hook will automatically trigger a fetch with new filters
        },
      });
    },
    [navigation],
  );
  const handleFilterSelect = filterId => {
    // if (filterId === 'advanced') {
    // Open the filter screen
    setTimeout(() => {
      handleOpenFilter(filterId);
    }, 100);
    // }
  };
  const {sendEventCleverTap} = useCleverTap();
  useEffect(() => {
    const chackUser = async () => {
      let isAuth = checkAuthStatus();
      if (isAuth) {
        setShowLoginPrompt(false);
        sendEventCleverTap(CLEVERTAP_EVENTS.DAILY_CHECK_IN);
      } else {
        setShowLoginPrompt(true);
        sendEventCleverTap(CLEVERTAP_EVENTS.GUEST_LOGIN);
      }
    };
    chackUser();
  }, []);
  // Check login prompt status once
  //

  // Add a state to prevent multiple navigations
  const [isNavigating, setIsNavigating] = useState(false);

  const handleScroll = useCallback(
    event => {
      // Get current scroll position
      const currentOffset = event.nativeEvent.contentOffset.y;
      // Get the screen height
      const screenHeight = event.nativeEvent.layoutMeasurement.height;
      // Get the total content height
      const contentHeight = event.nativeEvent.contentSize.height;

      // Check if user has scrolled to the bottom (with a small threshold)
      const isScrolledToBottom =
        currentOffset + screenHeight >= contentHeight - 20;

      if (isScrolledToBottom && !isNavigating) {
        // Set navigating flag to prevent multiple triggers
        setIsNavigating(true);

        // Add a small delay to make the transition feel smoother
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: 0,
            animated: true,
          });
          navigation.navigate('ExploreTab');

          // Reset the flag after a bit longer to prevent immediate re-triggering
          // if the user navigates back to the home screen
          setTimeout(() => {
            setIsNavigating(false);
          }, 1000);
        }, 300);
      }
    },
    [navigation, isNavigating],
  );

  const handleLoginPress = useCallback(() => {
    setShowLoginPrompt(false);
    navigation.navigate('Login');
  }, [navigation]);

  const handleSkipLogin = useCallback(() => {
    setShowLoginPrompt(false);
  }, []);

  // Handle navigation to settings
  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Handle navigation to wishlist
  const navigateToWishlist = useCallback(() => {
    if (user) {
      navigation.navigate('MyWishlistScreen');
    } else {
      setShowLoginPrompt(true);
    }
  }, [navigation, user]);

  const handleSearchBarFilterApply = useCallback(
    filters => {
      navigation.navigate('ExploreTab', {filters});
    },
    [navigation],
  );

  const handleSearch = useCallback(
    searchText => {
      console.log('Search text:', searchText);
      navigation.navigate('ExploreTab', {search: searchText});
    },
    [navigation],
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5'},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#2D2D2D' : '#FFFFFF'}
      />
      <>
        {/* Header with user info from auth context */}
        <MemoizedHeader
          user={user}
          onSettingsPress={navigateToSettings}
          onWishlistPress={navigateToWishlist}
        />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={false}>
          <View
            style={[
              styles.content,
              {backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5'},
            ]}>
            {/* Search Bar */}
            <MemoizedSearchBar
              onApplyFilters={handleSearchBarFilterApply}
              onSearch={handleSearch}
              home={true}
            />

            {/* Category Filter */}
            <FilterTabs
              categories={filterCategories}
              activeFilter={null}
              onSelect={handleFilterSelect}
              home={true}
            />

            {/* Promotion Banner */}
            <MemoizedPromotionBanner />

            {/* Popular Brands */}
            <PopularBrands />

            {/* Hot Deals */}
            <HotDeals user={user} />

            {/* Just Arrived */}
            <JustArrived />

            {/* Most Popular Cars */}
            <MostPopularCars />

            {/* Body Type Search */}
            <BodyTypeSearch />

            {/* News and Blogs */}
            <NewsBlogs />
          </View>
        </ScrollView>
      </>
      {/* Login Prompt Modal - only show if checked and should be shown */}

      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={handleSkipLogin}
        onLoginPress={handleLoginPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 60,
    paddingBottom: 24,
  },
  content: {
    paddingBottom: 70,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(HomeScreen);
