import React, {useState, memo, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SPACING, BORDER_RADIUS} from '../../utils/constants';
import {useTheme} from 'src/context/ThemeContext';

const {width} = Dimensions.get('window');
const bannerWidth = width - SPACING.lg * 2;

// Memoized dot component
const PaginationDot = memo(({active, onPress, index, isDark}) => (
  <TouchableOpacity onPress={() => onPress(index)} style={styles.dotContainer}>
    <View
      style={[
        styles.dot,
        {
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.5)',
        },
        active
          ? [
              styles.activeDot,
              {backgroundColor: isDark ? '#FF8C00' : '#FFFFFF'},
            ]
          : null,
      ]}
    />
  </TouchableOpacity>
));

const PromotionBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {isDark} = useTheme();
  const scrollViewRef = useRef(null);

  const banners = [
    require('../../assets/images/banner-1.jpg'),
    require('../../assets/images/banner-2.jpg'),
  ];

  // Handle scroll end to update the current banner index
  const handleScroll = event => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / bannerWidth);
    setCurrentIndex(currentIndex);
  };

  // Function to navigate to specific banner
  const scrollToBanner = index => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * bannerWidth,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  return (
    <View
      style={[
        styles.promotionBanner,
        {
          shadowColor: isDark ? '#000' : '#000',
          shadowOpacity: isDark ? 0.3 : 0.2,
        },
      ]}>
      {/* ScrollView for horizontal sliding */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollViewContent}>
        {banners.map((banner, index) => (
          <Image
            key={index}
            source={banner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.paginationContainer}>
        {banners.map((_, index) => (
          <PaginationDot
            key={index}
            index={index}
            active={index === currentIndex}
            onPress={scrollToBanner}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotionBanner: {
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    height: 181,
  },
  scrollViewContent: {
    height: 181,
  },
  bannerImage: {
    width: bannerWidth,
    height: 181,
    borderRadius: BORDER_RADIUS.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  dotContainer: {
    padding: 5, // Add padding to make touch target larger
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    height: 8,
    borderRadius: 4,
  },
});

export default memo(PromotionBanner);
