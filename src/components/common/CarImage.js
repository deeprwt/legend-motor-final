import React, {useState, useEffect, memo} from 'react';
import {Image, View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import {COLORS} from '../../utils/constants';
import {getAllPossibleImageUrls} from '../../utils/apiConfig';
import {isImageCached, preloadImage} from '../../utils/ImageCacheManager';

const CarImage = memo(
  ({
    source,
    style,
    resizeMode = 'cover',
    showDebug = false,
    loadingIndicatorSource = null,
  }) => {
    const [loading, setLoading] = useState(!isImageCached(source));
    const [error, setError] = useState(false);
    const [urlIndex, setUrlIndex] = useState(0);
    const [possibleUrls, setPossibleUrls] = useState([]);
    const [currentSource, setCurrentSource] = useState(source);
    const [attemptedUrls, setAttemptedUrls] = useState([]);

    // Fallback image
    const fallbackImage =
      loadingIndicatorSource || require('../home/car_Image.jpg');

    // Generate all possible URLs when source changes
    useEffect(() => {
      let isMounted = true;
      setAttemptedUrls([]);

      if (typeof source === 'object' && source.uri) {
        // For remote images with URIs, generate fallback URLs
        let urls = [];

        // If we have a fullPath property (from FileSystem structure), use it
        if (source.fullPath) {
          urls = getAllPossibleImageUrls(source.fullPath);
        }
        // Otherwise, use the filename if available, or extract from URI
        else {
          const filename = source.filename || source.uri.split('/').pop();
          urls = getAllPossibleImageUrls(filename);
        }

        // Always add the original URI as a possible URL
        if (!urls.includes(source.uri)) {
          urls.unshift(source.uri);
        }

        // Only log for debugging to avoid console spam
        if (showDebug) {
          console.log('Trying these image URLs:', urls[0]);
        }

        setPossibleUrls(urls);

        // Check if image is already cached
        if (isImageCached(source)) {
          if (isMounted) {
            setCurrentSource(source);
            setLoading(false);
          }
          return;
        }

        // Attempt to preload the image
        preloadImage(source)
          .then(() => {
            if (isMounted) {
              setCurrentSource(source);
              setLoading(false);
            }
          })
          .catch(() => {
            // If preloading fails, try the fallback URLs
            if (isMounted && urls.length > 0) {
              setCurrentSource({uri: urls[0]});
              setUrlIndex(0);
            }
          });
      } else {
        // For local resources (numbers), just use as is
        setCurrentSource(source);
        setPossibleUrls([]);
        setUrlIndex(0);
        setError(false);
        setLoading(false);
      }

      return () => {
        isMounted = false;
      };
    }, [source, showDebug]);

    const handleLoadStart = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };

    const handleLoadEnd = () => {
      setLoading(false);
    };

    const handleError = e => {
      // Track attempted URLs for debugging
      if (currentSource && currentSource.uri) {
        setAttemptedUrls(prev => [...prev, currentSource.uri]);
      }

      // Only log errors when debugging is enabled
      if (showDebug) {
        console.log(
          'Image load error:',
          e.nativeEvent?.error || 'Unknown error',
        );
        console.log('Failed image URI:', currentSource?.uri);
      }

      // Try the next URL in our list if available
      const nextIndex = urlIndex + 1;
      if (possibleUrls.length > 0 && nextIndex < possibleUrls.length) {
        if (showDebug) {
          console.log(
            `Trying alternative URL (${nextIndex + 1}/${possibleUrls.length}):`,
            possibleUrls[nextIndex],
          );
        }
        setUrlIndex(nextIndex);
        setCurrentSource({uri: possibleUrls[nextIndex]});
        setLoading(true);
      } else {
        // If we've tried all URLs and none worked, show the fallback
        if (showDebug) {
          console.log('All image URLs failed, using fallback');
        }
        setError(true);
        setLoading(false);
      }
    };

    // If source is a number (local resource) or has no URI property
    if (typeof currentSource === 'number' || !currentSource?.uri) {
      return (
        <Image
          source={
            typeof currentSource === 'number' ? currentSource : fallbackImage
          }
          style={[styles.image, style]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <View style={[styles.container, style]}>
        <Image
          source={error ? fallbackImage : currentSource}
          style={[styles.image, {opacity: 1}]} // Removed the reduced opacity for error state
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoad={() => setLoading(false)}
          onLoadEnd={handleLoadEnd}
          // onError={handleError}
          defaultSource={fallbackImage}
        />

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {showDebug && error && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Failed to load image after {attemptedUrls.length} attempts
            </Text>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    // backgroundColor: 'red',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Reduced opacity for loader background
  },
  debugContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 4,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default CarImage;
