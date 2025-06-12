import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Text,
} from 'react-native';
import {COLORS} from '../../utils/constants';
import CarImage from './CarImage';
import {preloadImages} from '../../utils/ImageCacheManager';

const {width: screenWidth} = Dimensions.get('window');

const CarImageCarousel = forwardRef(
  (
    {
      images,
      height = 180,
      style,
      onImagePress,
      showIndex = false,
      initialIndex = 0,
      onIndexChange,
      width: propWidth,
      isExplore = false,
      autoScroll = true,
      autoScrollInterval = 2500,
      autoScrollStart = true,
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [imagesPreloaded, setImagesPreloaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const flatListRef = useRef(null);
    const scrollToIndexTimeoutRef = useRef(null);
    const autoScrollTimerRef = useRef(null);
    const isUserInteractingRef = useRef(false);
    const isMountedRef = useRef(true);

    // Calculate width - use propWidth if provided, otherwise use screenWidth
    const width = propWidth || screenWidth;

    // Calculate item width - use full container width for item width
    const itemWidth = width;

    // Memoize images to prevent unnecessary re-renders
    const memoizedImages = useMemo(
      () => images || [],
      [images ? images.length : 0],
    );

    // Preload images when they change
    useEffect(() => {
      if (images && images.length > 0 && !imagesPreloaded) {
        setIsLoading(true);
        // Preload all images at once
        preloadImages(images)
          .then(() => {
            if (isMountedRef.current) {
              setImagesPreloaded(true);
              setIsLoading(false);
            }
          })
          .catch(err => {
            console.log('Error preloading carousel images:', err);
            if (isMountedRef.current) {
              setIsLoading(false);
            }
          });
      } else {
        setIsLoading(false);
      }
    }, [images, imagesPreloaded]);

    // Update scrollToIndex method to be backwards compatible with both types of parameters
    const scrollToIndex = useCallback(
      (indexOrOptions, maybeAnimated) => {
        if (flatListRef.current && images && images.length > 0) {
          try {
            // Handle different parameter formats
            let index;
            let animated = true;

            if (typeof indexOrOptions === 'object' && indexOrOptions !== null) {
              // Called with { index, animated } object
              index = indexOrOptions.index;
              animated =
                indexOrOptions.animated !== undefined
                  ? indexOrOptions.animated
                  : true;
            } else {
              // Called with (index, animated) separate parameters
              index = indexOrOptions;
              animated = maybeAnimated !== undefined ? maybeAnimated : true;
            }

            if (images.length === 1) {
              return; // No need to scroll with just one image
            }

            if (index >= 0 && index < images.length) {
              // Disable all animations and scrolling temporarily
              flatListRef.current.setNativeProps({
                scrollEnabled: false,
              });

              // Calculate the exact offset
              const offset = index * itemWidth;

              // Scroll directly to the offset without animation
              flatListRef.current.scrollToOffset({
                offset,
                animated: false,
              });

              // Update the active index immediately
              setActiveIndex(index);
              if (onIndexChange) {
                onIndexChange(index);
              }

              // Re-enable scrolling after a short delay
              setTimeout(() => {
                if (flatListRef.current) {
                  flatListRef.current.setNativeProps({
                    scrollEnabled: true,
                  });
                }
              }, 50);
            }
          } catch (error) {
            console.log('Error scrolling to index:', error);

            // Extract the index regardless of how the function was called
            const index =
              typeof indexOrOptions === 'object'
                ? indexOrOptions.index
                : indexOrOptions;

            // Fallback if scrollToIndex fails - use scrollToOffset
            const offset = index * itemWidth;
            flatListRef.current.scrollToOffset({
              offset,
              animated: false,
            });
          }
        }
      },
      [images, itemWidth, onIndexChange],
    );

    // Implement useImperativeHandle to expose methods to parent components
    useImperativeHandle(ref, () => ({
      scrollToIndex,
      getCurrentIndex: () => activeIndex,
    }));

    // Set initial index when it changes
    useEffect(() => {
      if (initialIndex !== activeIndex) {
        scrollToIndex(initialIndex, true);
      }
    }, [initialIndex, scrollToIndex]);

    // Clean up timeouts on unmount
    useEffect(() => {
      return () => {
        if (scrollToIndexTimeoutRef.current) {
          clearTimeout(scrollToIndexTimeoutRef.current);
        }
      };
    }, []);

    // Handle when scrolling ends to update the active index
    const handleScroll = useCallback(
      event => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / itemWidth);

        if (
          newIndex !== activeIndex &&
          newIndex >= 0 &&
          newIndex < memoizedImages.length
        ) {
          // Update index immediately
          setActiveIndex(newIndex);
          if (onIndexChange) {
            onIndexChange(newIndex);
          }
        }
      },
      [activeIndex, memoizedImages.length, onIndexChange, itemWidth],
    );

    // Add scroll event handler for more responsive updates
    const handleScrollEvent = useCallback(
      event => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / itemWidth);

        if (
          newIndex !== activeIndex &&
          newIndex >= 0 &&
          newIndex < memoizedImages.length
        ) {
          setActiveIndex(newIndex);
          if (onIndexChange) {
            onIndexChange(newIndex);
          }
        }
      },
      [activeIndex, memoizedImages.length, onIndexChange, itemWidth],
    );

    // Go to a specific image
    const goToImage = useCallback(
      index => {
        scrollToIndex(index, true);

        if (onIndexChange) {
          onIndexChange(index);
        }
      },
      [scrollToIndex, onIndexChange],
    );

    // Better memoization of renderItem to prevent recreation
    const renderItem = useCallback(
      ({item, index}) => (
        <TouchableOpacity
          style={[styles.itemContainer, {width: itemWidth}]}
          activeOpacity={1}
          onPress={() => onImagePress && onImagePress(index)}>
          <CarImage
            source={item}
            style={styles.image}
            height={height}
            priority="high"
            showDebug={false}
            fadeDuration={0}
            transition={false}
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      ),
      [itemWidth, height, onImagePress],
    );

    // Memoize flatlist configuration for stability
    const listConfig = useMemo(
      () => ({
        getItemLayout: (_data, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        }),
        windowSize: 3,
        initialNumToRender: 3,
        maxToRenderPerBatch: 2,
        removeClippedSubviews: true,
        keyExtractor: (_, index) => `carousel-${index}`,
      }),
      [itemWidth],
    );

    // Cleanup on unmount
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        if (autoScrollTimerRef.current) {
          clearInterval(autoScrollTimerRef.current);
        }
      };
    }, []);

    // Auto-scroll effect
    useEffect(() => {
      // Clear any existing timer
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }

      // Only start auto-scroll if we have multiple images and not loading
      if (memoizedImages.length > 1 && !isLoading && isMountedRef.current) {
        const startAutoScroll = () => {
          autoScrollTimerRef.current = setInterval(() => {
            if (!isUserInteractingRef.current && isMountedRef.current) {
              const nextIndex = (activeIndex + 1) % memoizedImages.length;
              scrollToIndex(nextIndex, true);
            }
          }, autoScrollInterval);
        };

        // Start immediately
        if (autoScrollStart) {
          startAutoScroll();
        }
      }

      return () => {
        if (autoScrollTimerRef.current) {
          clearInterval(autoScrollTimerRef.current);
        }
      };
    }, [
      autoScrollInterval,
      activeIndex,
      memoizedImages.length,
      scrollToIndex,
      isLoading,
    ]);

    // Handle user interaction
    const handleTouchStart = useCallback(() => {
      isUserInteractingRef.current = true;
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    }, []);

    const handleTouchEnd = useCallback(() => {
      isUserInteractingRef.current = false;
      // Restart auto-scroll
      if (memoizedImages.length > 1 && !isLoading && isMountedRef.current) {
        autoScrollTimerRef.current = setInterval(() => {
          if (!isUserInteractingRef.current && isMountedRef.current) {
            const nextIndex = (activeIndex + 1) % memoizedImages.length;
            scrollToIndex(nextIndex, true);
          }
        }, autoScrollInterval);
      }
    }, [
      autoScrollInterval,
      activeIndex,
      memoizedImages.length,
      scrollToIndex,
      isLoading,
    ]);

    // If no images or empty array, return null
    if (!memoizedImages || memoizedImages.length === 0) {
      return null;
    }

    // If only one image, just show it without carousel
    if (memoizedImages.length === 1) {
      return (
        <View style={[styles.container, {height}, style]}>
          <CarImage
            source={memoizedImages[0]}
            style={styles.image}
            resizeMode="cover"
            showDebug={false}
            fadeDuration={0}
            transition={false}
          />
        </View>
      );
    }

    // Memoized dot components to prevent re-renders
    const PaginationDots = useMemo(() => {
      return (
        <View style={styles.paginationContainer}>
          {memoizedImages.map((_, index) => (
            <TouchableOpacity
              key={`dot_${index}`}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
              onPress={() => goToImage(index)}
            />
          ))}
        </View>
      );
    }, [memoizedImages.length, activeIndex, goToImage]);

    return (
      <View style={[styles.container, {height, width}, style]}>
        <FlatList
          ref={flatListRef}
          data={memoizedImages}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          decelerationRate={0}
          snapToInterval={itemWidth}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          onScroll={handleScrollEvent}
          scrollEventThrottle={16}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          keyExtractor={(_, index) => `carousel-${index}`}
          getItemLayout={(_, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
          maxToRenderPerBatch={5}
          windowSize={7}
          initialNumToRender={5}
          removeClippedSubviews={false}
          updateCellsBatchingPeriod={50}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          scrollEnabled={true}
          onScrollToIndexFailed={info => {
            // Handle scroll failure
            console.warn('Scroll to index failed:', info);

            // Safety check for valid index range
            const validIndex = Math.min(info.index, memoizedImages.length - 1);
            if (validIndex < 0) return;

            // Try scrollToOffset which is less likely to fail
            flatListRef.current?.scrollToOffset({
              offset: validIndex * itemWidth,
              animated: false,
            });

            // Update the active index after a delay
            setTimeout(() => {
              if (activeIndex !== validIndex) {
                setActiveIndex(validIndex);
                if (onIndexChange) {
                  onIndexChange(validIndex);
                }
              }
            }, 100);
          }}
        />

        {/* Pagination dots */}
        {PaginationDots}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  indexContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indexText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default React.memo(CarImageCarousel);
