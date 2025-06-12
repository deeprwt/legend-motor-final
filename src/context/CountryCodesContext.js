import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchCountryCodes } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback country codes if API fails
const FALLBACK_COUNTRY_CODES = [
  { iso2: 'US', name: 'United States', dialCode: '+1' },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { iso2: 'IN', name: 'India', dialCode: '+91' },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { iso2: 'AU', name: 'Australia', dialCode: '+61' },
  { iso2: 'CN', name: 'China', dialCode: '+86' },
  { iso2: 'DE', name: 'Germany', dialCode: '+49' },
  { iso2: 'FR', name: 'France', dialCode: '+33' },
  { iso2: 'JP', name: 'Japan', dialCode: '+81' },
  { iso2: 'IT', name: 'Italy', dialCode: '+39' },
  { iso2: 'RU', name: 'Russia', dialCode: '+7' },
  { iso2: 'BR', name: 'Brazil', dialCode: '+55' },
  { iso2: 'MX', name: 'Mexico', dialCode: '+52' },
  { iso2: 'KR', name: 'South Korea', dialCode: '+82' },
  { iso2: 'ES', name: 'Spain', dialCode: '+34' },
  { iso2: 'SG', name: 'Singapore', dialCode: '+65' },
  { iso2: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { iso2: 'ZA', name: 'South Africa', dialCode: '+27' },
  { iso2: 'PK', name: 'Pakistan', dialCode: '+92' },
];

const CountryCodesContext = createContext();

export const CountryCodesProvider = ({ children }) => {
  const [countryCodes, setCountryCodes] = useState(FALLBACK_COUNTRY_CODES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCountryCodes = async () => {
      try {
        // Try to get cached country codes first
        const cachedData = await AsyncStorage.getItem('countryCodes');
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData.length > 0) {
            setCountryCodes(parsedData);
            setLoading(false);
          }
        }
        
        // Fetch fresh data from API
        const response = await fetchCountryCodes({ limit: 250 });
        
        if (response.success && response.data && response.data.length > 0) {
          // Process the response to ensure each dialCode-iso2 combination is unique
          // This prevents rendering issues when multiple countries share a dialCode
          const processedData = [];
          const seenDialCodes = new Set();
          
          response.data.forEach(country => {
            const uniqueKey = `${country.dialCode}-${country.iso2}`;
            if (!seenDialCodes.has(uniqueKey)) {
              seenDialCodes.add(uniqueKey);
              processedData.push(country);
            }
          });
          
          setCountryCodes(processedData);
          // Cache the processed data
          await AsyncStorage.setItem('countryCodes', JSON.stringify(processedData));
        } else {
          // If API call fails but we have cached data, continue using that
          // If no cached data, we'll use the fallback data that's already set
          if (!cachedData || JSON.parse(cachedData).length === 0) {
            console.log('Using fallback country codes data');
          }
        }
      } catch (err) {
        console.error('Error in CountryCodesContext:', err);
        setError(err.message || 'An error occurred');
        // Make sure we have at least the fallback data
        if (countryCodes.length === 0) {
          setCountryCodes(FALLBACK_COUNTRY_CODES);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCountryCodes();
  }, []);

  const refreshCountryCodes = async (params = {}) => {
    setLoading(true);
    try {
      const response = await fetchCountryCodes({ limit: 250, ...params });
      
      if (response.success && response.data && response.data.length > 0) {
        // Process the response to ensure each dialCode-iso2 combination is unique
        const processedData = [];
        const seenDialCodes = new Set();
        
        response.data.forEach(country => {
          const uniqueKey = `${country.dialCode}-${country.iso2}`;
          if (!seenDialCodes.has(uniqueKey)) {
            seenDialCodes.add(uniqueKey);
            processedData.push(country);
          }
        });
        
        setCountryCodes(processedData);
        await AsyncStorage.setItem('countryCodes', JSON.stringify(processedData));
      } else {
        setError('Failed to refresh country codes');
        // Don't change the current country codes if refresh fails
      }
    } catch (err) {
      setError(err.message || 'An error occurred while refreshing');
      // Don't change the current country codes if refresh fails
    } finally {
      setLoading(false);
    }
  };

  return (
    <CountryCodesContext.Provider 
      value={{ 
        countryCodes, 
        loading, 
        error, 
        refreshCountryCodes 
      }}
    >
      {children}
    </CountryCodesContext.Provider>
  );
};

export const useCountryCodes = () => useContext(CountryCodesContext);

export default CountryCodesContext; 