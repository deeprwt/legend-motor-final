import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
  Linking,
  StatusBar,
  Share,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getCarByIdOrSlug, getUserEnquiries} from '../services/api';
import {COLORS, SPACING, FONT_SIZES, BORDER_RADIUS} from '../utils/constants';
import {CarImage, CarImageCarousel} from '../components/common';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AntDesign, Ionicons} from '../utils/icon';
import {Svg, Mask, G, Path, Rect} from 'react-native-svg';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useWishlist} from '../context/WishlistContext';
import RenderHtml from 'react-native-render-html';
import {useAuth} from '../context/AuthContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import {
  extractColorsFromSlug,
  createColorMatchFunction,
} from '../utils/colorUtils';
import LoginPromptModal from '../components/LoginPromptModal';
import {useLoginPrompt} from '../hooks/useLoginPrompt';
import ThumbImage from '../components/common/ThumbImage';
import {preloadImages} from '../utils/ImageCacheManager';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';
import Dhyram from 'src/components/Dhyram';

// Import custom icons
const LtrIcon = require('../components/explore/icon_assets/ltr.png');
const ElectricIcon = require('../components/explore/icon_assets/electric.png');
const AutomaticIcon = require('../components/explore/icon_assets/Automatic.png');
const CountryIcon = require('../components/explore/icon_assets/country.png');
const SteeringIcon = require('../components/explore/icon_assets/Steering.png');

const {width} = Dimensions.get('window');

// Helper function to convert color names to hex color codes
const getColorHex = colorName => {
  const colorMap = {
    white: '#FFFFFF',
    black: '#000000',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    grey: '#808080',
    gray: '#808080',
    silver: '#C0C0C0',
    gold: '#FFD700',
    beige: '#F5F5DC',
    tan: '#D2B48C',
    maroon: '#800000',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    ivory: '#FFFFF0',
    cream: '#FFFDD0',
    burgundy: '#800020',
    turquoise: '#40E0D0',
    bronze: '#CD7F32',
    champagne: '#F7E7CE',
  };

  // Default to a light gray if color not found
  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
};

// Helper function to determine if a color is dark (for text contrast)
const isColorDark = hexColor => {
  // Handle invalid input
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return false;
  }

  // Remove the # and handle both 3 and 6 character hex codes
  const hex = hexColor.replace('#', '');
  let r, g, b;

  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return false;
  }

  // Calculate luminance using the formula:
  // Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Color is considered dark if luminance is less than 0.5
  return luminance < 0.5;
};

// Update ThumbnailList component to match timing with the main auto-scroll
const ThumbnailList = memo(
  ({
    images,
    selectedIndex,
    onSelectImage,
    carouselRef,
    listRef,
    setAutoScrolling,
    autoScrollTimerRef,
  }) => {
    const logRender = useRef(0);

    // Memoize images data to avoid re-renders
    const memoizedImages = useMemo(
      () => images || [],
      [images ? images.length : 0],
    );

    // Create a memoized render function with selected state dependency
    const renderThumbnailItem = useCallback(
      ({item, index}) => {
        // Determine if this thumbnail is the selected one
        const isSelected = selectedIndex === index;

        return (
          <TouchableOpacity
            style={[
              styles.thumbnailItem,
              isSelected ? styles.thumbnailItemSelected : null,
            ]}
            activeOpacity={1}
            onPress={() => {
              // Temporarily disable scrolling
              if (listRef.current) {
                listRef.current.setNativeProps({
                  scrollEnabled: false,
                });
              }

              // Update selected index immediately
              onSelectImage(index);

              // Temporarily pause auto-scrolling
              setAutoScrolling(false);

              // Manually scroll the carousel without animation
              if (carouselRef.current) {
                carouselRef.current.scrollToIndex({
                  index: index,
                  animated: false,
                });
              }

              // Re-enable scrolling after a short delay
              setTimeout(() => {
                if (listRef.current) {
                  listRef.current.setNativeProps({
                    scrollEnabled: true,
                  });
                }
              }, 50);

              // Resume auto-scrolling after 5 seconds (matching main handler)
              clearTimeout(autoScrollTimerRef.current);
              autoScrollTimerRef.current = setTimeout(() => {
                setAutoScrolling(true);
              }, 5000);
            }}>
            <ThumbImage
              source={item}
              style={styles.thumbnailImage}
              resizeMode="cover"
              selected={isSelected}
              fadeDuration={0}
              transition={false}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        );
      },
      [
        selectedIndex,
        onSelectImage,
        setAutoScrolling,
        carouselRef,
        autoScrollTimerRef,
        listRef,
      ],
    );

    // No need to render if no images
    if (!memoizedImages || memoizedImages.length <= 1) return null;

    return (
      <View style={styles.thumbnailsContainer}>
        <FlatList
          ref={listRef}
          data={memoizedImages}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => `thumbnail-${index}`}
          contentContainerStyle={styles.thumbnailsContent}
          onScrollBeginDrag={() => setAutoScrolling(false)}
          getItemLayout={(data, index) => ({
            length: 94,
            offset: 94 * index,
            index,
          })}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={false}
          updateCellsBatchingPeriod={50}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          scrollEnabled={true}
          renderItem={renderThumbnailItem}
          onScrollToIndexFailed={info => {
            console.warn(
              'Failed to scroll to index',
              info.index,
              info.highestMeasuredFrameIndex,
            );
          }}
        />
      </View>
    );
  },
);

const CarDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {carId, lang = 'en'} = route.params || {};
  const {selectedCurrency, t} = useCurrencyLanguage();
  const {user, isAuthenticated, checkAuthStatus} = useAuth();
  const {theme, isDark} = useTheme();
  const colors = themeColors[theme];
  const {
    isInWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    fetchWishlistItems,
  } = useWishlist();
  const {width} = useWindowDimensions();

  // State declarations
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('exterior');
  const [extractedColors, setExtractedColors] = useState([]);
  const [extractedInteriorColors, setExtractedInteriorColors] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAlreadyInquired, setIsAlreadyInquired] = useState(false);
  const [userEnquiries, setUserEnquiries] = useState([]);
  const [autoScrolling, setAutoScrolling] = useState(true);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [autoScrollRaf, setAutoScrollRaf] = useState(null);

  // Refs declarations
  const carouselRef = useRef(null);
  const thumbnailsListRef = useRef(null);
  const bottomThumbnailsListRef = useRef(null);
  const autoScrollTimerRef = useRef(null);
  const thumbnailRenderCount = useRef(0);
  // Add these refs for use in the auto-scrolling effect
  const autoScrollingRef = useRef(autoScrolling);
  const selectedImageIndexRef = useRef(selectedImageIndex);
  const activeTabRef = useRef(activeTab);

  const {sendEventCleverTap} = useCleverTap();

  // Add state for managing accordion open/close state
  const [expandedAccordions, setExpandedAccordions] = useState({
    interior_feature: false,
    exterior_and_controls: false,
    security: false,
    comfort_and_convenience: false,
    infotainment: false,
  });

  // Add the login prompt hook
  const {
    loginModalVisible,
    hideLoginPrompt,
    navigateToLogin,
    checkAuthAndShowPrompt,
  } = useLoginPrompt();

  // Function to toggle accordion state
  const toggleAccordion = category => {
    setExpandedAccordions(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    fetchCarDetails();
  }, [carId]);

  useEffect(() => {
    // Fetch user's enquiries if user is authenticated
    if (isAuthenticated && user) {
      fetchUserEnquiries();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Check if car is in the user's enquiries list
    checkIfAlreadyInquired();
  }, [car, userEnquiries]);

  useEffect(() => {
    // Extract colors when car data changes
    if (car && car.slug) {
      const exteriorColors = extractColorsFromSlug(car.slug, 'exterior');
      const interiorColors = extractColorsFromSlug(car.slug, 'interior');

      setExtractedColors(exteriorColors);
      setExtractedInteriorColors(interiorColors);

      console.log('Extracted exterior colors:', exteriorColors);
      console.log('Extracted interior colors:', interiorColors);
    }
  }, [car]);

  // Effect to update isFavorite status when car data or wishlist changes
  useEffect(() => {
    if (car && car.id) {
      const favoriteStatus = isInWishlist(car.id);
      console.log(`Car ${car.id} favorite status:`, favoriteStatus);
      setIsFavorite(favoriteStatus);
    }
  }, [car, isInWishlist]);

  // Effect to preload images when car data changes
  useEffect(() => {
    if (car && !imagesPreloaded) {
      const allImages = getAllImages();

      // First preload all main carousel images
      preloadImages(allImages).then(() => {
        console.log('All main images preloaded');
        setImagesPreloaded(true);
      });
    }
  }, [car]);

  // Add an effect to handle tab changes
  useEffect(() => {
    console.log(`Tab changed to: ${activeTab}, resetting index to 0`);
  }, [activeTab]);

  // Update the handleImagePress function
  const handleImagePress = index => {
    // If an index is provided, update the selected index
    if (typeof index === 'number') {
      setSelectedImageIndex(index);
    }

    // Pause auto-scrolling temporarily
    setAutoScrolling(false);

    // Clear any existing RAF to stop current auto-scrolling
    if (autoScrollRaf) {
      cancelAnimationFrame(autoScrollRaf);
    }

    // Resume auto-scrolling after a delay
    clearTimeout(autoScrollTimerRef.current);
    autoScrollTimerRef.current = setTimeout(() => {
      setAutoScrolling(true);
    }, 5000); // 5 seconds pause when user interacts
  };

  // Function to handle viewing similar color cars
  const handleViewSimilarColorCars = () => {
    if (!car || !car.slug || extractedColors.length === 0) {
      alert('No color information available for this car.');
      return;
    }

    // Create filter object with extracted colors
    const filters = {
      specifications: {
        color: extractedColors,
      },
      extractColorsFromSlug: true,
      // Create a match function using our utility
      matchExtractedColors: createColorMatchFunction(extractedColors),
      // Flags to help ExploreScreen understand what we're filtering by
      colorFilter: true,
      colorNames: extractedColors,
    };

    // Navigate to ExploreScreen with color filters
    navigation.navigate('ExploreTab', {
      filters: filters,
      colorSearch: true,
      title: `Similar ${extractedColors.join('/')} Cars`,
    });
  };

  const fetchCarDetails = async () => {
    let isAuth = await checkAuthStatus();
    if (!carId) {
      setError('No car ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to fetch car details for ID: ${carId}`);

      // Add retry mechanism
      let attempts = 0;
      const maxAttempts = 2;
      let response = null;

      while (attempts < maxAttempts && !response?.success) {
        attempts++;
        if (attempts > 1) {
          console.log(`Retry attempt ${attempts} for car ID: ${carId}`);
          // Short delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
          response = await getCarByIdOrSlug(carId, lang);
          if (isAuth) {
            sendEventCleverTap(CLEVERTAP_EVENTS.VIEW_CAR_DETAILS, {
              carId: carId,
              carTitle: carTitle,
            });
          } else {
            sendEventCleverTap(CLEVERTAP_EVENTS.BROWSING_CAR_GUEST, {
              carId: carId,
              carTitle: carTitle,
            });
          }
        } catch (fetchError) {
          console.error(`Attempt ${attempts} failed:`, fetchError);
          // Continue to next attempt
        }
      }

      if (response?.success && response?.data) {
        console.log('Car details fetched successfully:', response.data);
        setCar(response.data);
      } else {
        console.log(
          'Failed to fetch car details:',
          response?.message || 'Unknown error',
        );
        setError(response?.message || 'Failed to fetch car details');
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('An error occurred while fetching car details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnquiries = async () => {
    try {
      const response = await getUserEnquiries();
      if (response.success && Array.isArray(response.data)) {
        setUserEnquiries(response.data);
        console.log('Fetched user enquiries:', response.data.length);
      } else {
        console.error(
          'Failed to fetch user enquiries:',
          response.message || 'Unknown error',
        );
      }
    } catch (error) {
      console.error('Error fetching user enquiries:', error);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const checkIfAlreadyInquired = () => {
    // Check if the current car ID is in the user's enquiries
    if (car && car.id && userEnquiries.length > 0) {
      // Find if this car is in the user's enquiries
      const hasInquired = userEnquiries.some(inquiry => {
        // Check both direct carId and car.id property inside nested car object
        return (
          inquiry.carId === car.id || (inquiry.car && inquiry.car.id === car.id)
        );
      });

      console.log(`Car ${car.id} already inquired status:`, hasInquired);
      setIsAlreadyInquired(hasInquired);
    }
  };

  const handleInquire = async () => {
    // Navigate to the enquiry form screen with car details
    if (!car) {
      console.error('Cannot navigate to enquiry form: No car data available');
      return;
    }

    // Check if user is authenticated first
    const isAuthorized = await checkAuthAndShowPrompt();
    if (!isAuthorized) {
      return; // Stop here if user is not authenticated
    }

    // If already inquired, show a message instead of navigating
    if (isAlreadyInquired) {
      Alert.alert(
        'Already Inquired',
        'You have already submitted an inquiry for this car. Check your inquiries for updates.',
        [
          {
            text: 'View My Inquiries',
            onPress: () =>
              navigation.navigate('Main', {screen: 'EnquiriesTab'}),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
      );
      return;
    }

    console.log('Navigating to enquiry form with car ID:', car.id);

    // Ensure we're passing a valid carId and image
    const carImageData =
      memoizedCarImages && memoizedCarImages.length > 0
        ? memoizedCarImages[0]
        : null;

    navigation.navigate('EnquiryFormScreen', {
      carId: car.id, // Ensure this is a valid car ID
      carTitle:
        title ||
        `${car.Year?.year || ''} ${car.Brand?.name || ''} ${
          car.CarModel?.name || ''
        }`,
      carImage: carImageData,
      carPrice: isAuthenticated ? price : null,
      currency: selectedCurrency,
      onEnquirySubmit: (success, isAlreadySubmitted) => {
        // After submission, update the local state and refresh enquiries
        if (success || isAlreadySubmitted) {
          setIsAlreadyInquired(true);
          fetchUserEnquiries();
        }
      },
    });
  };

  const toggleFavorite = async () => {
    try {
      if (!car) {
        console.log('Cannot toggle favorite: No car data available');
        return;
      }

      // Check if user is authenticated first
      const isAuthorized = await checkAuthAndShowPrompt();
      if (!isAuthorized) {
        return; // Stop here if user is not authenticated
      }

      setProcessingWishlist(true);
      console.log(
        `Toggling favorite for car ID: ${car.id}, current status: ${isFavorite}`,
      );

      let result;
      if (isFavorite) {
        result = await removeItemFromWishlist(car.id);
        if (result.success) {
          console.log(`Successfully removed car ${car.id} from wishlist`);
          setIsFavorite(false);
        }
      } else {
        result = await addItemToWishlist(car.id);
        if (result.success) {
          console.log(`Successfully added car ${car.id} to wishlist`);
          setIsFavorite(true);
        }
      }

      if (!result.success && !result.requiresAuth) {
        console.error('Wishlist operation failed');
        Alert.alert('Error', 'Failed to update wishlist. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'An error occurred while updating your wishlist.');
    } finally {
      setProcessingWishlist(false);
    }
  };

  const handleShare = async () => {
    if (!car) return;
    const shareLink = `https://legendmotorsglobal.com/cars/new-cars/${car.Brand?.slug}/${car.CarModel?.slug}/${car.Year?.year}/${car?.slug}`;

    try {
      await Share.share({
        message: `Check out this ${car.Year?.year} ${car.Brand?.name} ${car.CarModel?.name}!`,
        url: shareLink,
        title: 'Share this car',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getImagesByType = type => {
    if (!car || !car.CarImages || !Array.isArray(car.CarImages)) {
      return [];
    }

    return car.CarImages.filter(img => img.type === type)
      .map(img => {
        if (img.FileSystem && img.FileSystem.path) {
          return {
            uri: `https://cdn.legendmotorsglobal.com${img.FileSystem.path}`,
            id: img.id,
            type: img.type,
            order: img.order,
            filename: img.FileSystem.path.split('/').pop(),
            fullPath: img.FileSystem.path,
          };
        }
        return null;
      })
      .filter(img => img !== null);
  };

  const getThumbnailImagesByType = type => {
    if (!car || !car.CarImages || !Array.isArray(car.CarImages)) {
      return [];
    }

    return car.CarImages.filter(img => img.type === type)
      .map(img => {
        if (img.FileSystem && img.FileSystem.path) {
          return {
            uri: `https://cdn.legendmotorsglobal.com${
              img.FileSystem?.compressedPath ?? img.FileSystem.path
            }`,
            id: img.id,
            type: img.type,
            order: img.order,
            filename: img.FileSystem.path.split('/').pop(),
            fullPath: img.FileSystem.path,
          };
        }
        return null;
      })
      .filter(img => img !== null);
  };
  const getAllImages = () => {
    const exteriorImages = getImagesByType('exterior');
    const interiorImages = getImagesByType('interior');

    if (activeTab === 'exterior') return exteriorImages;
    if (activeTab === 'interior') return interiorImages;
  };
  const getAllThumbnailImages = () => {
    const exteriorImages = getThumbnailImagesByType('exterior');
    const interiorImages = getThumbnailImagesByType('interior');

    if (activeTab === 'exterior') return exteriorImages;
    if (activeTab === 'interior') return interiorImages;
  };

  // Memoize carImages to ensure stable reference
  const [memoizedCarImages, setMemoizedCarImages] = useState([]);
  const [memoizedThumbnailImages, setMemoizedThumbnailImages] = useState([]);

  useEffect(() => {
    setMemoizedCarImages(getAllImages());
    setMemoizedThumbnailImages(getAllThumbnailImages());
  }, [car, activeTab]);

  const renderSpecification = (label, value) => {
    if (!value) return null;

    return (
      <View style={styles.specItem} key={`spec-${label}`}>
        <Text style={styles.specLabel}>{label}:</Text>
        <Text style={styles.specValue}>{value}</Text>
      </View>
    );
  };

  const renderFeatureItem = ({item}) => (
    <View
      style={styles.featureItem}
      key={`feature-${item.id || Math.random().toString()}`}>
      <Icon name="check-circle" size={20} color={COLORS.primary} />
      <Text style={styles.featureText}>{item.name}</Text>
    </View>
  );

  // Group features by category
  const groupFeaturesByCategory = features => {
    return features.reduce((acc, feature) => {
      const category = feature.Feature?.key || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {});
  };

  // Add logging effect to check brochure data when car data changes
  useEffect(() => {
    if (car) {
      console.log('Car data loaded, checking for brochure file:');
      if (car.brochureFile) {
        console.log('Brochure file found:', car.brochureFile);
      } else if (car.brochureid) {
        console.log('Brochure ID found:', car.brochureid);
      } else {
        console.log('No brochure file or ID found in car data');
        // Look for other possible brochure fields
        const carString = JSON.stringify(car);
        if (carString.includes('brochure')) {
          console.log(
            'Found possible brochure reference in car data:',
            Object.keys(car).filter(key =>
              key.toLowerCase().includes('brochure'),
            ),
          );
        }
      }
    }
  }, [car]);

  // Update function to handle brochure download/view
  const handleBrochureView = async () => {
    // Check if the car has a brochure file
    console.log(`https://cdn.legendmotorsglobal.com${car?.brochureFile?.path}`);
    const brochureUrl = `https://cdn.legendmotorsglobal.com${car?.brochureFile?.path}`;
    console.log('Opening brochure URL in browser:', brochureUrl);

    // Simple direct opening in browser for all platforms
    const canOpen = Linking.canOpenURL(brochureUrl);
    if (canOpen) {
      // Open directly in the browser
      Linking.openURL(brochureUrl);
    } else {
      throw new Error('Cannot open URL in browser');
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          {backgroundColor: isDark ? '#333333' : colors.background},
        ]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.errorContainer,
          {backgroundColor: isDark ? '#333333' : colors.background},
        ]}>
        <Icon name="error-outline" size={50} color={COLORS.error} />
        <Text style={[styles.errorText, {color: colors.text}]}>{error}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchCarDetails}>
          <Text style={styles.reloadButtonText}>{t('common.tryAgain')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, {color: colors.primary}]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!car) {
    return (
      <SafeAreaView
        style={[
          styles.errorContainer,
          {backgroundColor: isDark ? '#333333' : colors.background},
        ]}>
        <Icon name="no-photography" size={50} color={colors.text} />
        <Text style={[styles.errorText, {color: colors.text}]}>
          {t('common.noResults')}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, {color: colors.primary}]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Extract car details
  const brandName = car.Brand?.name || '';
  const carModel = car.CarModel?.name || '';
  const year = car.Year?.year || '';
  const title = `${year} ${brandName} ${carModel} ${car.Trim?.name || ''}`;

  // Get all features
  const features = car.FeatureValues || [];

  // Get specifications
  const specifications = car.SpecificationValues || [];

  // Group specifications by category
  const groupedSpecs = specifications.reduce((acc, spec) => {
    const category = spec.Specification?.name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(spec);
    return acc;
  }, {});

  // Extract data for the CarCard style display
  const additionalInfo = car.additionalInfo || '';
  const bodyType =
    car.SpecificationValues?.find(a => a.Specification?.key === 'body_type')
      ?.name || 'SUV';
  const fuelType =
    car.SpecificationValues?.find(a => a.Specification?.key === 'fuel_type')
      ?.name || 'Electric';
  const transmission =
    car.SpecificationValues?.find(a => a.Specification?.key === 'transmission')
      ?.name || 'Automatic';
  const region =
    car.SpecificationValues?.find(
      a => a.Specification?.key === 'regional_specification',
    )?.name || 'China';
  const steeringType =
    car.SpecificationValues?.find(a => a.Specification?.key === 'steering')
      ?.name || 'Left hand drive';

  // Prepare car title
  const carTitle =
    additionalInfo ||
    (year && brandName && carModel
      ? `${year} ${brandName} ${carModel}${
          car.Trim?.name ? ` ${car.Trim.name}` : ''
        }`
      : 'Car Details');

  // Get price
  const price = isAuthenticated
    ? car?.CarPrices?.find(crr => crr.currency === selectedCurrency)?.price ||
      car.price
    : null;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#333333' : '#FFFFFF'},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#333333' : colors.background}
      />

      {/* Header with back button */}
      <View
        style={[
          styles.header,
          {backgroundColor: isDark ? '#333333' : colors.background},
        ]}>
        <TouchableOpacity onPress={goBack} style={styles.backButtonSmall}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>
          {t('carDetails.title')}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={[
          styles.scrollContainer,
          {backgroundColor: isDark ? '#333333' : colors.background},
        ]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Action buttons at the top */}

        {/* CarCard-style display */}
        <View
          style={[
            styles.cardContainer,
            {backgroundColor: isDark ? '#333333' : colors.card},
          ]}>
          <View style={styles.imageContainer}>
            {/* Tabs for exterior/interior */}
            <View
              style={[
                styles.galleryTabs,
                {
                  backgroundColor: isDark ? '#333333' : colors.card,
                  borderBottomColor: isDark ? '#444444' : '#EEEEEE',
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.galleryTab,
                  activeTab === 'exterior' && styles.activeGalleryTab,
                ]}
                onPress={() => {
                  setActiveTab('exterior');
                  setSelectedImageIndex(0);
                }}>
                <Text
                  style={[
                    styles.galleryTabText,
                    {color: isDark ? '#AAAAAA' : '#757575'},
                    activeTab === 'exterior' && styles.activeGalleryTabText,
                  ]}>
                  Exterior
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.galleryTab,
                  activeTab === 'interior' && styles.activeGalleryTab,
                ]}
                onPress={() => {
                  setActiveTab('interior');
                  setSelectedImageIndex(0);
                }}>
                <Text
                  style={[
                    styles.galleryTabText,
                    {color: isDark ? '#AAAAAA' : '#757575'},
                    activeTab === 'interior' && styles.activeGalleryTabText,
                  ]}>
                  Interior
                </Text>
              </TouchableOpacity>
            </View>

            {/* Update the UI component with ThumbnailList */}
            {memoizedCarImages && memoizedCarImages.length > 0 && (
              <>
                <View style={styles.imageCarouselContainer}>
                  <CarImageCarousel
                    ref={carouselRef}
                    autoScrollStart={false}
                    images={getImagesByType(activeTab)}
                    height={240}
                    style={styles.carImage}
                    onImagePress={handleImagePress}
                    initialIndex={selectedImageIndex}
                    onIndexChange={index => {
                      // Update selected index immediately
                      setSelectedImageIndex(index);

                      // Scroll thumbnail list to the selected index with a small delay
                      if (bottomThumbnailsListRef.current) {
                        const offset = Math.max(0, index * 94 - 94); // 94 is item width + margins
                        requestAnimationFrame(() => {
                          bottomThumbnailsListRef.current.scrollToOffset({
                            offset,
                            animated: true,
                          });
                        });
                      }
                    }}
                    showIndex={true}
                  />
                </View>

                {/* Use the optimized ThumbnailList component with all required props */}
                <ThumbnailList
                  images={getThumbnailImagesByType(activeTab)}
                  selectedIndex={selectedImageIndex}
                  onSelectImage={setSelectedImageIndex}
                  carouselRef={carouselRef}
                  listRef={bottomThumbnailsListRef}
                  setAutoScrolling={setAutoScrolling}
                  autoScrollTimerRef={autoScrollTimerRef}
                />
              </>
            )}
          </View>

          {/* Add back the bottom thumbnail list with improved styling */}
          <View style={styles.bottomThumbnailContainer}>
            <ThumbnailList
              images={getThumbnailImagesByType(activeTab)}
              selectedIndex={selectedImageIndex}
              onSelectImage={setSelectedImageIndex}
              carouselRef={carouselRef}
              listRef={bottomThumbnailsListRef}
              setAutoScrolling={setAutoScrolling}
              autoScrollTimerRef={autoScrollTimerRef}
            />
          </View>

          <View
            style={[
              styles.cardContent,
              {backgroundColor: isDark ? '#333333' : colors.card},
            ]}>
            <Text
              style={[styles.carTitle, {color: colors.text}]}
              numberOfLines={2}
              ellipsizeMode="tail">
              {carTitle}
            </Text>
            {/* Top row with condition badge and action buttons */}
            <View style={styles.topRow}>
              {/* Left side - badges */}
              <View style={styles.badgesContainer}>
                <View style={styles.conditionBadge}>
                  <Text style={styles.conditionText}>
                    {car.condition || 'New'}
                  </Text>
                </View>

                <View style={[styles.categoryBadge]}>
                  <Icon name="directions-car" size={18} color="#FF8C00" />
                  <Text style={styles.categoryText}>{bodyType || 'SUV'}</Text>
                </View>
              </View>

              {/* Right side - action buttons */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.actionIconButton}
                  onPress={toggleFavorite}
                  disabled={processingWishlist}>
                  {processingWishlist ? (
                    <ActivityIndicator size="small" color="#FF8C00" />
                  ) : isFavorite ? (
                    <AntDesign name="heart" size={24} color="#FF8C00" />
                  ) : (
                    <AntDesign name="hearto" size={24} color="#FF8C00" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionIconButton}
                  onPress={handleBrochureView}>
                  <Ionicons
                    name="download-outline"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionIconButton}
                  onPress={handleShare}>
                  <Ionicons name="share-social" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Specs pills in rows, using the design from the image */}
            <View style={styles.specsContainer}>
              <View
                style={[
                  styles.specPill,
                  {backgroundColor: isDark ? '#231C26' : '#E9E5EB'},
                ]}>
                <Image
                  source={LtrIcon}
                  style={[styles.specIcon, isDark && styles.specIconDark]}
                  resizeMode="contain"
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(
                    spec => spec.Specification?.key === 'drive_type',
                  )?.name || 'ltr'}
                </Text>
              </View>

              <View
                style={[
                  styles.specPill,
                  {backgroundColor: isDark ? '#231C26' : '#E9E5EB'},
                ]}>
                <Image
                  source={ElectricIcon}
                  style={[styles.specIcon, isDark && styles.specIconDark]}
                  resizeMode="contain"
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(
                    spec => spec.Specification?.key === 'fuel_type',
                  )?.name || fuelType}
                </Text>
              </View>

              <View
                style={[
                  styles.specPill,
                  {backgroundColor: isDark ? '#231C26' : '#E9E5EB'},
                ]}>
                <Image
                  source={AutomaticIcon}
                  style={[styles.specIcon, isDark && styles.specIconDark]}
                  resizeMode="contain"
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(
                    spec => spec.Specification?.key === 'transmission',
                  )?.name || transmission}
                </Text>
              </View>

              <View
                style={[
                  styles.specPill,
                  {backgroundColor: isDark ? '#231C26' : '#E9E5EB'},
                ]}>
                <Image
                  source={CountryIcon}
                  style={[styles.specIcon, isDark && styles.specIconDark]}
                  resizeMode="contain"
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(
                    spec =>
                      spec.Specification?.key === 'regional_specification',
                  )?.name || region}
                </Text>
              </View>

              <View
                style={[
                  styles.specPill,
                  {backgroundColor: isDark ? '#231C26' : '#E9E5EB'},
                ]}>
                <Image
                  source={SteeringIcon}
                  style={[styles.specIcon, isDark && styles.specIconDark]}
                  resizeMode="contain"
                  tintColor={isDark ? '#FFFFFF' : undefined}
                />
                <Text style={[styles.specPillText, {color: colors.text}]}>
                  {specifications.find(
                    spec => spec.Specification?.key === 'steering',
                  )?.name || steeringType}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            {/* <View style={styles.priceRow}>
              {price ? (
                <Text style={styles.priceText}>
                  {selectedCurrency === 'USD' ? '$' : selectedCurrency} {Math.floor(price).toLocaleString()}
                </Text>
              ) : (
                <Text style={styles.priceText}>Price on Request</Text>
              )}
            </View> */}
          </View>
        </View>

        {/* Car Overview Section */}
        <View
          style={[
            styles.sectionContainer,
            {
              backgroundColor: isDark ? '#333333' : colors.background,
              borderBottomWidth: 0,
              marginTop: -30,
              paddingBottom: 0,
            },
          ]}>
          <Text
            style={[
              styles.sectionTitle,
              {color: colors.text, marginBottom: 0},
            ]}>
            {t('carDetails.overview')}
          </Text>

          <View
            style={[
              styles.overviewList,
              {
                backgroundColor: isDark ? 'transparent' : '#FFFFFF',
                borderRadius: 8,
              },
            ]}>
            {/* Condition */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon
                  name="directions-car"
                  size={22}
                  color={isDark ? '#FF8C00' : '#9E9E9E'}
                />
              </View>
              <Text
                style={[
                  styles.overviewLabel,
                  {color: isDark ? '#FF8C00' : '#757575'},
                ]}>
                {t('carDetails.condition')}:
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  {color: isDark ? '#FFFFFF' : '#6f4a8e'},
                ]}>
                {car.condition || t('carDetails.new')}
              </Text>
            </View>

            {/* Cylinders */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon
                  name="settings"
                  size={22}
                  color={isDark ? '#FF8C00' : '#9E9E9E'}
                />
              </View>
              <Text
                style={[
                  styles.overviewLabel,
                  {color: isDark ? '#FF8C00' : '#757575'},
                ]}>
                {t('carDetails.cylinders')}:
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  {color: isDark ? '#FFFFFF' : '#6f4a8e'},
                ]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'cylinders',
                )?.name || '4 Cylinders'}
              </Text>
            </View>

            {/* Fuel Type */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon
                  name="local-gas-station"
                  size={22}
                  color={isDark ? '#FF8C00' : '#9E9E9E'}
                />
              </View>
              <Text
                style={[
                  styles.overviewLabel,
                  {color: isDark ? '#FF8C00' : '#757575'},
                ]}>
                {t('carDetails.fuelType')}:
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  {color: isDark ? '#FFFFFF' : '#6f4a8e'},
                ]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'fuel_type',
                )?.name || fuelType}
              </Text>
            </View>

            {/* Built Year */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon
                  name="event"
                  size={22}
                  color={isDark ? '#FF8C00' : '#9E9E9E'}
                />
              </View>
              <Text
                style={[
                  styles.overviewLabel,
                  {color: isDark ? '#FF8C00' : '#757575'},
                ]}>
                {t('carDetails.builtYear')}:
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  {color: isDark ? '#FFFFFF' : '#6f4a8e'},
                ]}>
                {year || '2025'}
              </Text>
            </View>

            {/* Transmission */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon
                  name="transform"
                  size={22}
                  color={isDark ? '#FF8C00' : '#9E9E9E'}
                />
              </View>
              <Text
                style={[
                  styles.overviewLabel,
                  {color: isDark ? '#FF8C00' : '#757575'},
                ]}>
                {t('carDetails.transmission')}:
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  {color: isDark ? '#FFFFFF' : '#6f4a8e'},
                ]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'transmission',
                )?.name || transmission}
              </Text>
            </View>

            {/* Color */}
            <View style={[styles.overviewItem, {borderBottomWidth: 0}]}>
              <View style={styles.overviewIconContainer}>
                <Icon
                  name="palette"
                  size={22}
                  color={isDark ? '#FF8C00' : '#9E9E9E'}
                />
              </View>
              <Text
                style={[
                  styles.overviewLabel,
                  {color: isDark ? '#FF8C00' : '#757575'},
                ]}>
                {t('carDetails.color')}:
              </Text>
              <Text
                style={[
                  styles.overviewValue,
                  {color: isDark ? '#FFFFFF' : '#6f4a8e'},
                ]}>
                {specifications.find(
                  spec => spec.Specification?.key === 'exterior_color',
                )?.name || 'White'}
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section - Redesigned with accordion categories */}
        <View
          style={[
            styles.sectionContainer,
            {
              backgroundColor: isDark ? '#333333' : colors.background,
              marginTop: 0,
            },
          ]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            Features
          </Text>

          {/* Main features grid - two column layout showing some top features */}
          <View
            style={[
              styles.featuresGrid,
              {backgroundColor: isDark ? 'transparent' : '#FFFFFF'},
            ]}>
            {/* Column 1 */}
            <View style={styles.featuresColumn}>
              {features
                .slice(0, Math.min(6, features.length / 2))
                .map(feature => (
                  <View
                    key={`feature-highlight-${
                      feature.id || Math.random().toString()
                    }`}
                    style={styles.featureItem}>
                    <Icon name="check-circle" size={20} color="#8BC34A" />
                    <Text
                      style={[
                        styles.featureText,
                        {color: isDark ? '#ffffff' : colors.text},
                      ]}>
                      {feature.name}
                    </Text>
                  </View>
                ))}
            </View>

            {/* Column 2 */}
            <View style={styles.featuresColumn}>
              {features
                .slice(
                  Math.min(6, features.length / 2),
                  Math.min(12, features.length),
                )
                .map(feature => (
                  <View
                    key={`feature-highlight-${
                      feature.id || Math.random().toString()
                    }`}
                    style={styles.featureItem}>
                    <Icon name="check-circle" size={20} color="#8BC34A" />
                    <Text
                      style={[
                        styles.featureText,
                        {color: isDark ? '#ffffff' : colors.text},
                      ]}>
                      {feature.name}
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Accordion Sections */}
          <View style={styles.accordionContainer}>
            {/* Group features by category and render each category as an accordion */}
            {Object.entries(groupFeaturesByCategory(features)).map(
              ([category, categoryFeatures]) => {
                // Get the display name for this category
                const categoryDisplayName =
                  categoryFeatures[0]?.Feature?.name ||
                  category.replace(/_/g, ' ');
                // Only show if we have features in this category
                if (categoryFeatures.length === 0) return null;

                return (
                  <View
                    key={`accordion-${category}`}
                    style={{
                      backgroundColor: 'transparent',
                    }}>
                    <TouchableOpacity
                      style={[
                        styles.accordionHeader,
                        {borderBottomColor: isDark ? '#333333' : '#F0F0F0'},
                        expandedAccordions[category],
                      ]}
                      onPress={() => toggleAccordion(category)}>
                      <Text
                        style={[
                          styles.accordionTitle,
                          {
                            color: expandedAccordions[category]
                              ? COLORS.primary
                              : colors.text,
                          },
                        ]}>
                        {categoryDisplayName}
                      </Text>
                      <Icon
                        name={expandedAccordions[category] ? 'remove' : 'add'}
                        size={30}
                        color={
                          expandedAccordions[category]
                            ? COLORS.primary
                            : '#AAAAAA'
                        }
                      />
                    </TouchableOpacity>

                    {/* Accordion Content */}
                    {expandedAccordions[category] && (
                      <View
                        style={[
                          styles.accordionContent,
                          {
                            backgroundColor: 'transparent',
                            borderBottomColor: isDark ? '#333333' : '#F0F0F0',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.accordionFeatureText,
                            {color: colors.text},
                          ]}>
                          {categoryFeatures.map((feature, index) => (
                            <React.Fragment key={`feature-text-${feature.id}`}>
                              {feature.name}
                              {index < categoryFeatures.length - 1 ? ', ' : ''}
                            </React.Fragment>
                          ))}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              },
            )}
          </View>
        </View>

        {/* Description Section */}
        <View
          style={[
            styles.sectionContainer,
            {backgroundColor: isDark ? '#333333' : colors.background},
          ]}>
          <Text style={[styles.sectionTitle, {color: colors.text}]}>
            {t('carDetails.description')}
          </Text>
          {car.description ? (
            <View style={styles.descriptionContainer}>
              <RenderHtml
                contentWidth={width - SPACING.md * 2}
                source={{html: car.description}}
                tagsStyles={{
                  p: {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontSize: FONT_SIZES.sm,
                    lineHeight: 22,
                    marginBottom: 10,
                    marginLeft: 15,
                  },
                  strong: {
                    fontWeight: 'bold',
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                  li: {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontSize: FONT_SIZES.sm,
                    lineHeight: 22,
                    marginBottom: 5,
                    paddingLeft: 5,
                    marginLeft: 15,
                  },
                  ul: {marginTop: 5, marginBottom: 5, marginLeft: 15},
                }}
              />
            </View>
          ) : (
            <Text
              style={[
                styles.noDescriptionText,
                {color: isDark ? '#FFFFFF' : '#000000', marginLeft: 15},
              ]}>
              {t('carDetails.noDescription')}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: isDark ? '#444444' : colors.background,
            borderTopColor: isDark ? '#444444' : colors.border,
            paddingBottom: Platform.OS == 'ios' ? SPACING.xxl : SPACING.lg,
          },
        ]}>
        {!isAuthenticated ? (
          <TouchableOpacity
            style={[
              styles.loginToViewPriceButton,
              {backgroundColor: isDark ? '#F47B20' : '#FF8C00'},
            ]}
            onPress={checkAuthAndShowPrompt}>
            <Text style={styles.loginToViewPriceText}>
              {t('auth.loginToViewPrice')}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.priceLabel,
                {color: isDark ? '#BBBBBB' : COLORS.textLight},
              ]}>
              {t('carDetails.price')}
            </Text>
            <Text
              style={[
                styles.priceLargeText,
                {color: isDark ? '#FFFFFF' : colors.text},
              ]}>
              {price ? (
                <>
                  {selectedCurrency === 'USD' ? (
                    '$'
                  ) : (
                    <Dhyram
                      style={{
                        tintColor: isDark ? '#ffffff' : '#0d0d0d',
                        width: 15,
                        height: 15,
                      }}
                    />
                  )}
                  {` ${Math.floor(price).toLocaleString()}`}
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.loginToViewPriceButton,
                    {backgroundColor: isDark ? '#F47B20' : '#FF8C00'},
                  ]}
                  onPress={checkAuthAndShowPrompt}>
                  <Text style={styles.loginToViewPriceText}>
                    {t('auth.loginToViewPrice')}
                  </Text>
                </TouchableOpacity>
              )}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.inquireButton,
            {backgroundColor: isDark ? '#F47B20' : '#FF8C00'},
            isAlreadyInquired && styles.alreadyInquiredButton,
            {
              marginTop: isAuthenticated ? 10 : 0,
            },
          ]}
          onPress={() => {
            if (isAuthenticated) {
              sendEventCleverTap(CLEVERTAP_EVENTS.VIEW_CAR_INQUIRY, {
                carId,
                carTitle,
              });
              handleInquire();
            } else {
              sendEventCleverTap(CLEVERTAP_EVENTS.INQUIRE_GUEST, {
                carId,
                carTitle,
              });
              checkAuthAndShowPrompt();
            }
          }}
          disabled={isAlreadyInquired}>
          <Text
            style={[
              styles.inquireButtonText,
              {color: '#FFFFFF'},
              isAlreadyInquired && styles.alreadyInquiredText,
            ]}>
            {!isAuthenticated
              ? t('auth.login')
              : isAlreadyInquired
              ? t('carDetails.alreadyInquired')
              : t('carDetails.inquireNow')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add the LoginPromptModal */}
      <LoginPromptModal
        visible={loginModalVisible}
        onClose={hideLoginPrompt}
        onLoginPress={navigateToLogin}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  backButtonSmall: {
    padding: SPACING.xs,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80, // Extra padding for the bottom action bar
  },
  cardContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 0,
  },
  galleryTabs: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
  },
  galleryTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
  },
  activeGalleryTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF8C00',
  },
  galleryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeGalleryTabText: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 15,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF2E0',
    borderRadius: 30,
  },
  conditionText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 22,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  specPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  specIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
  specIconDark: {
    tintColor: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5E366D',
  },
  sectionContainer: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    position: 'relative',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  overviewList: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginHorizontal: 10,
  },
  overviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
  },
  overviewIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overviewLabel: {
    fontSize: 15,
    flex: 1,
    paddingRight: 12,
  },
  overviewValue: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuresColumn: {
    flex: 1,
    marginRight: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  featureText: {
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: SPACING.xs,
    paddingHorizontal: 25,
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 10,
    marginLeft: 20,
  },
  descriptionParagraph: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    marginBottom: 10,
  },
  descriptionBold: {
    fontWeight: 'bold',
  },
  descriptionList: {
    marginTop: 5,
    marginBottom: 5,
  },
  descriptionListItem: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
    marginBottom: 5,
    paddingLeft: 5,
  },
  noDescriptionText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: SPACING.md,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 4,
  },
  priceLargeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inquireButton: {
    backgroundColor: '#FF8C00', // Default, will be overridden with inline style
    flex: 1,
    // marginTop: 10,
    width: 250,
    borderRadius: 8,
  },
  alreadyInquiredButton: {
    backgroundColor: '#AAAAAA',
  },
  inquireButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  alreadyInquiredText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  reloadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  accordionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginRight: 30,
    alignItems: 'center',
    paddingVertical: 10,
    // marginLeft: 20,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  expandedAccordionHeader: {
    borderBottomColor: 'transparent',
  },
  accordionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  accordionContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: FONT_SIZES.lg,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
  },
  accordionFeatureText: {
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 3,
  },
  thumbnailsContainer: {
    width: '100%',
    padding: 6,
    marginTop: 0,
    marginBottom: 10,
  },
  thumbnailsContent: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  thumbnailItem: {
    width: 90,
    height: 70,
    borderRadius: 12,
    marginHorizontal: 2,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  thumbnailItemSelected: {
    borderWidth: 2,
    borderColor: '#FF8C00',
    backgroundColor: 'transparent',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  imageCarouselContainer: {
    width: '100%',
    height: 240,
    marginBottom: 10,
  },
  carouselStyle: {
    width: '100%',
    height: '100%',
  },
  thumbnailImageSelected: {
    opacity: 1.0, // Ensure selected thumbnail has full opacity
  },
  bottomThumbnailContainer: {
    width: '100%',
    padding: 6,
    marginTop: 0,
    marginBottom: 10,
  },
  loginToViewPriceButton: {
    backgroundColor: '#FF8C00', // Default, will be overridden with inline style
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    flex: 1,
    marginRight: SPACING.md,
  },
  loginToViewPriceText: {
    color: '#FFFFFF', // White text for better contrast in both themes
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CarDetailScreen;
