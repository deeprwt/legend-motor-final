import React, {createContext, useState, useContext, useEffect} from 'react';
import {addToWishlist, removeFromWishlist, getWishlist} from '../services/api';
import {useAuth} from './AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, API_KEY} from '../utils/apiConfig';

// Create context
export const WishlistContext = createContext();

// Create a module-level variable to track removals globally across screens

// Create provider component
export const WishlistProvider = ({children}) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const {isAuthenticated, checkAuthStatus} = useAuth();

  // Initial fetch of wishlist
  useEffect(() => {
    const initializeWishlist = async () => {
      const isAuth = await checkAuthStatus();
      if (isAuth) {
        await fetchWishlistItems();
      } else {
        setWishlistItems([]);
      }
    };
    initializeWishlist();
  }, [isAuthenticated]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      if (response.success && Array.isArray(response.data)) {
        setWishlistItems(response.data);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addItemToWishlist = async carId => {
    try {
      setLoading(true);

      // Check if item already exist
      const response = await addToWishlist(carId);

      if (response.success) {
        console.log('response.data.car====>', response.data);
        if (response.data) {
          setWishlistItems(prevItems => [...prevItems, response.data]);
        }
        return {success: true};
      }
      return {
        success: false,
        message: response.msg || 'Failed to add to wishlist',
      };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return {success: false, message: 'Error adding to wishlist'};
    } finally {
      setLoading(false);
    }
  };

  const {user} = useAuth();
  const removeItemFromWishlist = async carId => {
    try {
      setLoading(true);

      // Determine the carId to remove

      const response = await removeFromWishlist({carId, userId: user.id});

      if (response.success) {
        // Update local state immediately
        setWishlistItems(prevItems =>
          prevItems.filter(item => item.carId !== carId),
        );
        return {success: true};
      }

      return {
        success: false,
        message: response.msg || 'Failed to remove from wishlist',
      };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return {success: false, message: 'Error removing from wishlist'};
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = carId => {
    return wishlistItems.findIndex(item => item.carId === carId) > -1;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        isInWishlist,
        addItemToWishlist,
        removeItemFromWishlist,
        fetchWishlistItems,
        clearWishlist: () => setWishlistItems([]),
      }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
