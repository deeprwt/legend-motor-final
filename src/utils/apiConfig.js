// API Configuration
export const API_BASE_URL = 'https://api.staging.legendmotorsglobal.com/api/v1';

// API Key for authenticated requests
export const API_KEY = 'e40371f8f23b4d1fb86722c13245dcf60a7a9cd0377ca50ef58258d4a6ff7148';

// Define multiple possible image base URLs to try
const IMAGE_BASE_URLS = [
  // Use the correct CDN as the primary URL
  'https://cdn.legendmotorsglobal.com',
  'https://lmotors-global.s3.amazonaws.com',
  'https://legendmotorsglobal.com/images',
  'https://api.staging.legendmotorsglobal.com/storage/images',
  'https://api.staging.legendmotorsglobal.com/api/v1/images',
  'https://api.staging.legendmotorsglobal.com/uploads',
  'https://api.staging.legendmotorsglobal.com/public/images',
  'https://api.staging.legendmotorsglobal.com/media',
  'https://api.staging.legendmotorsglobal.com',
  'https://cdn.legendmotorsglobal.com/images',
  'https://storage.legendmotorsglobal.com'
];

// Export the primary one for direct use
export const API_IMAGE_BASE_URL = IMAGE_BASE_URLS[0];

// Function to get image headers
export const getImageHeaders = () => {
  return {
    'x-api-key': API_KEY
  };
};

// Use this function to construct correct image URLs based on the API response
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If path already starts with http(s), it's a full URL
  if (path.startsWith('http')) {
    // Don't log to avoid console spam
    // console.log('Full URL detected:', path);
    return path;
  }
  
  // Clean the path - remove any duplicate slashes or spaces
  let cleanPath = path.trim();
  
  // If it's a filename without path, just use the filename directly
  if (!cleanPath.includes('/')) {
    // Don't add a leading slash for filenames
    // This allows the URLs to be constructed correctly with or without trailing slashes
    return `${IMAGE_BASE_URLS[0]}/${cleanPath}`;
  }
  
  // Make sure path starts with a slash if it doesn't already
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Don't log to avoid console spam
  // console.log('Using image path:', cleanPath);
  
  // Return the primary URL (first one) - the CarImage component will handle fallbacks
  return `${IMAGE_BASE_URLS[0]}${cleanPath}`;
};

// This function returns all possible URLs for a path, for components
// that want to try multiple fallbacks
export const getAllPossibleImageUrls = (path) => {
  if (!path) return [];
  
  // If path already starts with http(s), it's a full URL
  if (path.startsWith('http')) {
    return [path];
  }
  
  // Clean the path - remove any duplicate slashes or spaces
  let cleanPath = path.trim();
  
  // If it's a filename without path, don't add leading slash
  if (!cleanPath.includes('/')) {
    // Generate array of possible URLs to try for a simple filename
    return IMAGE_BASE_URLS.map(baseUrl => {
      // Make sure the baseUrl doesn't end with a slash when we're adding one
      if (baseUrl.endsWith('/')) {
        return `${baseUrl}${cleanPath}`;
      } else {
        return `${baseUrl}/${cleanPath}`;
      }
    });
  }
  
  // Make sure path starts with a slash if it doesn't already
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  
  // Special handling for FileSystem paths from API
  // Example: "/2025-TOYOTA-URBANCRUISER-GLX-2-572510.jpg"
  // Try all base URLs with this path
  const urls = IMAGE_BASE_URLS.map(baseUrl => {
    // Make sure we don't end up with double slashes
    if (baseUrl.endsWith('/') && cleanPath.startsWith('/')) {
      return `${baseUrl}${cleanPath.substring(1)}`;
    } else {
      return `${baseUrl}${cleanPath}`;
    }
  });
  
  // Also try thumbnail and webp versions for FileSystem paths
  if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg') || cleanPath.endsWith('.png')) {
    // Extract the base name without extension
    const lastDotIndex = cleanPath.lastIndexOf('.');
    const basePath = cleanPath.substring(0, lastDotIndex);
    const extension = cleanPath.substring(lastDotIndex);
    
    // Add thumbnail version
    const thumbnailPath = `${basePath}-thumbnail${extension}`;
    urls.push(...IMAGE_BASE_URLS.map(baseUrl => {
      if (baseUrl.endsWith('/') && thumbnailPath.startsWith('/')) {
        return `${baseUrl}${thumbnailPath.substring(1)}`;
      } else {
        return `${baseUrl}${thumbnailPath}`;
      }
    }));
    
    // Add webp version
    const webpPath = `${basePath}.webp`;
    urls.push(...IMAGE_BASE_URLS.map(baseUrl => {
      if (baseUrl.endsWith('/') && webpPath.startsWith('/')) {
        return `${baseUrl}${webpPath.substring(1)}`;
      } else {
        return `${baseUrl}${webpPath}`;
      }
    }));
  }
  
  return urls;
};

// Add the console.log to show what API URL is being used
console.log('Loading API configuration...');

export default {
  API_BASE_URL,
  API_IMAGE_BASE_URL,
  API_KEY,
  getImageUrl,
  getAllPossibleImageUrls,
  getImageHeaders
}; 