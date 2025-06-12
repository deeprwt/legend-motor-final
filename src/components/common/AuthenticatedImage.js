import React, {useState, useEffect} from 'react';
import {Image, View, StyleSheet, ActivityIndicator} from 'react-native';
import {COLORS} from '../../utils/constants';
import {API_KEY} from '../../utils/apiConfig';

const AuthenticatedImage = ({source, style, resizeMode = 'cover'}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback image
  const fallbackImage = require('../home/car_Image.jpg');

  // If source is a number (local resource)
  if (typeof source === 'number') {
    return <Image source={source} style={style} resizeMode={resizeMode} />;
  }

  // For remote images
  if (source?.uri) {
    // Create a new source object with the API key in headers
    const sourceWithAuth = {
      uri: source.uri,
      headers: {
        'x-api-key': API_KEY,
      },
    };

    console.log('Using authenticated image source:', source.uri);

    return (
      <View style={style}>
        {!error ? (
          <Image
            source={sourceWithAuth}
            style={styles.image}
            resizeMode={resizeMode}
            onLoadStart={() => setLoading(true)}
            onLoad={() => {
              console.log('Image loaded successfully:', source.uri);
              setLoading(false);
            }}
            onLoadEnd={() => setLoading(false)}
            onError={e => {
              console.error('Image load error:', e.nativeEvent?.error);
              console.error('Failed image URL:', source.uri);
              setError(true);
              setLoading(false);
            }}
          />
        ) : (
          <Image
            source={fallbackImage}
            style={styles.image}
            resizeMode={resizeMode}
          />
        )}

        {loading && !error && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>
    );
  }

  // Default fallback
  return <Image source={fallbackImage} style={style} resizeMode={resizeMode} />;
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.5)',
  },
});

export default AuthenticatedImage;
