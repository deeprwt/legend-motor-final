import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Share,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons, AntDesign} from 'src/utils/icon';
import {getWishlist, removeFromWishlist} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {useWishlist} from '../context/WishlistContext';
import {COLORS, SPACING, FONT_SIZES} from '../utils/constants';
import {CarImage} from '../components/common';
import LoginPromptModal from '../components/LoginPromptModal';
import {useLoginPrompt} from '../hooks/useLoginPrompt';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import {useTheme, themeColors} from '../context/ThemeContext';
import Dhyram from 'src/components/Dhyram';
import useCleverTap, {CLEVERTAP_EVENTS} from 'src/services/NotificationHandler';

// Car card component for wishlist items
const WishlistCarCard = ({car, onPress, onRemove, isRemoving = false}) => {
  // Extract data from the car object
  const {selectedCurrency} = useCurrencyLanguage();
  const {theme, isDark} = useTheme();
  const brandName = car.Brand?.name || car.brand || '';
  const modelName = car.CarModel?.name || car.model || '';
  const year = car.Year?.year || car.year || '';
  const price = car?.CarPrices?.find(
    crr => crr.currency === selectedCurrency,
  )?.price;
  const category = car.Tags && car.Tags.length > 0 ? car.Tags[0].name : '';
  const additionalInfo = car.additionalInfo || '';

  // Determine if car is in wishlist
  const carId = car.carId || car.id;
  const inWishlist = true; // Always true in the wishlist screen

  // Function to toggle wishlist status
  const toggleWishlist = async () => {
    try {
      // Prevent action if item is already being removed
      if (isRemoving) {
        return;
      }

      // Always use the car ID for removal, not the wishlist ID
      const carId = car.carId || car.id;

      // Only use the parent's onRemove function, not the context directly
      onRemove(carId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Get the first image URL if available
  const imageUrl =
    car.CarImages && car.CarImages.length > 0 && car.CarImages[0].FileSystem
      ? {
          uri: `https://cdn.legendmotorsglobal.com${
            car.CarImages[0].FileSystem.thumbnailPath ||
            car.CarImages[0].FileSystem.compressedPath
          }`,
        }
      : require('../components/home/HotDealsCar.png');

  return (
    <TouchableOpacity
      style={[
        styles.carCard,
        {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
      ]}
      onPress={() => onPress(car)}>
      <View
        style={[styles.cardBorder, {borderColor: themeColors[theme].border}]}>
        <View
          style={[
            styles.imageContainer,
            {backgroundColor: isDark ? '#000000' : '#FFFFFF'},
          ]}>
          <CarImage
            source={imageUrl}
            style={styles.carImage}
            resizeMode="cover"
          />
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.carTitle, {color: themeColors[theme].text}]}>
            {`${year} ${brandName} ${modelName}`.trim()}
          </Text>
          {additionalInfo && (
            <Text
              style={[styles.additionalInfo, {color: themeColors[theme].text}]}>
              {additionalInfo}
            </Text>
          )}
          <View style={styles.priceContainer}>
            <Text
              style={[styles.priceText, {color: themeColors[theme].secondary}]}>
              {selectedCurrency === 'USD' ? (
                '$'
              ) : (
                <Dhyram style={{tintColor: themeColors[theme].secondary}} />
              )}{' '}
              {parseInt(price).toLocaleString()}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.heartButton}
                onPress={toggleWishlist}
                disabled={isRemoving}>
                {isRemoving ? (
                  <ActivityIndicator
                    size="small"
                    color={themeColors[theme].primary}
                  />
                ) : inWishlist ? (
                  <AntDesign
                    name="heart"
                    size={24}
                    color={themeColors[theme].primary}
                  />
                ) : (
                  <AntDesign
                    name="hearto"
                    size={24}
                    color={themeColors[theme].primary}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={async () => {
                  const shareLink = `https://legendmotorsglobal.com/cars/new-cars/${car.Brand?.slug}/${car.CarModel?.slug}/${car.Year?.year}/${car?.slug}`;
                  await Share.share({
                    message: `Check out this ${car.Year?.year} ${car.Brand?.name} ${car.CarModel?.name}!`,
                    url: shareLink,
                    title: 'Share this car',
                  });
                }}>
                <Ionicons
                  name="share-social-outline"
                  size={24}
                  color={themeColors[theme].text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyWishlistScreen = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const {isInWishlist, removeItemFromWishlist} = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingCarId, setRemovingCarId] = useState(null);
  const {isDark, theme} = useTheme();
  const {t} = useCurrencyLanguage();
  const {sendEventCleverTap} = useCleverTap();

  // Add the login prompt hook
  const {
    loginModalVisible,
    hideLoginPrompt,
    navigateToLogin,
    checkAuthAndShowPrompt,
  } = useLoginPrompt();

  // Fetch wishlist data
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();

      if (response.success && Array.isArray(response.data)) {
        const processedItems = response.data.map(item => {
          // If the item has a car property, use it as the base and add necessary fields
          if (item.car) {
            return {
              ...item.car,
              wishlistId: item.id,
              carId: item.carId,
              userId: item.userId,
              inWishlist: true, // Always true since we're in the wishlist screen
            };
          }
          // Otherwise, return the item as is with wishlist flag
          return {
            ...item,
            inWishlist: true,
          };
        });

        setWishlist(processedItems);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
      Alert.alert('Error', 'Failed to load wishlist items. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load wishlist on component mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text
        style={[
          styles.emptyStateTitle,
          {color: isDark ? '#FFFFFF' : '#333333'},
        ]}>
        {t('wishlist.emptyTitle')}
      </Text>
      <Text
        style={[
          styles.emptyStateSubtitle,
          {color: isDark ? '#CCCCCC' : '#666666'},
        ]}>
        {t('wishlist.emptySubtitle')}
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Main', {screen: 'ExploreTab'})}>
        <Text style={styles.exploreButtonText}>
          {t('wishlist.exploreCars')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderWishlistCarCard = ({item}) => (
    <WishlistCarCard
      car={item}
      onPress={() => navigation.navigate('CarDetailScreen', {carId: item.id})}
      onRemove={async () => {
        const isAuthorized = await checkAuthAndShowPrompt();
        if (!isAuthorized) {
          return;
        }

        setRemovingCarId(item.id);
        try {
          const result = await removeItemFromWishlist(item.id);
          if (result.success) {
            setWishlist(prev => prev.filter(car => car.id !== item.id));
            sendEventCleverTap(CLEVERTAP_EVENTS.REMOVE_FROM_WISHLIST, {
              carId: item.id,
              carName: `${item.brand} ${item.model}`,
            });
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);
        } finally {
          setRemovingCarId(null);
        }
      }}
      isRemoving={removingCarId === item.id}
    />
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : themeColors[theme].background},
      ]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#2D2D2D' : themeColors[theme].background}
      />

      <View
        style={[styles.header, {borderBottomColor: themeColors[theme].border}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={themeColors[theme].text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: themeColors[theme].text}]}>
          {t('wishlist.title')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderWishlistCarCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <LoginPromptModal
        visible={loginModalVisible}
        onClose={hideLoginPrompt}
        onLoginPress={navigateToLogin}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCard: {
    marginBottom: SPACING.lg,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBorder: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  carImage: {
    width: 387.84,
    height: 223.3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF8C00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    padding: 15,
    marginTop: 40,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  additionalInfo: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 10,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5E366D',
    marginBottom: 10,
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  heartButton: {
    marginHorizontal: 10,
  },
  shareButton: {
    marginHorizontal: 5,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
  },
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
    marginTop: SPACING.lg,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FONT_SIZES.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyWishlistScreen;
