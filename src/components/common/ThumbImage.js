import React, {useState, useEffect, memo} from 'react';
import {Image, View, StyleSheet, ActivityIndicator} from 'react-native';
import {COLORS} from '../../utils/constants';
import {isImageCached, preloadImage} from '../../utils/ImageCacheManager';

const ThumbImage = memo(
  ({
    source,
    style,
    resizeMode = 'cover',
    priority = 'normal',
    selected = false,
  }) => {
    const [loading, setLoading] = useState(!isImageCached(source));
    const [imageSource, setImageSource] = useState(source);
    const [error, setError] = useState(false);

    // Fallback image
    const fallbackImage = require('../home/car_Image.jpg');

    // Use a stringified source for comparison in the dependency array
    const sourceKey =
      typeof source === 'number'
        ? `number_${source}`
        : source?.uri || JSON.stringify(source);

    useEffect(() => {
      let isMounted = true;
      let sourceToUse = source;

      // Skip loading for null/undefined sources
      if (!sourceToUse) {
        if (isMounted) {
          setLoading(false);
          setError(false);
        }
        return;
      }

      // For already cached images, just update state without preloading
      if (isImageCached(sourceToUse)) {
        if (isMounted) {
          setImageSource(sourceToUse);
          setLoading(false);
          setError(false);
        }
        return;
      }

      // Set loading state before async operation
      setLoading(true);

      // Use Promise to handle the async preload operation
      const preloadAndSetImage = async () => {
        try {
          await preloadImage(sourceToUse);

          // Only update state if component is still mounted
          if (isMounted) {
            setImageSource(sourceToUse);
            setLoading(false);
            setError(false);
          }
        } catch (err) {
          if (isMounted) {
            console.log('Thumbnail load error:', err);
            setError(true);
            setLoading(false);
          }
        }
      };

      preloadAndSetImage();

      // Cleanup function to prevent state updates if unmounted
      return () => {
        isMounted = false;
      };
    }, [sourceKey]); // Use the sourceKey instead of source object

    // Apply opacity style based on selection state
    const imageOpacityStyle = {
      opacity: selected ? 1.0 : 0.5,
    };

    // If source is a number (local resource) or has no URI property
    if (typeof imageSource === 'number' || !imageSource?.uri) {
      return (
        <Image
          source={typeof imageSource === 'number' ? imageSource : fallbackImage}
          style={[styles.image, imageOpacityStyle, style]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <View style={[styles.container, style]}>
        <Image
          source={error ? fallbackImage : imageSource}
          style={[styles.image, imageOpacityStyle]}
          resizeMode={resizeMode}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Check if the selection state has changed
    if (prevProps.selected !== nextProps.selected) {
      return false; // Return false to cause a re-render when selected state changes
    }

    // Always return true for same source to prevent re-renders
    if (prevProps.source === nextProps.source) {
      return true;
    }

    // For URI comparison
    if (prevProps.source?.uri === nextProps.source?.uri) {
      return true;
    }

    // Default case - allow re-render
    return false;
  },
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default ThumbImage;
