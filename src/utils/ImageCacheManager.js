import { Image } from 'react-native';

// In-memory cache for image dimensions and sources
const dimensionCache = new Map();
const preloadedImages = new Map();
const maxCacheSize = 50; // Maximum number of images to cache

/**
 * Preloads an image into memory cache
 * @param {Object|number} source - Image source object with URI or require() reference
 * @returns {Promise} Promise that resolves when preloading completes
 */
export const preloadImage = (source) => {
  return new Promise((resolve, reject) => {
    // If already preloaded, return immediately
    const sourceKey = getSourceKey(source);
    if (preloadedImages.has(sourceKey)) {
      resolve({ source, cached: true });
      return;
    }
    
    // If cache is full, clear oldest entry
    if (preloadedImages.size >= maxCacheSize) {
      const oldestKey = preloadedImages.keys().next().value;
      preloadedImages.delete(oldestKey);
    }

    // For local images (number type), resolve immediately
    if (typeof source === 'number') {
      preloadedImages.set(sourceKey, { source, timestamp: Date.now() });
      resolve({ source, cached: true });
      return;
    }

    // For remote images with URI
    if (source && source.uri) {
      Image.prefetch(source.uri)
        .then(() => {
          preloadedImages.set(sourceKey, { source, timestamp: Date.now() });
          resolve({ source, cached: true });
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      reject(new Error('Invalid image source'));
    }
  });
};

/**
 * Preloads multiple images in parallel
 * @param {Array} sources - Array of image sources to preload
 * @returns {Promise} Promise that resolves when all images are preloaded
 */
export const preloadImages = async (sources = []) => {
  if (!sources || sources.length === 0) return [];
  
  try {
    const promises = sources.map(source => preloadImage(source));
    return await Promise.all(promises);
  } catch (error) {
    console.warn('Error preloading images:', error);
    return [];
  }
};

/**
 * Checks if an image is cached
 * @param {Object|number} source - Image source object or require() reference
 * @returns {boolean} Whether the image is in the cache
 */
export const isImageCached = (source) => {
  const sourceKey = getSourceKey(source);
  return preloadedImages.has(sourceKey);
};

/**
 * Gets cached image dimensions
 * @param {Object|number} source - Image source
 * @returns {Object|null} Dimensions object or null if not cached
 */
export const getCachedImageDimensions = (source) => {
  const sourceKey = getSourceKey(source);
  return dimensionCache.get(sourceKey) || null;
};

/**
 * Stores image dimensions in cache
 * @param {Object|number} source - Image source
 * @param {Object} dimensions - Width and height object
 */
export const cacheImageDimensions = (source, dimensions) => {
  const sourceKey = getSourceKey(source);
  dimensionCache.set(sourceKey, dimensions);
};

/**
 * Generates a unique key for the image source
 * @param {Object|number} source - Image source
 * @returns {string} Unique key for the source
 */
const getSourceKey = (source) => {
  if (typeof source === 'number') {
    return `local_${source}`;
  }
  
  if (source && source.uri) {
    return `remote_${source.uri}`;
  }
  
  return `unknown_${JSON.stringify(source)}`;
};

/**
 * Clears the image cache
 */
export const clearImageCache = () => {
  preloadedImages.clear();
  dimensionCache.clear();
};

export default {
  preloadImage,
  preloadImages,
  isImageCached,
  getCachedImageDimensions,
  cacheImageDimensions,
  clearImageCache,
}; 