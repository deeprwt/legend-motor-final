import axios from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, API_KEY} from '../utils/apiConfig';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Function to synchronize the auth token between AsyncStorage and API headers
export const syncAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token synchronized with API headers');
    }
  } catch (error) {
    console.error('Error synchronizing auth token:', error);
  }
};

// Add interceptor to add auth token to requests if available
api.interceptors.request.use(
  async config => {
    try {
      // Check both token storage locations
      const authToken = await AsyncStorage.getItem('token');
      console.log('params', config.url);

      // Use whichever token is available
      const token = authToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.log('Error response:', error);
    console.log('Error response data:', error?.response?.data);
    return Promise.reject(error);
  },
);

export const requestOTP = async email => {
  try {
    const response = await api.post('/auth/requestOtp', {email});
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verifyOtp', {email, otp});
    // Return the response data with registration token
    return {
      success: response.data.success,
      message: response.data.message,
      registrationToken: response.data.token || response.data.registrationToken,
    };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const registerUser = async userData => {
  try {
    const response = await api.post('/auth/register', userData);
    console.log('API register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API register error:', error.response?.data || error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw error.response.data || {message: 'Registration failed'};
    } else if (error.request) {
      // The request was made but no response was received
      throw {message: 'No response from server. Please check your connection.'};
    } else {
      // Something happened in setting up the request that triggered an Error
      throw {message: error.message || 'An unknown error occurred'};
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/rootLogin', {email, password});
    const data = response.data;

    console.log('Login API response:', data);

    // Store token in AsyncStorage
    if (data.success && data.token) {
      // Store in both places for compatibility
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('refreshToken', data.refreshToken);

      // Also set in headers for current session
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      console.log('Auth token saved and set in headers');
    } else {
      console.warn('No auth token received from login API');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Function to check if user is logged in
export const isAuthenticated = async () => {
  try {
    // Check both token storage locations for consistency
    const authToken = await AsyncStorage.getItem('token');

    // Use whichever token is available
    const token = authToken;
    return !!token;
  } catch (error) {
    console.log('Error checking authentication status:', error);
    return false;
  }
};

// Function to logout user
export const logoutUser = async () => {
  try {
    // Call the logout endpoint
    const response = await api.post('/auth/logout');
    console.log('Logout response:', response.data);

    // Remove tokens from both AsyncStorage locations
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('refreshToken');

    // Remove token from Authorization header
    delete api.defaults.headers.common['Authorization'];

    return response.data;
  } catch (error) {
    console.error('Logout error:', error);

    // Even if API call fails, still remove the tokens
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('refreshToken');
    } catch (storageError) {
      console.error('Error removing tokens from AsyncStorage:', storageError);
    }

    delete api.defaults.headers.common['Authorization'];

    throw error;
  }
};

// Function to refresh the authentication token
export const refreshAuthToken = async refreshToken => {
  try {
    // Call the token refresh endpoint
    const response = await api.post('/auth/refresh', {refreshToken});

    // Check if the response contains a new token
    if (response.data && response.data.success && response.data.accessToken) {
      // Store the new token in AsyncStorage
      await AsyncStorage.setItem('token', response.data.accessToken);

      // Update the API headers
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${response.data.accessToken}`;

      console.log('Token refreshed successfully');
      return {
        success: true,
        token: response.data.accessToken,
      };
    } else {
      console.warn('No new token received from refresh API');
      return {success: false, message: 'No token received'};
    }
  } catch (error) {
    console.error(
      'Token refresh error:',
      error.response?.data || error.message,
    );

    // Return error details
    return {
      success: false,
      error: error.response?.data || {message: 'Token refresh failed'},
    };
  }
};

// Password Reset Functions
export const requestPasswordResetOTP = async email => {
  try {
    const response = await api.post('/auth/mobile/request-password-reset-otp', {
      email,
    });
    return response.data;
  } catch (error) {
    console.error(
      'Request password reset OTP error:',
      error.response?.data || error,
    );
    if (error.response) {
      throw (
        error.response.data || {message: 'Failed to request password reset'}
      );
    } else if (error.request) {
      throw {message: 'No response from server. Please check your connection.'};
    } else {
      throw {message: error.message || 'An unknown error occurred'};
    }
  }
};

export const verifyPasswordResetOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/mobile/verify-password-reset-otp', {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error(
      'Verify password reset OTP error:',
      error.response?.data || error,
    );
    if (error.response) {
      throw error.response.data || {message: 'Invalid OTP'};
    } else if (error.request) {
      throw {message: 'No response from server. Please check your connection.'};
    } else {
      throw {message: error.message || 'An unknown error occurred'};
    }
  }
};

export const resetPassword = async (email, newPassword, resetToken) => {
  try {
    const response = await api.post('/auth/mobile/reset-password', {
      email,
      newPassword,
      resetToken,
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error);
    if (error.response) {
      throw error.response.data || {message: 'Failed to reset password'};
    } else if (error.request) {
      throw {message: 'No response from server. Please check your connection.'};
    } else {
      throw {message: error.message || 'An unknown error occurred'};
    }
  }
};

// Brand and Filter APIs
export const getBrandList = async (params = {}) => {
  try {
    const response = await api.get('/brand/list', {params});
    return response.data;
  } catch (error) {
    console.error('Error fetching brand list:', error);
    if (error.response) {
      throw error.response.data || {message: 'Failed to fetch brands'};
    } else if (error.request) {
      throw {message: 'No response from server. Please check your connection.'};
    } else {
      throw {message: error.message || 'An unknown error occurred'};
    }
  }
};

// Car Model API
export const getCarModelList = async (params = {}) => {
  try {
    const response = await api.get('/carmodel/list', {
      params,
      headers: {
        'x-api-key': API_KEY,
      },
    });
    console.log('Car model API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching car model list:', error);
    if (error.response) {
      throw error.response.data || {message: 'Failed to fetch car models'};
    } else if (error.request) {
      throw {message: 'No response from server. Please check your connection.'};
    } else {
      throw {message: error.message || 'An unknown error occurred'};
    }
  }
};

// Search car models using the search parameter
export const searchCarModels = async (searchTerm, page = 1, limit = 50) => {
  try {
    // Validate the search term to avoid sending empty or problematic queries
    if (
      !searchTerm ||
      typeof searchTerm !== 'string' ||
      searchTerm.trim() === ''
    ) {
      console.log('Invalid search term provided for car models search');
      return {
        success: false,
        data: [],
        message: 'Invalid search term',
        pagination: {},
      };
    }

    console.log(`Searching car models with term: "${searchTerm}"`);

    // Call the API with the search parameter
    const params = {
      search: searchTerm.trim(),
      page,
      limit,
      status: 'published',
      order: 'desc',
      // lang: 'en',
    };

    console.log(
      `API call: /carmodel/list with params:`,
      JSON.stringify(params),
    );

    const response = await api.get('/carmodel/list', {
      params,
      headers: {
        'x-api-key': API_KEY,
      },
      // Add timeout to prevent hanging requests
      timeout: 200,
    });

    console.log(
      `Search results for "${searchTerm}":`,
      response.data
        ? `Found ${response.data.data?.length || 0} results`
        : 'No response data',
    );

    // Handle success response
    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.data)
    ) {
      const models = response.data.data;

      // Log each model for debugging
      models.forEach((model, index) => {
        console.log(
          `Model ${index + 1}: ID=${model.id}, Name=${model.name}, Brand=${
            model.brand?.name || 'Unknown'
          }`,
        );
      });

      return {
        success: true,
        data: models,
        message: response.data.message || 'Search completed',
        pagination: response.data.pagination || {},
      };
    }

    // If we didn't get a valid response format
    return {
      success: false,
      data: [],
      message: 'No car models found or invalid response format',
      pagination: {},
    };
  } catch (error) {
    console.error(
      `Error searching car models with term "${searchTerm}":`,
      error,
    );

    // Add more detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }

    // Return a structured error response
    return {
      success: false,
      data: [],
      message:
        error.response?.data?.message ||
        error.message ||
        'Error searching car models',
      error: error.response?.status || 'unknown',
      pagination: {},
    };
  }
};

// Fetch unique car brands from the car models endpoint
export const getUniqueBrands = async (params = {}) => {
  try {
    // Use the new API endpoint specified in the requirements
    const response = await api.get(
      'https://api.staging.legendmotorsglobal.com/api/v1/car/list',
      {
        params: {
          ...params,
          limit: 200, // Request more items to get a good variety of brands
        },
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      },
    );

    // Log the response to debug
    console.log(
      'Brand API response structure:',
      JSON.stringify(response.data).substring(0, 500) + '...',
    );

    // Check for success and data
    if (response.data && response.data.success) {
      const brandsMap = {};

      // Handle the data array format from the API example schema
      if (Array.isArray(response.data.data)) {
        response.data.data.forEach(model => {
          if (model.brand && model.brand.id) {
            const brandId = model.brand.id;
            // Use lowercase name as key to avoid case-sensitive duplicates
            brandsMap[brandId] = {
              id: brandId,
              name: model.brand.name || '',
              slug: model.brand.slug || '',
              logo: model.brand.logo || null,
            };
          }
        });
      }

      // Convert map values to array
      const uniqueBrands = Object.values(brandsMap);
      console.log(`Found ${uniqueBrands.length} unique brands`);

      return {
        success: true,
        data: uniqueBrands,
        message: 'Brands retrieved successfully',
      };
    }

    // If API fails or returns unexpected format, return empty data
    return {
      success: false,
      data: [],
      message: 'Failed to retrieve brands',
    };
  } catch (error) {
    console.error('Error fetching unique brands:', error);
    // Return empty data on error
    return {
      success: false,
      data: [],
      message: 'Error retrieving brands: ' + error.message,
    };
  }
};

// Car listing API
export const getCarList = async (params = {}) => {
  try {
    // Set a larger default limit if not specified
    if (!params.limit) {
      params.limit = 10;
    }

    // Debug the parameters being sent to the API
    console.log('Car API params:', JSON.stringify(params));

    // Make API call with parameters
    const response = await api.get('/car/list', {params});
    console.log('Car list API raw response:', response.status);

    // Debug response structure
    if (response.data) {
      console.log('Response shape:', Object.keys(response.data));
      if (response.data.data) {
        console.log(
          'data.data shape:',
          typeof response.data.data,
          Array.isArray(response.data.data),
        );
      }
    }

    // Handle successful response with data
    if (response.data) {
      // Case 1: response.data.data is an array of cars
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Found cars in response.data.data array');
        return {
          success: response.data.success || true,
          data: response.data.data,
          pagination: response.data.pagination || {
            totalItems: response.data.data.length,
            currentPage: params.page || 1,
          },
        };
      }

      // Case 2: response.data.data.cars is an array of cars
      else if (
        response.data.data &&
        response.data.data.cars &&
        Array.isArray(response.data.data.cars)
      ) {
        console.log('Found cars in response.data.data.cars array');
        return {
          success: response.data.success || true,
          data: {
            cars: response.data.data.cars,
            total: response.data.data.total || response.data.data.cars.length,
          },
        };
      }

      // Case 3: response.data.cars is an array of cars
      else if (response.data.cars && Array.isArray(response.data.cars)) {
        console.log('Found cars in response.data.cars array');
        return {
          success: response.data.success || true,
          data: response.data,
        };
      }

      // Case 4: response.data itself might be the direct array of cars
      else if (Array.isArray(response.data)) {
        console.log('Found cars in direct response.data array');
        return {
          success: true,
          data: response.data,
          total: response.data.length,
        };
      }

      // If we got here but have a success property, we have data but in an unexpected format
      else if (response.data.success) {
        console.log(
          'Response has success property but cars are in unknown location',
        );
        // Try to extract data from the response
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(
              `Found array in response.data.${key}, assuming it's cars`,
            );
            return {
              success: true,
              data: response.data[key],
              total: response.data[key].length,
            };
          }
        }

        // Return the original response if we can't extract
        return response.data;
      }

      // Just return the original response if all else fails
      return response.data;
    }

    // Return the original response if none of the above conditions match
    return response.data;
  } catch (error) {
    console.error('Error in getCarList API call:', error.message);
    // Return empty data in case of error
    return {
      success: false,
      data: [],
      message: 'Failed to fetch car data',
      pagination: {
        currentPage: params.page || 1,
        totalPages: 0,
        totalItems: 0,
      },
    };
  }
};

// User Profile API services
export const getUserProfile = async () => {
  try {
    // Ensure token is synchronized before making the request

    const response = await api.get('/auth/user/getProfile');

    // Check for successful response
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error('Failed to fetch profile data');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Add more context to the error message
    if (error.response && error.response.status === 401) {
      throw new Error(
        'Authentication error: Please log in again to access your profile.',
      );
    }
    throw error;
  }
};

export const updateUserProfile = async profileData => {
  try {
    // Ensure token is synchronized before making the request

    // Create a copy of the data to normalize
    const normalizedData = {...profileData};

    // Handle dialCode/countryCode format
    // The API expects dialCode field with "+" prefix
    if (normalizedData.countryCode) {
      // Ensure country code has "+" prefix
      if (!normalizedData.countryCode.startsWith('+')) {
        normalizedData.countryCode = '+' + normalizedData.countryCode;
      }

      // Set dialCode from countryCode if needed
      normalizedData.dialCode = normalizedData.countryCode;

      console.log(
        'Normalized country code for API request:',
        normalizedData.countryCode,
      );
      console.log('Set dialCode for API request:', normalizedData.dialCode);
    }

    console.log(
      'Sending profile update request with data:',
      JSON.stringify(normalizedData),
    );

    const response = await api.put('/auth/user/updateProfile', normalizedData);

    // Check for successful response
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Format the error response for better debugging and handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response status:', error.response.status);
      console.error(
        'Error response data:',
        JSON.stringify(error.response.data),
      );

      return {
        success: false,
        status: error.response.status,
        message:
          error.response.data?.message || 'Server responded with an error',
        data: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return {
        success: false,
        message:
          'No response received from server. Please check your connection.',
      };
    } else if (
      error.message &&
      error.message.includes('Authentication error')
    ) {
      throw new Error(
        'Authentication error: Please log in again to update your profile.',
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        success: false,
        message: error.message || 'Failed to update profile',
      };
    }
  }
};

// FAQ API services
export const getFaqCategories = async (lang = 'en') => {
  try {
    // Ensure token is synchronized before making the request

    const response = await api.get('/faq-category/categories-with-mobile', {
      // params: {lang},
    });

    if (response.data && response.data.success) {
      return response.data;
    } else {
      console.log(
        'API returned unsuccessful response for FAQ categories:',
        response.data,
      );
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch FAQ categories',
        data: [],
      };
    }
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);

    // Return a structured error response
    return {
      success: false,
      message: error.message || 'Failed to fetch FAQ categories',
      data: [],
    };
  }
};

// Blog Posts API services
export const getBlogPosts = async (params = {}) => {
  try {
    // Default parameters
    const defaultParams = {
      page: 1,
      limit: 10,
      // lang: 'en',
      status: 'published',
    };

    // Merge default with provided params
    const requestParams = {...defaultParams, ...params};

    console.log('Fetching blog posts with params:', requestParams);

    const response = await api.get('/blog-post/list', {
      params: requestParams,
    });

    if (response.data && response.data.success) {
      return response.data;
    } else {
      console.log(
        'API returned unsuccessful response for blog posts:',
        response.data,
      );
      return {
        success: false,
        msg: response.data?.msg || 'Failed to fetch blog posts',
        data: [],
      };
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);

    // Return a structured error response
    return {
      success: false,
      msg: error.message || 'Failed to fetch blog posts',
      data: [],
    };
  }
};

// User Enquiries API services
export const getUserEnquiries = async (params = {}) => {
  try {
    // Ensure token is synchronized before making the request

    // Default parameters
    const defaultParams = {
      page: 1,
      limit: 100,
    };

    // Merge default with provided params
    const requestParams = {...defaultParams, ...params};

    console.log('Fetching user enquiries with params:', requestParams);

    // Use the correct API endpoint
    const response = await api.get('/car-enquiry/user-enquiries', {
      params: requestParams,
    });

    console.log('User enquiries API response:', JSON.stringify(response.data));

    if (response.data && response.data.success) {
      console.log(
        `Successfully fetched ${
          response.data.data?.length || 0
        } user enquiries`,
      );
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        msg: response.data.msg || 'Enquiries retrieved successfully',
      };
    } else {
      console.error(
        'API returned unsuccessful response for user enquiries:',
        response.data,
      );
      return {
        success: false,
        data: [],
        msg: response.data?.msg || 'Failed to fetch enquiries',
      };
    }
  } catch (error) {
    console.error('Error fetching user enquiries:', error);

    // Add more detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }

    return {
      success: false,
      data: [],
      msg:
        error.response?.data?.msg ||
        error.message ||
        'Failed to fetch enquiries',
    };
  }
};

// Search cars using the search parameter directly on car/list endpoint
export const searchCars = async (searchTerm, page = 1, limit = 50) => {
  try {
    // Validate the search term to avoid sending empty or problematic queries
    if (
      !searchTerm ||
      typeof searchTerm !== 'string' ||
      searchTerm.trim() === ''
    ) {
      console.log('Invalid search term provided for car search');
      return {
        success: false,
        data: [],
        carIds: [],
        message: 'Invalid search term',
        pagination: {},
      };
    }

    console.log(`Searching cars with term: "${searchTerm}"`);

    // Call the API with the search parameter
    const params = {
      search: searchTerm.trim(),
      page,
      limit,
      status: 'published',
      // lang: 'en',
    };

    console.log(`API call: /car/list with params:`, JSON.stringify(params));

    const response = await api.get('/car/list', {
      params,
      headers: {
        'x-api-key': API_KEY,
      },
      // Add timeout to prevent hanging requests
      timeout: 1000,
    });

    console.log(
      `Car search results for "${searchTerm}":`,
      response.data
        ? `Found ${response.data.data?.length || 0} results`
        : 'No response data',
    );

    // Return car IDs along with the full response data
    let cars = [];
    let carIds = [];

    if (response.data) {
      // Extract car data based on the response structure
      if (response.data.data && Array.isArray(response.data.data)) {
        cars = response.data.data;
      } else if (response.data.cars && Array.isArray(response.data.cars)) {
        cars = response.data.cars;
      }

      // Extract car IDs
      carIds = cars.map(car => car.id);

      console.log(
        `Successfully extracted ${carIds.length} car IDs from search response`,
      );
    }

    return {
      success: response.data?.success || false,
      data: cars,
      carIds,
      message: response.data?.message || 'Search completed',
      pagination: response.data?.pagination || {},
    };
  } catch (error) {
    console.error(`Error searching cars with term "${searchTerm}":`, error);

    // Add more detailed error logging
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }

    // Return a structured error response
    return {
      success: false,
      data: [],
      carIds: [],
      message:
        error.response?.data?.message ||
        error.message ||
        'Error searching cars',
      error: error.response?.status || 'unknown',
      pagination: {},
    };
  }
};

// Function to get car details by ID or slug
export const getCarByIdOrSlug = async (idOrSlug, lang = 'en') => {
  try {
    console.log(
      `Fetching car details by ID/Slug: ${idOrSlug}, language: ${lang}`,
    );

    const isNumeric = /^\d+$/.test(idOrSlug.toString());
    const params = {
      // lang,
    };

    // Add either id or slug parameter based on the input
    if (isNumeric) {
      params.id = idOrSlug;
    } else {
      params.slug = idOrSlug;
    }

    console.log('Request params:', params);

    const response = await api.get(
      `https://api.staging.legendmotorsglobal.com/api/v1/car/getCarByIdOrSlug`,
      {
        params,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      },
    );

    if (response.data && response.data.success) {
      console.log(`Successfully fetched car details for ID/Slug: ${idOrSlug}`);
      return response.data;
    } else {
      console.log(
        `API returned unsuccessful response for car ID/Slug: ${idOrSlug}`,
        response.data,
      );
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch car details',
        data: null,
      };
    }
  } catch (error) {
    console.error(`Error fetching car with ID/Slug ${idOrSlug}:`, error);

    // Add more detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }

    // Return a more helpful error message
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'Error fetching car details',
      error: error.response?.status || 'unknown',
      data: null,
    };
  }
};

// Wishlist API Services
export const addToWishlist = async carId => {
  try {
    // Ensure token is synchronized before making the request

    // console.log(`Adding car ${carId} to wishlist`);

    const response = await api.post('/wishlist/create', {carId});

    // Log the full response for debugging
    // console.log('Wishlist add API response:', JSON.stringify(response.data));

    if (response.data && response.data.success) {
      // console.log('Successfully added car to wishlist:', response.data);
      return response.data;
    } else {
      // console.log(
      //   'API returned unsuccessful response for adding to wishlist:',
      //   response.data,
      // );
      return {
        success: false,
        msg: response.data?.msg || 'Failed to add car to wishlist',
        data: null,
      };
    }
  } catch (error) {
    console.error('Error adding car to wishlist:', error);

    // Return a structured error response
    return {
      success: false,
      msg:
        error.response?.data?.msg ||
        error.message ||
        'Failed to add car to wishlist',
      error: error.response?.status || 'unknown',
      data: null,
    };
  }
};

// Keep track of deletion requests that are in progress
const pendingDeletions = {};

export const removeFromWishlist = async ({carId, userId}) => {
  try {
    const response = await api.delete(
      `/wishlist/delete?userId=${userId}&carId=${carId}`,
    );

    if (response.data && response.data.success) {
      // console.log('Successfully removed car from wishlist:', response.data);
      return {
        success: true,
        message: response.data.message || 'Successfully removed from wishlist',
        data: response.data.data || null,
      };
    } else {
      // console.log('API returned unsuccessful response:', response.data);
      return {
        success: false,
        msg: response.data?.msg || 'Failed to remove car from wishlist',
        data: null,
      };
    }
  } catch (error) {
    // For 404 errors (already deleted), consider it a success
    if (error.response && error.response.status === 404) {
      // console.log(`Car ${carId} was not found in wishlist (already removed)`);
      return {
        success: true,
        message: 'Car was already removed from wishlist',
        data: null,
      };
    }

    console.error('Error removing car from wishlist:', error);

    // Return a structured error response
    return {
      success: false,
      msg:
        error.response?.data?.msg ||
        error.message ||
        'Failed to remove from wishlist',
      error: error.response?.status || 'unknown',
      data: null,
    };
  } finally {
    // Clear the pending status after a short delay
    const key = `car_${carId}`;
    setTimeout(() => {
      delete pendingDeletions[key];
    }, 1000);
  }
};

// Helper function to get wishlist item data
const getWishlistItemData = async wishlistId => {
  try {
    const response = await getWishlist();
    if (response.success && Array.isArray(response.data)) {
      // Find the wishlist item by ID
      const wishlistItem = response.data.find(
        item => item.id === wishlistId || item.id === parseInt(wishlistId),
      );
      if (wishlistItem) {
        return wishlistItem;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting wishlist item data:', error);
    return null;
  }
};

export const getWishlist = async (params = {}) => {
  try {
    // Ensure token is synchronized before making the request

    // Default parameters
    const defaultParams = {
      page: 1,
      limit: 10, // Increased to match the requested limit
    };

    // Merge default with provided params
    const requestParams = {...defaultParams, ...params};

    const response = await api.get('/wishlist/list', {
      params: requestParams,
    });

    if (response.data && response.data.success) {
      return response.data;
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch wishlist',
        data: [],
      };
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error);

    // Return a structured error response
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch wishlist',
      error: error.response?.status || 'unknown',
      data: [],
    };
  }
};

// Submit car enquiry
export const submitCarEnquiry = async enquiryData => {
  try {
    console.log(
      'Submitting car enquiry with data:',
      JSON.stringify(enquiryData),
    );

    // Ensure required fields are present
    if (!enquiryData.carId) {
      console.error('Missing required field: carId');
      return {
        success: false,
        msg: 'Car ID is required',
      };
    }

    // Ensure phone number is properly formatted with country code
    let finalPhoneNumber = enquiryData.phoneNumber || '';

    // If country code is provided and not already part of the phone number
    if (enquiryData.countryCode) {
      const countryCodeWithoutPlus = enquiryData.countryCode.replace('+', '');

      // Remove country code if it's already in the phone number
      if (finalPhoneNumber.startsWith('+' + countryCodeWithoutPlus)) {
        finalPhoneNumber = finalPhoneNumber.substring(
          ('+' + countryCodeWithoutPlus).length,
        );
      } else if (finalPhoneNumber.startsWith(countryCodeWithoutPlus)) {
        finalPhoneNumber = finalPhoneNumber.substring(
          countryCodeWithoutPlus.length,
        );
      }

      // Ensure we don't have leading zeros
      while (finalPhoneNumber.startsWith('0')) {
        finalPhoneNumber = finalPhoneNumber.substring(1);
      }

      // Add country code to the phone number
      finalPhoneNumber = enquiryData.countryCode + finalPhoneNumber;
    }

    // Format the data according to API requirements
    const formattedData = {
      carId: parseInt(enquiryData.carId, 10),
      name: enquiryData.name,
      phoneNumber: finalPhoneNumber, // Properly formatted phone number with country code
      emailAddress: enquiryData.emailAddress,
      pageUrl:
        enquiryData.pageUrl ||
        `https://legendmotorsglobal.com/cars/${enquiryData.carId}`,
      countryCode: enquiryData.countryCode || '+971',
    };

    console.log('Final formatted data for API:', JSON.stringify(formattedData));

    // Make the API call
    const response = await api.post('/car-enquiry/create', formattedData);

    console.log('Car enquiry response:', JSON.stringify(response.data));

    return {
      success: true,
      data: response.data.data,
      msg: response.data.msg || 'Enquiry submitted successfully',
    };
  } catch (error) {
    console.error('Error submitting car enquiry:', error);
    console.error('Request data:', error.request?.data);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);

    // Provide better error message specifically for phone validation issues
    if (
      error.response?.data?.message?.includes('phone') ||
      error.response?.data?.errors?.some(err => err.includes('phone'))
    ) {
      return {
        success: false,
        msg: "The phone number format is invalid. Please ensure you've entered a valid phone number for the selected country code.",
      };
    }

    return {
      success: false,
      msg:
        error.response?.data?.message ||
        error.message ||
        'Failed to submit enquiry',
    };
  }
};

// Function to fetch country dialing codes
export const fetchCountryCodes = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      sortBy = 'name',
      order = 'asc',
      search = '',
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy,
      order,
      ...(search ? {search} : {}),
    }).toString();

    const response = await fetch(
      `${API_BASE_URL}/country-codes/list?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch country codes');
    }

    return data;
  } catch (error) {
    console.error('Error fetching country codes:', error);
    return {
      success: false,
      message:
        error.message || 'An error occurred while fetching country codes',
      data: [],
    };
  }
};

export default api;
