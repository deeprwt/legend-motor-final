import React, {useState, useEffect} from 'react';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import * as filterService from '../services/filtersService';

// Import our optimized components
import {
  FilterHeader,
  FilterList,
  FilterContent,
  FilterFooter,
} from '../components/filter';
import {useCurrencyLanguage} from 'src/context/CurrencyLanguageContext';
import {CommonActions} from '@react-navigation/native';

const FilterScreen = ({route, navigation}) => {
  // Get parameters from navigation or use defaults
  const {
    filterType = 'brands',
    onApplyCallback,
    currentFilters = {},
  } = route?.params || {};

  // State for active filter tab
  const [activeFilter, setActiveFilter] = useState(filterType);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Filter data states
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [years, setYears] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [specValues, setSpecValues] = useState({});

  // Selected filter states
  const [selectedBrands, setSelectedBrands] = useState(
    currentFilters.brands || [],
  );
  const [selectedModels, setSelectedModels] = useState(
    currentFilters.models || [],
  );
  const [selectedTrims, setSelectedTrims] = useState(
    currentFilters.trims || [],
  );
  const [selectedYears, setSelectedYears] = useState(
    currentFilters.years || [],
  );
  const [selectedSpecValues, setSelectedSpecValues] = useState(
    currentFilters.specifications || {},
  );

  // Selected IDs for API filtering
  const [selectedBrandIds, setSelectedBrandIds] = useState(
    currentFilters.brandIds || [],
  );
  const [selectedModelIds, setSelectedModelIds] = useState(
    currentFilters.modelIds || [],
  );
  const [selectedTrimIds, setSelectedTrimIds] = useState(
    currentFilters.trimIds || [],
  );
  const [selectedYearIds, setSelectedYearIds] = useState(
    currentFilters.yearIds || [],
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: null,
    max: null,
  });

  // Filter list items
  const filterItems = [
    {id: 'brands', label: 'Brand(s)'},
    {id: 'models', label: 'Model(s)'},
    {id: 'trims', label: 'Trim(s)'},
    {id: 'years', label: 'Year(s)'},
    {id: 'priceRange', label: 'Price Range'},
    {id: 'bodyType', label: 'Body Type'},
    {id: 'fuelType', label: 'Fuel Type'},
    {id: 'transmission', label: 'Transmission'},
    {id: 'driveType', label: 'Drive Type'},
    {id: 'color', label: 'Color'},
    {id: 'interiorColor', label: 'Interior Color'},
    {id: 'wheelSize', label: 'Wheel Size'},
    {id: 'regionalSpec', label: 'Regional Spec'},
    {id: 'steeringSide', label: 'Steering Side'},
    {id: 'seats', label: 'Seats'},
    {id: 'doors', label: 'Doors'},
    {id: 'cylinders', label: 'Cylinders'},
  ];

  // Specification key mapping
  const specFilterKeyMap = {
    bodyType: 'body_type',
    fuelType: 'fuel_type',
    transmission: 'transmission',
    driveType: 'drive_type',
    color: 'color',
    interiorColor: 'interior_color',
    regionalSpec: 'regional_specification',
    steeringSide: 'steering_side',
    wheelSize: 'wheel_size',
    seats: 'seats',
    doors: 'doors',
    cylinders: 'cylinders',
  };

  // Specification ID mapping
  const specIdMap = {
    body_type: 6,
    fuel_type: 9,
    transmission: 12,
    drive_type: 11,
    color: 3,
    interior_color: 4,
    regional_specification: 1,
    steering_side: 2,
    wheel_size: 5,
    seats: 7,
    doors: 8,
    cylinders: 10,
  };

  // Fetch all specification values once
  const fetchAllSpecValues = async () => {
    try {
      // Only fetch if we don't already have the data
      if (Object.keys(specValues).length === 0) {
        setLoading(true);

        console.log(
          'Attempting to fetch all specification values from car data...',
        );
        const response = await filterService.fetchAllSpecificationValues({
          limit: 100,
        });

        if (response.success && response.data.length > 0) {
          console.log(
            `Success! Received ${response.data.length} total specification values from cars`,
          );

          // Group specification values by specification key
          const groupedValues = {};

          response.data.forEach(value => {
            // Handle both uppercase "Specification" and lowercase "specification"
            const specObj = value.Specification || value.specification;

            if (specObj && specObj.key) {
              const key = specObj.key;

              if (!groupedValues[key]) {
                groupedValues[key] = [];
              }

              // Only add if not already in the array (avoid duplicates)
              const isDuplicate = groupedValues[key].some(
                item => item.name === value.name,
              );
              if (!isDuplicate) {
                groupedValues[key].push(value);
              }
            }
          });

          console.log(
            'Grouped specification values by keys:',
            Object.keys(groupedValues).join(', '),
          );

          // Log values for specific specification types
          if (groupedValues['regional_specification']) {
            console.log(
              'Regional Specification values:',
              groupedValues['regional_specification']
                .map(item => item.name)
                .join(', '),
            );
          }

          if (groupedValues['interior_color']) {
            console.log(
              'Interior Color values:',
              groupedValues['interior_color'].map(item => item.name).join(', '),
            );
          }

          if (groupedValues['steering_side']) {
            console.log(
              'Steering Side values:',
              groupedValues['steering_side'].map(item => item.name).join(', '),
            );
          }

          if (groupedValues['body_type']) {
            console.log(
              'Body Type values:',
              groupedValues['body_type'].map(item => item.name).join(', '),
            );
          }

          setSpecValues(groupedValues);
        } else {
          console.error(
            'Error fetching specification values from cars:',
            response.error,
          );
          console.log(
            'Attempting to fetch individual specification types directly...',
          );

          // Fetch individual specification types directly
          const fetchPromises = [
            fetchRegionalSpecifications(),
            fetchInteriorColorSpecifications(),
            fetchSteeringSideSpecifications(),
            fetchColorSpecifications(),
            fetchWheelSizeSpecifications(),
            fetchBodyTypeSpecifications(),
            fetchSeatsSpecifications(),
            fetchDoorsSpecifications(),
            fetchCylindersSpecifications(),
            fetchTransmissionSpecifications(),
          ];

          await Promise.all(fetchPromises);
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('Error in fetchAllSpecValues:', error);
      console.log(
        'Attempting to fetch individual specification types as fallback...',
      );

      // Fetch individual specification types directly
      const fetchPromises = [
        fetchRegionalSpecifications(),
        fetchInteriorColorSpecifications(),
        fetchSteeringSideSpecifications(),
        fetchColorSpecifications(),
        fetchWheelSizeSpecifications(),
        fetchBodyTypeSpecifications(),
        fetchSeatsSpecifications(),
        fetchDoorsSpecifications(),
        fetchCylindersSpecifications(),
        fetchTransmissionSpecifications(),
        fetchDriveTypeSpecifications(),
      ];

      await Promise.all(fetchPromises);

      setLoading(false);
    }
  };

  // Function to fetch specifications by specId using the new endpoint
  const fetchSpecificationsBySpecId = async specKey => {
    try {
      const specId = specIdMap[specKey];

      if (!specId) {
        console.error(`No specification ID defined for key: ${specKey}`);
        return;
      }

      console.log(
        `🔍 Fetching ${specKey} specifications with ID ${specId} using direct endpoint...`,
      );

      const response = await filterService.fetchSpecificationValuesBySpecId(
        specId,
        {limit: 1000},
      );

      if (response.success && response.data.length > 0) {
        console.log(
          `✅ Success! Received ${response.data.length} ${specKey} values`,
        );
        console.log(
          `📊 Sample values: ${response.data
            .slice(0, 3)
            .map(item => item.name)
            .join(', ')}...`,
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          [specKey]: response.data,
        }));

        return response.data;
      } else {
        console.error(
          `❌ Failed to fetch ${specKey} specifications from API:`,
          response.error || 'No data returned',
        );
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching ${specKey} specifications:`, error);
      return [];
    }
  };

  // Function to fetch regional specifications directly
  const fetchRegionalSpecifications = async () => {
    try {
      console.log('🌎 Fetching regional specifications directly from API...');

      // First try using the direct specification values endpoint with correct ID (1)
      const response = await filterService.fetchSpecificationValuesBySpecId(1, {
        limit: 1000,
      });

      if (response.success && response.data) {
        console.log(
          `✅ Success! Received ${response.data.length} regional specification values directly from API`,
        );
        console.log(
          '📊 Regional spec API response:',
          JSON.stringify(response.data.slice(0, 5)),
        );
        console.log(
          '📊 All regional spec values from API:',
          response.data.map(item => item.name).join(', '),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          regional_specification: response.data,
        }));

        return response.data;
      }

      // If direct approach fails, try alternative approaches
      console.log(
        '⚠️ Direct API approach failed, trying alternative approaches for regional specifications...',
      );

      // Try the standard method through filterService as fallback
      const standardResponse = await filterService.fetchSpecificationValues(
        'regional_specification',
        {limit: 100},
      );

      if (
        standardResponse.success &&
        standardResponse.data &&
        standardResponse.data.length > 0
      ) {
        console.log(
          `✅ Success! Received ${standardResponse.data.length} regional specification values from filterService`,
        );
        console.log(
          '📊 Regional spec standard response:',
          JSON.stringify(standardResponse.data.slice(0, 5)),
        );
        console.log(
          '📊 All regional spec values from standard method:',
          standardResponse.data.map(item => item.name).join(', '),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          regional_specification: standardResponse.data,
        }));

        return standardResponse.data;
      }

      // If all approaches fail, create complete values based on the test.json data
      console.log(
        '⚠️ All approaches failed, using complete regional specification values from API data as fallback',
      );

      // Complete values from test.json data (all regional specs from the API)
      const completeRegionalSpecValues = [
        {id: 1, name: 'GCC', status: 'published'},
        {id: 2, name: 'EU', status: 'published'},
        {id: 3, name: 'US', status: 'draft'},
        {id: 4, name: 'Asia', status: 'published'},
        {id: 5, name: 'Africa', status: 'published'},
        {id: 6, name: 'Latin America', status: 'published'},
        {id: 7, name: 'Australia', status: 'published'},
        {id: 8, name: 'Japan', status: 'published'},
        {id: 9, name: 'India', status: 'published'},
        {id: 10, name: 'China', status: 'published'},
        {id: 98, name: 'Yemen', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        regional_specification: completeRegionalSpecValues,
      }));

      console.log(
        '📊 Using complete regional specification values:',
        completeRegionalSpecValues.map(item => item.name).join(', '),
      );
      return completeRegionalSpecValues;
    } catch (error) {
      console.error('❌ Error fetching regional specifications:', error);

      // Fallback to complete values in case of error
      const completeRegionalSpecValues = [
        {id: 1, name: 'GCC', status: 'published'},
        {id: 2, name: 'EU', status: 'published'},
        {id: 3, name: 'US', status: 'draft'},
        {id: 4, name: 'Asia', status: 'published'},
        {id: 5, name: 'Africa', status: 'published'},
        {id: 6, name: 'Latin America', status: 'published'},
        {id: 7, name: 'Australia', status: 'published'},
        {id: 8, name: 'Japan', status: 'published'},
        {id: 9, name: 'India', status: 'published'},
        {id: 10, name: 'China', status: 'published'},
        {id: 98, name: 'Yemen', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        regional_specification: completeRegionalSpecValues,
      }));

      console.log(
        '📊 Using complete regional specification values after error:',
        completeRegionalSpecValues.map(item => item.name).join(', '),
      );
      return completeRegionalSpecValues;
    }
  };

  // Function to fetch interior color specifications directly
  const fetchInteriorColorSpecifications = async () => {
    try {
      console.log(
        '🎨 Fetching interior color specifications using dedicated function...',
      );

      // First try using the direct specification values endpoint with correct ID (4)
      const response = await filterService.fetchSpecificationValuesBySpecId(4, {
        limit: 1000,
      });

      if (response.success && response.data) {
        console.log(
          `✅ Success! Received ${response.data.length} interior color values directly from API`,
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          interior_color: response.data,
        }));

        return response.data;
      }

      // If direct approach fails, use fallback interior color data
      console.log(
        '⚠️ Using fallback interior color data since API fetch failed',
      );

      // Complete list of common interior car colors
      const completeInteriorColorValues = [
        {id: 1, name: 'Black', status: 'published'},
        {id: 2, name: 'Grey', status: 'published'},
        {id: 3, name: 'Beige', status: 'published'},
        {id: 4, name: 'Brown', status: 'published'},
        {id: 5, name: 'Tan', status: 'published'},
        {id: 6, name: 'White', status: 'published'},
        {id: 7, name: 'Red', status: 'published'},
        {id: 8, name: 'Blue', status: 'published'},
        {id: 9, name: 'Cream', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        interior_color: completeInteriorColorValues,
      }));

      return completeInteriorColorValues;
    } catch (error) {
      console.error('❌ Error fetching interior color specifications:', error);
      return [];
    }
  };

  // Function to fetch steering side specifications directly
  const fetchSteeringSideSpecifications = async () => {
    try {
      console.log(
        '🚘 Fetching steering side specifications directly from API...',
      );

      // First try using the direct specification values endpoint with correct ID (2)
      const response = await filterService.fetchSpecificationValuesBySpecId(2, {
        limit: 1000,
      });

      if (response.success && response.data) {
        console.log(
          `✅ Success! Received ${response.data.length} steering side values directly from API`,
        );
        console.log(
          '📊 Steering side API response:',
          JSON.stringify(response.data),
        );
        console.log(
          '📊 All steering side values from API:',
          response.data.map(item => item.name).join(', '),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          steering_side: response.data,
        }));

        return response.data;
      }

      // If direct approach fails, try alternative approaches
      console.log(
        '⚠️ Direct API approach failed, trying alternative approaches for steering side...',
      );

      // Try the standard method through filterService as fallback
      const standardResponse = await filterService.fetchSpecificationValues(
        'steering_side',
        {limit: 100},
      );

      if (
        standardResponse.success &&
        standardResponse.data &&
        standardResponse.data.length > 0
      ) {
        console.log(
          `✅ Success! Received ${standardResponse.data.length} steering side values from filterService`,
        );
        console.log(
          '📊 Steering side standard response:',
          JSON.stringify(standardResponse.data),
        );
        console.log(
          '📊 All steering side values from standard method:',
          standardResponse.data.map(item => item.name).join(', '),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          steering_side: standardResponse.data,
        }));

        return standardResponse.data;
      }

      // If all approaches fail, create complete values based on the test.json data
      console.log(
        '⚠️ All approaches failed, using complete steering side values from API data as fallback',
      );

      // Complete values from test.json data (all steering side options from the API)
      const completeSteeringSideValues = [
        {id: 11, name: 'Left-hand drive', status: 'published'},
        {id: 12, name: 'Right-hand drive', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        steering_side: completeSteeringSideValues,
      }));

      console.log(
        '📊 Using complete steering side values:',
        completeSteeringSideValues.map(item => item.name).join(', '),
      );
      return completeSteeringSideValues;
    } catch (error) {
      console.error('❌ Error fetching steering side specifications:', error);

      // Fallback to complete values in case of error
      const completeSteeringSideValues = [
        {id: 11, name: 'Left-hand drive', status: 'published'},
        {id: 12, name: 'Right-hand drive', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        steering_side: completeSteeringSideValues,
      }));

      console.log(
        '📊 Using complete steering side values after error:',
        completeSteeringSideValues.map(item => item.name).join(', '),
      );
      return completeSteeringSideValues;
    }
  };

  // Function to fetch drive type specifications directly
  const fetchDriveTypeSpecifications = async () => {
    return fetchSpecificationsBySpecId('drive_type');
  };

  // Function to fetch body type specifications directly
  const fetchBodyTypeSpecifications = async () => {
    try {
      console.log('🚗 Starting body type specifications fetch...');

      // First try using the specification ID approach
      const specValues = await fetchSpecificationsBySpecId('body_type');
      if (specValues && specValues.length > 0) {
        console.log(
          `✅ Success! Received ${specValues.length} body type values through specification ID approach`,
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          body_type: specValues,
        }));

        return specValues;
      }

      // Try with dedicated function
      try {
        console.log('🚗 Trying dedicated function for body types...');
        const response = await filterService.default.fetchBodyTypes();

        if (
          response &&
          response.success &&
          response.data &&
          response.data.length > 0
        ) {
          console.log(
            `✅ Success! Received ${response.data.length} body type values from dedicated function`,
          );
          console.log(
            '📊 Body types from dedicated function:',
            response.data.map(item => item.name).join(', '),
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            body_type: response.data,
          }));

          return response.data;
        }
      } catch (error) {
        console.error('❌ Error with dedicated body type function:', error);
      }

      // Try direct API call with specific ID
      try {
        console.log(
          '📞 Attempting direct API call for body types with ID 6...',
        );
        const directResponse =
          await filterService.fetchSpecificationValuesBySpecId(6, {limit: 100});

        if (
          directResponse &&
          directResponse.success &&
          directResponse.data &&
          directResponse.data.length > 0
        ) {
          console.log(
            `✅ Success! Received ${directResponse.data.length} body types from direct API call with ID 6`,
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            body_type: directResponse.data,
          }));

          return directResponse.data;
        }
      } catch (directError) {
        console.error(
          '❌ Error with direct API call for body types with ID 6:',
          directError,
        );
      }

      // Try direct endpoint call
      try {
        console.log(
          '📞 Attempting direct API call to explicit body type endpoint...',
        );
        const directEndpointResponse = await filterService.default.api.get(
          '/specificationvalue/by-specification/body_type',
          {
            params: {
              limit: 100,
            },
          },
        );

        if (
          directEndpointResponse &&
          directEndpointResponse.data &&
          Array.isArray(directEndpointResponse.data.data) &&
          directEndpointResponse.data.data.length > 0
        ) {
          console.log(
            `✅ Success! Received ${directEndpointResponse.data.data.length} body types from direct endpoint call`,
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            body_type: directEndpointResponse.data.data,
          }));

          return directEndpointResponse.data.data;
        }
      } catch (endpointError) {
        console.error(
          '❌ Error with direct endpoint call for body types:',
          endpointError,
        );
      }

      // If all approaches fail, use fallback values
      console.log(
        '⚠️ All approaches failed for body types, using fallback values...',
      );
      const fallbackBodyTypes = [
        {id: 51, name: 'Sedan', status: 'published'},
        {id: 52, name: 'SUV', status: 'published'},
        {id: 53, name: 'Hatchback', status: 'published'},
        {id: 54, name: 'Coupe', status: 'published'},
        {id: 55, name: 'Wagon', status: 'published'},
        {id: 56, name: 'Van', status: 'published'},
        {id: 57, name: 'Truck', status: 'published'},
        {id: 58, name: 'Convertible', status: 'published'},
        {id: 59, name: 'Crossover', status: 'published'},
        {id: 60, name: 'Minivan', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        body_type: fallbackBodyTypes,
      }));

      console.log(
        '📊 Using fallback body types:',
        fallbackBodyTypes.map(item => item.name).join(', '),
      );
      return fallbackBodyTypes;
    } catch (error) {
      console.error('❌ Error fetching body type specifications:', error);

      // Use fallback values in case of any errors
      const fallbackBodyTypes = [
        {id: 51, name: 'Sedan', status: 'published'},
        {id: 52, name: 'SUV', status: 'published'},
        {id: 53, name: 'Hatchback', status: 'published'},
        {id: 54, name: 'Coupe', status: 'published'},
        {id: 55, name: 'Wagon', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        body_type: fallbackBodyTypes,
      }));

      return fallbackBodyTypes;
    }
  };

  // Function to fetch seats specifications directly
  const fetchSeatsSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('seats');
      if (specValues && specValues.length > 0) {
        return specValues;
      }

      console.log(
        '🪑 Fetching seats specifications using dedicated function...',
      );

      // Use the dedicated seats fetch function - most reliable approach
      const response = await filterService.default.fetchSeatsData();

      if (response.success && response.data && response.data.length > 0) {
        console.log(
          `✅ Success! Received ${response.data.length} seat specifications from dedicated function`,
        );
        console.log(
          '📊 Seats from dedicated function:',
          JSON.stringify(response.data.map(item => item.name)),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          seats: response.data,
        }));

        return response.data;
      }

      // If dedicated function fails, fall back to other methods
      console.log(
        '⚠️ Dedicated function failed for seats, trying alternative approach...',
      );

      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch seats through filterService');
      const standardResponse = await filterService.fetchSpecificationValues(
        'seats',
        {limit: 1000},
      );

      if (
        standardResponse.success &&
        standardResponse.data &&
        standardResponse.data.length > 0
      ) {
        console.log(
          `✅ Success! Received ${standardResponse.data.length} seat specifications from filterService`,
        );
        console.log(
          '📊 Seats from filterService:',
          JSON.stringify(standardResponse.data.map(item => item.name)),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          seats: standardResponse.data,
        }));

        return standardResponse.data;
      } else {
        console.error(
          '❌ Failed to fetch seat specifications through all methods',
        );
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching seat specifications:', error);
      return [];
    }
  };

  // Function to fetch doors specifications directly
  const fetchDoorsSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('doors');
      if (specValues && specValues.length > 0) {
        return specValues;
      }

      console.log(
        '🚪 Fetching doors specifications using dedicated function...',
      );

      // Use the dedicated doors fetch function - most reliable approach
      const response = await filterService.default.fetchDoorsData();

      if (response.success && response.data && response.data.length > 0) {
        console.log(
          `✅ Success! Received ${response.data.length} door options from dedicated function`,
        );
        console.log(
          '📊 Doors from dedicated function:',
          JSON.stringify(response.data.map(item => item.name)),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          doors: response.data,
        }));

        return response.data;
      }

      // If dedicated function fails, fall back to other methods
      console.log(
        '⚠️ Dedicated function failed for doors, trying alternative approach...',
      );

      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch doors through filterService');
      const standardResponse = await filterService.fetchSpecificationValues(
        'doors',
        {limit: 1000},
      );

      if (
        standardResponse.success &&
        standardResponse.data &&
        standardResponse.data.length > 0
      ) {
        console.log(
          `✅ Success! Received ${standardResponse.data.length} door options from filterService`,
        );
        console.log(
          '📊 Doors from filterService:',
          JSON.stringify(standardResponse.data.map(item => item.name)),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          doors: standardResponse.data,
        }));

        return standardResponse.data;
      } else {
        console.error('❌ Failed to fetch door options through all methods');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching door specifications:', error);
      return [];
    }
  };

  // Function to fetch fuel type specifications directly
  const fetchFuelTypeSpecifications = async () => {
    try {
      console.log('⛽ Starting fuel type specifications fetch...');

      // First try using the specification ID approach
      const specValues = await fetchSpecificationsBySpecId('fuel_type');
      if (specValues && specValues.length > 0) {
        console.log(
          `✅ Success! Received ${specValues.length} fuel types through specification ID approach`,
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          fuel_type: specValues,
        }));

        return specValues;
      }

      console.log(
        '⛽ Fetching fuel type specifications using dedicated function...',
      );

      // Try with service function specifically for fuel types
      try {
        const response = await filterService.fetchFuelTypeData();

        if (response.success && response.data && response.data.length > 0) {
          console.log(
            `✅ Success! Received ${response.data.length} fuel types from dedicated function`,
          );
          console.log(
            '📊 Fuel types from dedicated function:',
            response.data.map(item => item.name).join(', '),
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            fuel_type: response.data,
          }));

          return response.data;
        }
      } catch (error) {
        console.error('❌ Error with fuel type dedicated function:', error);
      }

      // Try direct API call for fuel types
      try {
        console.log('📞 Attempting direct API call for fuel types...');
        const directResponse = await filterService.default.api.get(
          '/specificationvalue/by-specification/fuel_type',
          {
            params: {
              limit: 100,
            },
          },
        );

        if (
          directResponse.data &&
          Array.isArray(directResponse.data.data) &&
          directResponse.data.data.length > 0
        ) {
          console.log(
            `✅ Success! Received ${directResponse.data.data.length} fuel types from direct API call`,
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            fuel_type: directResponse.data.data,
          }));

          return directResponse.data.data;
        }
      } catch (directError) {
        console.error(
          '❌ Error with direct API call for fuel types:',
          directError,
        );
      }

      // If all approaches fail, use fallback values
      console.log(
        '⚠️ All approaches failed for fuel types, using fallback values...',
      );
      const fallbackFuelTypes = [
        {id: 74, name: 'Petrol', status: 'published'},
        {id: 75, name: 'Diesel', status: 'published'},
        {id: 76, name: 'Hybrid', status: 'published'},
        {id: 77, name: 'Electric', status: 'published'},
        {id: 78, name: 'LPG', status: 'published'},
        {id: 79, name: 'CNG', status: 'published'},
        {id: 80, name: 'Plug-in Hybrid', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        fuel_type: fallbackFuelTypes,
      }));

      console.log(
        '📊 Using fallback fuel types:',
        fallbackFuelTypes.map(item => item.name).join(', '),
      );
      return fallbackFuelTypes;
    } catch (error) {
      console.error('❌ Error fetching fuel type specifications:', error);
      return [];
    }
  };

  // Function to fetch cylinders specifications directly
  const fetchCylindersSpecifications = async () => {
    try {
      // First try using the new specification ID approach
      const specValues = await fetchSpecificationsBySpecId('cylinders');
      if (specValues && specValues.length > 0) {
        return specValues;
      }

      console.log(
        '🔧 Fetching cylinder specifications using dedicated function...',
      );

      // Use the dedicated cylinders fetch function - most reliable approach
      const response = await filterService.default.fetchCylindersData();

      if (response.success && response.data && response.data.length > 0) {
        console.log(
          `✅ Success! Received ${response.data.length} cylinder options from dedicated function`,
        );
        console.log(
          '📊 Cylinders from dedicated function:',
          JSON.stringify(response.data.map(item => item.name)),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          cylinders: response.data,
        }));

        return response.data;
      }

      // If dedicated function fails, fall back to other methods
      console.log(
        '⚠️ Dedicated function failed for cylinders, trying alternative approach...',
      );

      // Try the standard method through filterService as fallback
      console.log('📞 Attempting to fetch cylinders through filterService');
      const standardResponse = await filterService.fetchSpecificationValues(
        'cylinders',
        {limit: 1000},
      );

      if (
        standardResponse.success &&
        standardResponse.data &&
        standardResponse.data.length > 0
      ) {
        console.log(
          `✅ Success! Received ${standardResponse.data.length} cylinder options from filterService`,
        );
        console.log(
          '📊 Cylinders from filterService:',
          JSON.stringify(standardResponse.data.map(item => item.name)),
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          cylinders: standardResponse.data,
        }));

        return standardResponse.data;
      } else {
        console.error(
          '❌ Failed to fetch cylinder options through all methods',
        );
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching cylinder specifications:', error);
      return [];
    }
  };

  // Enhanced extract colors function to be more robust
  const extractColorsFromSlug = (slug, type = 'exterior') => {
    if (!slug || typeof slug !== 'string') return [];

    // More comprehensive list of color terms to look for in slugs
    const colorTerms = [
      'white',
      'black',
      'red',
      'blue',
      'green',
      'yellow',
      'orange',
      'purple',
      'pink',
      'brown',
      'grey',
      'gray',
      'silver',
      'gold',
      'beige',
      'tan',
      'maroon',
      'navy',
      'teal',
      'olive',
      'cyan',
      'magenta',
      'burgundy',
      'turquoise',
      'bronze',
      'champagne',
      'copper',
      'crimson',
      'indigo',
    ];

    // Convert slug to lowercase and replace hyphens and underscores with spaces
    const slugText = slug.toLowerCase().replace(/[-_]/g, ' ');

    // Identify interior vs exterior colors based on context clues in the slug
    const interiorColorPatterns = ['inside', 'interior', 'and'];
    const exteriorColorPatterns = [
      'body',
      'roof',
      'pearl',
      'metallic',
      'outside',
    ];

    // Extract parts of slug text that likely contain interior or exterior color info
    let interiorPart = '';
    let exteriorPart = slugText;

    // Many slugs use 'inside' to denote interior colors
    if (slugText.includes('inside')) {
      const parts = slugText.split('inside');
      exteriorPart = parts[0]; // Everything before "inside" is exterior
      interiorPart = parts[1]; // Everything after "inside" is interior
    }

    // Find all color terms in the appropriate part of the slug
    let foundColors = [];

    if (type === 'interior' && interiorPart) {
      // Extract interior colors from the interior part of the slug
      foundColors = colorTerms.filter(
        color =>
          interiorPart.includes(color) ||
          interiorPart.includes(`${color} and`) ||
          interiorPart.includes(`and ${color}`),
      );

      console.log(
        `🏠 Interior part: "${interiorPart.trim()}" - Found colors: ${foundColors.join(
          ', ',
        )}`,
      );
    } else if (type === 'exterior') {
      // For exterior, look for color terms with exterior indicators
      foundColors = colorTerms.filter(color => {
        // First check for explicit exterior markers
        if (
          exteriorPart.includes(`${color} body`) ||
          exteriorPart.includes(`body ${color}`) ||
          exteriorPart.includes(`${color} roof`) ||
          exteriorPart.includes(`roof ${color}`) ||
          exteriorPart.includes(`${color} metallic`) ||
          exteriorPart.includes(`metallic ${color}`) ||
          exteriorPart.includes(`${color} pearl`)
        ) {
          return true;
        }

        // If no interior markers in slug, look for colors before any interior marker
        if (!interiorPart && exteriorPart.includes(color)) {
          return true;
        }

        // Check if color is in the exterior part but not close to interior indicators
        if (exteriorPart.includes(color)) {
          // Avoid detecting colors that are likely interior
          const isLikelyInteriorColor = interiorColorPatterns.some(
            pattern =>
              exteriorPart.includes(`${color} ${pattern}`) ||
              exteriorPart.includes(`${pattern} ${color}`),
          );

          return !isLikelyInteriorColor;
        }

        return false;
      });

      console.log(
        `🚗 Exterior part: "${exteriorPart.trim()}" - Found colors: ${foundColors.join(
          ', ',
        )}`,
      );
    }

    return [...new Set(foundColors)]; // Return unique colors
  };

  // Normalize color names for matching
  const normalizeColorName = colorName => {
    if (!colorName) return '';
    return colorName;
  };

  // Enhanced function to fetch color specifications
  const fetchColorSpecifications = async () => {
    try {
      console.log(
        '🎨 Fetching color specifications using dedicated function...',
      );

      // First try using the direct specification values endpoint with correct ID (3)
      const response = await filterService.fetchSpecificationValuesBySpecId(3, {
        limit: 1000,
      });

      if (response.success && response.data) {
        console.log(
          `✅ Success! Received ${response.data.length} color values directly from API`,
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          color: response.data,
        }));

        return response.data;
      }

      // If direct approach fails, use fallback color data
      console.log('⚠️ Using fallback color data since API fetch failed');

      // Complete list of common car colors - expanded with more options
      const completeColorValues = [
        {id: 1, name: 'White', status: 'published'},
        {id: 2, name: 'Black', status: 'published'},
        {id: 3, name: 'Silver', status: 'published'},
        {id: 4, name: 'Gray', status: 'published'},
        {id: 5, name: 'Grey', status: 'published'},
        {id: 6, name: 'Red', status: 'published'},
        {id: 7, name: 'Blue', status: 'published'},
        {id: 8, name: 'Green', status: 'published'},
        {id: 9, name: 'Yellow', status: 'published'},
        {id: 10, name: 'Brown', status: 'published'},
        {id: 11, name: 'Orange', status: 'published'},
        {id: 12, name: 'Beige', status: 'published'},
        {id: 13, name: 'Purple', status: 'published'},
        {id: 14, name: 'Gold', status: 'published'},
        {id: 15, name: 'Maroon', status: 'published'},
        {id: 16, name: 'Tan', status: 'published'},
        {id: 17, name: 'Navy', status: 'published'},
        {id: 18, name: 'Burgundy', status: 'published'},
        {id: 19, name: 'Turquoise', status: 'published'},
        {id: 20, name: 'Bronze', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        color: completeColorValues,
      }));

      return completeColorValues;
    } catch (error) {
      console.error('❌ Error fetching color specifications:', error);
      return [];
    }
  };

  // Function to fetch wheel size specifications directly
  const fetchWheelSizeSpecifications = async () => {
    return fetchSpecificationsBySpecId('wheel_size');
  };

  // Function to fetch transmission specifications directly
  const fetchTransmissionSpecifications = async () => {
    try {
      console.log('🔄 Starting transmission specifications fetch...');

      // First try using the specification ID approach
      const specValues = await fetchSpecificationsBySpecId('transmission');
      if (specValues && specValues.length > 0) {
        console.log(
          `✅ Success! Received ${specValues.length} transmission values through specification ID approach`,
        );

        // Add to existing spec values
        setSpecValues(prev => ({
          ...prev,
          transmission: specValues,
        }));

        return specValues;
      }

      console.log(
        '🔄 Fetching transmission specifications using direct API call...',
      );

      // Try direct API call for transmission with ID 12
      try {
        const response = await filterService.fetchSpecificationValuesBySpecId(
          12,
          {limit: 1000},
        );

        if (response.success && response.data && response.data.length > 0) {
          console.log(
            `✅ Success! Received ${response.data.length} transmission values directly from API`,
          );
          console.log(
            '📊 Transmission values from API:',
            response.data.map(item => item.name).join(', '),
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            transmission: response.data,
          }));

          return response.data;
        }
      } catch (error) {
        console.error(
          '❌ Error fetching transmission values by spec ID:',
          error,
        );
      }

      // Try direct endpoint call
      try {
        console.log('📞 Attempting direct API call for transmissions...');
        const directResponse = await filterService.default.api.get(
          '/specificationvalue/by-specification/transmission',
          {
            params: {
              limit: 100,
            },
          },
        );

        if (
          directResponse.data &&
          Array.isArray(directResponse.data.data) &&
          directResponse.data.data.length > 0
        ) {
          console.log(
            `✅ Success! Received ${directResponse.data.data.length} transmission values from direct API call`,
          );

          // Add to existing spec values
          setSpecValues(prev => ({
            ...prev,
            transmission: directResponse.data.data,
          }));

          return directResponse.data.data;
        }
      } catch (directError) {
        console.error(
          '❌ Error with direct API call for transmissions:',
          directError,
        );
      }

      // If all approaches fail, use fallback values
      console.log(
        '⚠️ All approaches failed for transmissions, using fallback values...',
      );
      const fallbackTransmissions = [
        {id: 94, name: 'Manual', status: 'published'},
        {id: 95, name: 'Automatic', status: 'published'},
        {id: 96, name: 'Semi-Automatic', status: 'published'},
        {id: 97, name: 'CVT', status: 'published'},
        {id: 104, name: 'Dual-Clutch', status: 'published'},
        {id: 105, name: 'Tiptronic', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        transmission: fallbackTransmissions,
      }));

      console.log(
        '📊 Using fallback transmission values:',
        fallbackTransmissions.map(item => item.name).join(', '),
      );
      return fallbackTransmissions;
    } catch (error) {
      console.error('❌ Error fetching transmission specifications:', error);

      // Fallback to safe values
      const fallbackTransmissions = [
        {id: 94, name: 'Manual', status: 'published'},
        {id: 95, name: 'Automatic', status: 'published'},
        {id: 96, name: 'Semi-Automatic', status: 'published'},
        {id: 97, name: 'CVT', status: 'published'},
      ];

      // Add to existing spec values
      setSpecValues(prev => ({
        ...prev,
        transmission: fallbackTransmissions,
      }));

      return fallbackTransmissions;
    }
  };

  // Load initial data on mount
  useEffect(() => {
    // Fetch all specification values at once
    fetchAllSpecValues();

    // Specifically fetch critical specifications directly
    // Set a small delay to avoid hitting API rate limits
    const fetchCriticalSpecifications = async () => {
      try {
        console.log('🔄 Fetching critical specifications...');

        // First batch of critical specifications
        await Promise.all([
          fetchBodyTypeSpecifications(),
          fetchColorSpecifications(),
        ]);

        // Small delay before next batch
        setTimeout(async () => {
          await Promise.all([
            fetchFuelTypeSpecifications(),
            fetchTransmissionSpecifications(),
          ]);

          // Small delay before next batch
          setTimeout(async () => {
            await Promise.all([
              fetchSeatsSpecifications(),
              fetchDoorsSpecifications(),
              fetchCylindersSpecifications(),
            ]);
          }, 500);
        }, 500);
      } catch (error) {
        console.error('Error fetching critical specifications:', error);
      }
    };

    fetchCriticalSpecifications();
  }, []);

  // Add fallback values for body type, fuel type, and transmission
  const addFallbackValues = () => {
    // Fallback body type values
    if (!specValues['body_type'] || specValues['body_type'].length === 0) {
      const fallbackBodyTypes = [
        {id: 51, name: 'Sedan', status: 'published'},
        {id: 52, name: 'SUV', status: 'published'},
        {id: 53, name: 'Hatchback', status: 'published'},
        {id: 54, name: 'Coupe', status: 'published'},
        {id: 55, name: 'Wagon', status: 'published'},
        {id: 56, name: 'Van', status: 'published'},
        {id: 57, name: 'Truck', status: 'published'},
        {id: 58, name: 'Convertible', status: 'published'},
        {id: 59, name: 'Crossover', status: 'published'},
        {id: 60, name: 'Minivan', status: 'published'},
      ];

      setSpecValues(prev => ({
        ...prev,
        body_type: fallbackBodyTypes,
      }));

      console.log(
        '🚗 Using fallback body types:',
        fallbackBodyTypes.map(item => item.name).join(', '),
      );
    }

    // Fallback fuel type values
    if (!specValues['fuel_type'] || specValues['fuel_type'].length === 0) {
      const fallbackFuelTypes = [
        {id: 74, name: 'Petrol', status: 'published'},
        {id: 75, name: 'Diesel', status: 'published'},
        {id: 76, name: 'Hybrid', status: 'published'},
        {id: 77, name: 'Electric', status: 'published'},
        {id: 78, name: 'LPG', status: 'published'},
        {id: 79, name: 'CNG', status: 'published'},
        {id: 80, name: 'Plug-in Hybrid', status: 'published'},
      ];

      setSpecValues(prev => ({
        ...prev,
        fuel_type: fallbackFuelTypes,
      }));

      console.log(
        '⛽ Using fallback fuel types:',
        fallbackFuelTypes.map(item => item.name).join(', '),
      );
    }

    // Fallback transmission values
    if (
      !specValues['transmission'] ||
      specValues['transmission'].length === 0
    ) {
      const fallbackTransmissions = [
        {id: 94, name: 'Manual', status: 'published'},
        {id: 95, name: 'Automatic', status: 'published'},
        {id: 96, name: 'Semi-Automatic', status: 'published'},
        {id: 97, name: 'CVT', status: 'published'},
        {id: 104, name: 'Dual-Clutch', status: 'published'},
        {id: 105, name: 'Tiptronic', status: 'published'},
      ];

      setSpecValues(prev => ({
        ...prev,
        transmission: fallbackTransmissions,
      }));

      console.log(
        '🔄 Using fallback transmissions:',
        fallbackTransmissions.map(item => item.name).join(', '),
      );
    }
  };

  // Load filter data when the component mounts or when the active filter changes
  useEffect(() => {
    loadFilterData();

    // Check if we need to add fallback values
    if (
      !specValues['body_type'] ||
      specValues['body_type'].length === 0 ||
      !specValues['fuel_type'] ||
      specValues['fuel_type'].length === 0 ||
      !specValues['transmission'] ||
      specValues['transmission'].length === 0
    ) {
      // Add a small delay to allow API fetches to complete first
      setTimeout(() => {
        addFallbackValues();
      }, 100);
    }
  }, [activeFilter]);

  // Get data for current filter
  const getCurrentFilterData = () => {
    switch (activeFilter) {
      case 'brands':
        return brands;
      case 'models':
        return models;
      case 'trims':
        return trims;
      case 'years':
        return years;
      default:
        if (specFilterKeyMap[activeFilter]) {
          const specKey = specFilterKeyMap[activeFilter];
          return specValues[specKey] || [];
        }
        return [];
    }
  };

  // Get empty message for current filter
  const getEmptyMessage = () => {
    switch (activeFilter) {
      case 'brands':
        return 'No brands available';
      case 'models':
        return selectedBrands.length > 0
          ? 'No models available for selected brands'
          : 'Please select the brand first to continue';
      case 'trims':
        return selectedModels.length > 0
          ? 'No trims available for selected models'
          : 'Please select the modal first to continue';
      case 'years':
        return 'No years available';
      default:
        return 'No options available from API';
    }
  };

  // Get info text for current filter
  const getInfoText = () => {
    switch (activeFilter) {
      case 'models':
        return selectedBrands.length > 0
          ? `Showing models for: ${selectedBrands.join(', ')}`
          : '';
      case 'trims':
        return selectedModels.length > 0
          ? `Showing trims for: ${selectedModels.join(', ')}`
          : '';
      default:
        return '';
    }
  };

  // Get selected items for current filter
  const getSelectedItems = () => {
    switch (activeFilter) {
      case 'brands':
        return selectedBrands;
      case 'models':
        return selectedModels;
      case 'trims':
        return selectedTrims;
      case 'years':
        return selectedYears;
      default:
        if (specFilterKeyMap[activeFilter]) {
          const specKey = specFilterKeyMap[activeFilter];
          return selectedSpecValues[specKey] || [];
        }
        return [];
    }
  };

  const handlePriceRangeSelect = value => {
    console.log('priceRange', value);
    setSelectedPriceRange(value);
  };

  // Get item select handler for current filter
  const getItemSelectHandler = () => {
    switch (activeFilter) {
      case 'brands':
        return handleBrandSelect;
      case 'models':
        return handleModelSelect;
      case 'trims':
        return handleTrimSelect;
      case 'years':
        return handleYearSelect;
      case 'priceRange':
        return handlePriceRangeSelect;
      default:
        return handleSpecValueSelect;
    }
  };

  // Get retry handler for current filter
  const getRetryHandler = () => {
    switch (activeFilter) {
      case 'brands':
        return fetchBrands;
      case 'models':
        return fetchModels;
      case 'trims':
        return fetchTrims;
      case 'years':
        return fetchYears;
      case 'bodyType':
        return fetchBodyTypeSpecifications;
      case 'fuelType':
        return fetchFuelTypeSpecifications;
      case 'transmission':
        return fetchTransmissionSpecifications;
      case 'color':
        return fetchColorSpecifications;
      case 'regionalSpec':
        return fetchRegionalSpecifications;
      case 'steeringSide':
        return fetchSteeringSideSpecifications;
      default:
        if (specFilterKeyMap[activeFilter]) {
          const specKey = specFilterKeyMap[activeFilter];
          return () => fetchSpecificationsBySpecId(specKey);
        }
        return null;
    }
  };

  // Load filter data based on active filter
  const loadFilterData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading filter data for:', activeFilter);
      // Always fetch regional specifications to ensure we have them available
      if (
        !specValues['regional_specification'] ||
        specValues['regional_specification'].length === 0
      ) {
        console.log('🌎 Pre-loading regional specifications');
        await fetchRegionalSpecifications();
      }

      switch (activeFilter) {
        case 'brands':
          if (brands.length === 0) {
            console.log('🏢 Brand filter activated - fetching brands');
            await fetchBrands();
          }
          break;

        case 'models':
          if (models.length === 0) {
            console.log('🚗 Model filter activated - fetching models');
            await fetchModels();
          }
          break;

        case 'trims':
          if (trims.length === 0) {
            console.log('🏁 Trim filter activated - fetching trims');
            await fetchTrims();
          }
          break;

        case 'years':
          if (years.length === 0) {
            console.log('📅 Year filter activated - fetching years');
            await fetchYears();
          }
          break;

        case 'bodyType':
          if (
            !specValues['body_type'] ||
            specValues['body_type'].length === 0
          ) {
            console.log('🚙 Body Type filter activated - fetching values');
            await fetchBodyTypeSpecifications();
          }
          break;

        case 'fuelType':
          if (
            !specValues['fuel_type'] ||
            specValues['fuel_type'].length === 0
          ) {
            console.log('⛽ Fuel Type filter activated - fetching values');
            await fetchFuelTypeSpecifications();
          }
          break;

        case 'transmission':
          if (
            !specValues['transmission'] ||
            specValues['transmission'].length === 0
          ) {
            console.log(
              '🔄 Transmission filter activated - forcefully fetching fresh values',
            );
            await fetchTransmissionSpecifications();
          }
          break;

        case 'driveType':
          if (
            !specValues['drive_type'] ||
            specValues['drive_type'].length === 0
          ) {
            console.log('🚗 Drive Type filter activated - fetching values');
            await fetchDriveTypeSpecifications();
          }
          break;

        case 'color':
          if (!specValues['color'] || specValues['color'].length === 0) {
            console.log('🎨 Color filter activated - fetching values');
            await fetchColorSpecifications();
          }
          break;

        case 'interiorColor':
          if (
            !specValues['interior_color'] ||
            specValues['interior_color'].length === 0
          ) {
            console.log('🚗 Interior Color filter activated - fetching values');
            await fetchInteriorColorSpecifications();
          }
          break;

        case 'wheelSize':
          if (
            !specValues['wheel_size'] ||
            specValues['wheel_size'].length === 0
          ) {
            console.log('🛞 Wheel Size filter activated - fetching values');
            await fetchWheelSizeSpecifications();
          }
          break;

        case 'regionalSpec':
          // Always fetch fresh regional specification values when the filter is activated
          console.log(
            '🌎 Regional Specification filter activated - forcefully fetching fresh values',
          );
          await fetchRegionalSpecifications();
          break;

        case 'steeringSide':
          console.log(
            '🚘 Steering Side filter activated - forcefully fetching fresh values',
          );
          await fetchSteeringSideSpecifications();
          break;

        case 'seats':
          if (!specValues['seats'] || specValues['seats'].length === 0) {
            console.log('💺 Seats filter activated - fetching values');
            await fetchSeatsSpecifications();
          }
          break;

        case 'doors':
          if (!specValues['doors'] || specValues['doors'].length === 0) {
            console.log('🚪 Doors filter activated - fetching values');
            await fetchDoorsSpecifications();
          }
          break;

        case 'cylinders':
          if (
            !specValues['cylinders'] ||
            specValues['cylinders'].length === 0
          ) {
            console.log('🔧 Cylinders filter activated - fetching values');
            await fetchCylindersSpecifications();
          }
          break;
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands data
  const fetchBrands = async () => {
    const response = await filterService.fetchBrands({limit: 100});
    if (response.success) {
      // Filter out duplicate brands by name
      const uniqueBrands = [];
      const brandNames = new Set();

      response.data.forEach(brand => {
        if (!brandNames.has(brand.name)) {
          brandNames.add(brand.name);
          uniqueBrands.push(brand);
        }
      });

      setBrands(uniqueBrands);
    }
  };

  // Fetch models data
  const fetchModels = async () => {
    // Only fetch models if at least one brand is selected
    if (selectedBrandIds.length === 0) {
      // Clear existing models when no brand is selected
      setModels([]);
      return;
    }

    // Include brand filter if brands are selected
    const params = {limit: 100};
    params.brandId = selectedBrandIds.join(',');

    console.log(
      `🚗 Fetching models for selected brands: ${selectedBrands.join(
        ', ',
      )} (IDs: ${selectedBrandIds.join(', ')})`,
    );

    setLoading(true);
    try {
      const response = await filterService.fetchCarModels(params);
      if (response.success) {
        // Filter out duplicate models by name
        const uniqueModels = [];
        const modelNames = new Set();

        response.data.forEach(model => {
          if (!modelNames.has(model.name)) {
            modelNames.add(model.name);
            uniqueModels.push(model);
          }
        });

        console.log(
          `✅ Found ${uniqueModels.length} models for selected brands`,
        );
        setModels(uniqueModels);
      } else {
        console.error('❌ Error fetching models:', response.error);
        setModels([]);
      }
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trims data
  const fetchTrims = async () => {
    // Only fetch trims if at least one model is selected
    if (selectedModelIds.length === 0) {
      // Clear existing trims when no model is selected
      setTrims([]);
      return;
    }

    // Include brand and model filters if selected
    const params = {limit: 100};

    if (selectedBrandIds.length > 0) {
      params.brandId = selectedBrandIds.join(',');
    }

    if (selectedModelIds.length > 0) {
      params.modelId = selectedModelIds.join(',');
    }

    console.log(
      `🏁 Fetching trims for selected models: ${selectedModels.join(
        ', ',
      )} (IDs: ${selectedModelIds.join(', ')})`,
    );

    setLoading(true);
    try {
      const response = await filterService.fetchTrims(params);
      if (response.success) {
        // Filter out duplicate trims by name to avoid showing duplicates in the UI
        const uniqueTrims = [];
        const trimNames = new Set();

        // Filter to keep only unique trim names
        response.data.forEach(trim => {
          if (!trimNames.has(trim.name)) {
            trimNames.add(trim.name);
            uniqueTrims.push(trim);
          }
        });

        console.log(`✅ Found ${uniqueTrims.length} trims for selected models`);
        setTrims(uniqueTrims);
      } else {
        console.error('❌ Error fetching trims:', response.error);
        setTrims([]);
      }
    } catch (error) {
      console.error('❌ Error fetching trims:', error);
      setTrims([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch years data
  const fetchYears = async () => {
    // Include brand, model, and trim filters if selected
    const params = {limit: 100};

    if (selectedBrandIds.length > 0) {
      params.brandId = selectedBrandIds.join(',');
    }

    if (selectedModelIds.length > 0) {
      params.modelId = selectedModelIds.join(',');
    }

    if (selectedTrimIds.length > 0) {
      params.trimId = selectedTrimIds.join(',');
    }

    const response = await filterService.fetchYears(params);
    if (response.success) {
      // Filter out duplicate years
      const uniqueYears = [];
      const yearValues = new Set();

      response.data.forEach(year => {
        if (!yearValues.has(year.year)) {
          yearValues.add(year.year);
          uniqueYears.push(year);
        }
      });

      setYears(uniqueYears);
    }
  };

  // Handle brand selection
  const handleBrandSelect = item => {
    const brandId = item.id;
    const brandName = item.name;

    // Toggle brand selection
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(prev => prev.filter(name => name !== brandName));
      setSelectedBrandIds(prev => prev.filter(id => id !== brandId));
    } else {
      setSelectedBrands(prev => [...prev, brandName]);
      setSelectedBrandIds(prev => [...prev, brandId]);
    }

    // Clear model and trim selections when brand selection changes
    setSelectedModels([]);
    setSelectedModelIds([]);
    setSelectedTrims([]);
    setSelectedTrimIds([]);
  };

  // Handle model selection
  const handleModelSelect = item => {
    const modelId = item.id;
    const modelName = item.name;

    // Toggle model selection
    if (selectedModels.includes(modelName)) {
      setSelectedModels(prev => prev.filter(name => name !== modelName));
      setSelectedModelIds(prev => prev.filter(id => id !== modelId));
    } else {
      setSelectedModels(prev => [...prev, modelName]);
      setSelectedModelIds(prev => [...prev, modelId]);
    }

    // Clear trim selections when model selection changes
    setSelectedTrims([]);
    setSelectedTrimIds([]);
  };

  // Handle trim selection
  const handleTrimSelect = item => {
    const trimId = item.id;
    const trimName = item.name;

    // Toggle trim selection
    if (selectedTrims.includes(trimName)) {
      setSelectedTrims(prev => prev.filter(name => name !== trimName));
      setSelectedTrimIds(prev => prev.filter(id => id !== trimId));
    } else {
      setSelectedTrims(prev => [...prev, trimName]);
      setSelectedTrimIds(prev => [...prev, trimId]);
    }
  };

  // Handle year selection
  const handleYearSelect = item => {
    const yearId = item.id;
    const yearValue = item.year;

    // Toggle year selection
    if (selectedYears.includes(yearValue)) {
      setSelectedYears(prev => prev.filter(year => year !== yearValue));
      setSelectedYearIds(prev => prev.filter(id => id !== yearId));
    } else {
      setSelectedYears(prev => [...prev, yearValue]);
      setSelectedYearIds(prev => [...prev, yearId]);
    }
  };

  // Handle specification value selection
  const handleSpecValueSelect = item => {
    const specKey = specFilterKeyMap[activeFilter];
    const valueId = item.id;
    const valueName = item.name;

    // Log selection for debugging
    if (specKey === 'body_type') {
      console.log(
        `${
          selectedSpecValues[specKey]?.includes(valueName)
            ? 'Deselecting'
            : 'Selecting'
        } Body Type: ${valueName} (ID: ${valueId})`,
      );
    } else if (specKey === 'regional_specification') {
      console.log(
        `${
          selectedSpecValues[specKey]?.includes(valueName)
            ? 'Deselecting'
            : 'Selecting'
        } Regional Specification: ${valueName} (ID: ${valueId})`,
      );
    }

    setSelectedSpecValues(prev => {
      const updatedValues = {...prev};

      if (!updatedValues[specKey]) {
        updatedValues[specKey] = [];
      }

      if (updatedValues[specKey].includes(valueId)) {
        updatedValues[specKey] = updatedValues[specKey].filter(
          id => id !== valueId,
        );
      } else {
        updatedValues[specKey] = [...updatedValues[specKey], valueId];
      }

      return updatedValues;
    });
  };

  // Handle filter tab selection
  const handleFilterSelect = filterId => {
    setActiveFilter(filterId);
  };
  const {selectedCurrency} = useCurrencyLanguage();
  // Handle apply button press - enhance to properly use slug extracted colors
  const handleApply = () => {
    // Construct filters object
    const filters = {
      brands: selectedBrands,
      brandIds: selectedBrandIds,
      models: selectedModels,
      modelIds: selectedModelIds,
      trims: selectedTrims,
      trimIds: selectedTrimIds,
      years: selectedYears,
      yearIds: selectedYearIds,
      specifications: selectedSpecValues,
      extractColorsFromSlug: true, // Flag to indicate color extraction from slugs should be used

      // Add helper function for matching extracted colors from slugs
      // This will be used by the ExploreScreen to match colors from slugs
      matchExtractedColors: slug => {
        // If no color filters are selected, don't filter by color
        if (
          !selectedSpecValues.color ||
          selectedSpecValues.color.length === 0
        ) {
          return true;
        }

        // Extract colors from the slug
        const extractedColors = extractColorsFromSlug(slug);
        console.log(
          `🔎 Checking slug colors: ${extractedColors.join(
            ', ',
          )} against selected colors: ${selectedSpecValues.color.join(', ')}`,
        );

        // If no colors found in the slug but we're filtering by color, don't exclude it
        // Some cars might not have color in their slug but could match in other ways
        if (extractedColors.length === 0) {
          console.log(`⚠️ No colors found in slug: ${slug}, but not excluding`);
          return true;
        }

        // Check if any of the extracted colors match our selected color filters
        // Normalize both for comparison (lowercase, trim)
        const normalizedSelectedColors = selectedSpecValues.color;

        // Check for matches
        const matchFound = extractedColors.some(extractedColor =>
          normalizedSelectedColors.includes(extractedColor),
        );

        console.log(
          `${matchFound ? '✅' : '❌'} Color match for slug: ${
            matchFound ? 'Found' : 'Not found'
          }`,
        );

        // If any color matches, include the car
        return matchFound;
      },

      // Add flags to help ExploreScreen understand the filter combinations
      hasBrandFilter: selectedBrands.length > 0,
      hasModelFilter: selectedModels.length > 0,
      hasTrimFilter: selectedTrims.length > 0,
      hasYearFilter: selectedYears.length > 0,

      // Add helper method to check if a car should be included based on specifications
      // This ensures specs are filtered only for cars that match brand/model/trim hierarchy
      matchSpecifications: car => {
        // First check if the car matches the brand/model/trim filters
        let includeBasedOnHierarchy = true;

        // Brand filter
        if (selectedBrands.length > 0) {
          includeBasedOnHierarchy = selectedBrands.some(
            brand =>
              car.brand && car.brand.toLowerCase() === brand.toLowerCase(),
          );
          if (!includeBasedOnHierarchy) return false;
        }

        // Model filter (if we have brand match)
        if (includeBasedOnHierarchy && selectedModels.length > 0) {
          includeBasedOnHierarchy = selectedModels.some(
            model =>
              car.model && car.model.toLowerCase() === model.toLowerCase(),
          );
          if (!includeBasedOnHierarchy) return false;
        }

        // Trim filter (if we have brand and model match)
        if (includeBasedOnHierarchy && selectedTrims.length > 0) {
          includeBasedOnHierarchy = selectedTrims.some(
            trim => car.trim && car.trim.toLowerCase() === trim.toLowerCase(),
          );
          if (!includeBasedOnHierarchy) return false;
        }

        // Year filter
        if (includeBasedOnHierarchy && selectedYears.length > 0) {
          includeBasedOnHierarchy = selectedYears.some(
            year => car.year && car.year.toString() === year.toString(),
          );
          if (!includeBasedOnHierarchy) return false;
        }

        // If car passes the brand/model/trim/year hierarchy, now check specifications
        if (selectedSpecValues && Object.keys(selectedSpecValues).length > 0) {
          // Check each specification category (body_type, fuel_type, etc.)
          for (const specKey in selectedSpecValues) {
            const selectedValues = selectedSpecValues[specKey];

            // Skip if no values selected for this specification type
            if (!selectedValues || selectedValues.length === 0) continue;

            // Handle color separately using the matchExtractedColors function
            if (specKey === 'color' && car.slug) {
              const colorMatch = filters.matchExtractedColors(car.slug);
              if (!colorMatch) return false;
              continue;
            }

            // Handle interior color separately
            if (specKey === 'interior_color' && car.slug) {
              // Extract interior colors from slug
              const interiorColors = extractColorsFromSlug(
                car.slug,
                'interior',
              );
              const normalizedSelectedColors =
                selectedValues.map(normalizeColorName);

              const interiorColorMatch = interiorColors.some(extractedColor =>
                normalizedSelectedColors.includes(
                  normalizeColorName(extractedColor),
                ),
              );

              if (!interiorColorMatch) return false;
              continue;
            }

            // For other specifications, check in SpecificationValues
            let specMatch = false;

            if (
              car.SpecificationValues &&
              Array.isArray(car.SpecificationValues)
            ) {
              specMatch = car.SpecificationValues.some(spec => {
                // Check if specification matches the key we're looking for
                const specMatches =
                  (spec.Specification && spec.Specification.key === specKey) ||
                  (spec.specification && spec.specification.key === specKey);

                if (!specMatches) return false;

                // Check if the specification value matches any of our selected values
                return selectedValues.some(
                  selectedValue =>
                    spec.id && selectedValue && spec.id === selectedValue,
                );
              });
            }

            // If no match found for this specification, exclude the car
            if (!specMatch) {
              return false;
            }
          }
        }

        // If we got here, the car matches all filters
        return true;
      },

      // Backward compatibility
      useSpecificationValues: true,
    };
    console.log('selectedPriceRange', selectedPriceRange);
    if (selectedPriceRange.min !== null && selectedPriceRange.max !== null) {
      if (selectedCurrency === 'USD') {
        filters.priceRange = {
          minPriceUSD: selectedPriceRange.min * 1000,
          maxPriceUSD: selectedPriceRange.max * 1000,
        };
      } else {
        filters.priceRange = {
          minPriceAED: selectedPriceRange.min * 1000,
          maxPriceAED: selectedPriceRange.max * 1000,
        };
      }
    }
    // Call the callback with filters
    if (onApplyCallback) {
      console.log(
        '📤 Sending filter data to ExploreScreen with enhanced filtering',
      );
      console.log('🎛️ Selected filters:', {
        brands: selectedBrands,
        models: selectedModels,
        trims: selectedTrims,
        years: selectedYears,
        specifications: Object.keys(selectedSpecValues).map(
          key => `${key}: ${selectedSpecValues[key].join(', ')}`,
        ),
      });
      onApplyCallback(filters);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              state: {routes: [{name: 'ExploreTab', params: {filters}}]},
            },
            // {name: 'Explore', params: {filters}},
          ],
        }),
      );
      // navigation.reset({
      //   index: 0,
      //   screen: 'ExploreTab',
      //   params: {
      //     filters: filters,
      //   },
      // });
    }

    // Navigate back
    // navigation.goBack();
  };

  // Handle reset button press
  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedBrandIds([]);
    setSelectedModels([]);
    setSelectedModelIds([]);
    setSelectedTrims([]);
    setSelectedTrimIds([]);
    setSelectedYears([]);
    setSelectedYearIds([]);
    setSelectedSpecValues({});
  };

  // Get the current title for the filter content
  const getFilterTitle = () => {
    const filter = filterItems.find(item => item.id === activeFilter);
    return filter ? `Select ${filter.label}` : 'Select Filter';
  };

  // Get selected count
  const getSelectedCount = () => {
    let count = 0;
    count += selectedBrands.length;
    count += selectedModels.length;
    count += selectedTrims.length;
    count += selectedYears.length;

    // Add spec values count
    Object.values(selectedSpecValues).forEach(values => {
      count += values.length;
    });

    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Header */}
      <FilterHeader onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* Filter List Sidebar */}
        <FilterList
          filterItems={filterItems}
          activeFilter={activeFilter}
          onSelect={handleFilterSelect}
        />

        {/* Filter Content */}
        <View style={styles.filterContentContainer}>
          <FilterContent
            title={getFilterTitle()}
            data={getCurrentFilterData()}
            loading={loading}
            emptyMessage={getEmptyMessage()}
            selectedItems={getSelectedItems()}
            onSelectItem={getItemSelectHandler()}
            onRetry={getRetryHandler()}
            infoText={getInfoText()}
            itemType={activeFilter}
          />
        </View>
      </View>

      {/* Filter Footer */}
      <FilterFooter
        onReset={handleReset}
        onApply={handleApply}
        selectedCount={getSelectedCount()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  filterContentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default FilterScreen;
