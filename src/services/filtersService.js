import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Fetch brands for filter
export const fetchBrands = async (params = {}) => {
  try {
    const response = await api.get('/brand/list', { params });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching brands for filter:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch brands'
    };
  }
};

// Fetch car models for filter
export const fetchCarModels = async (params = {}) => {
  try {
    const response = await api.get('/carmodel/list', { params });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching car models for filter:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch car models'
    };
  }
};

// Fetch trims for filter
export const fetchTrims = async (params = {}) => {
  try {
    const response = await api.get('/trim/list', { params });
        return {
          success: true,
      data: response.data.data || [],
      pagination: response.data.pagination
        };
  } catch (error) {
    console.error('Error fetching trims for filter:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch trims'
    };
  }
};

// Fetch years for filter
export const fetchYears = async (params = {}) => {
  try {
    const response = await api.get('/year/list', { params });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching years for filter:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch years'
    };
  }
};

// Fetch specifications list
export const fetchSpecifications = async (params = {}) => {
  try {
    const response = await api.get('/specification/list', { params });
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching specifications for filter:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch specifications'
    };
  }
};

// Fetch all specification values
export const fetchAllSpecificationValues = async (params = {}) => {
  try {
    // Ensure we include required parameters
    const updatedParams = {
      ...params,
      page: params.page || 1,
      limit: params.limit || 1000,
      lang: params.lang || 'en',
      sortBy: 'createdAt',
      order: 'DESC'
    };
    
    console.log('Fetching car data with params to extract specifications:', updatedParams);
    
    // Use the car/list endpoint since it contains specification data
    const response = await api.get('/car/list', { params: updatedParams });
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(`Received ${response.data.data.length} cars, extracting specifications...`);
      
      // Extract all specification values from cars
      const allSpecValues = [];
      const processedSpecIds = new Set();
      
      response.data.data.forEach(car => {
        if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
          car.SpecificationValues.forEach(specValue => {
            // Only add if we haven't seen this ID before
            if (!processedSpecIds.has(specValue.id)) {
              processedSpecIds.add(specValue.id);
              allSpecValues.push(specValue);
        }
      });
    }
  });
  
      console.log(`Extracted ${allSpecValues.length} unique specification values from cars`);
      
      return {
        success: true,
        data: allSpecValues,
        pagination: response.data.pagination
      };
    }
    
    return {
      success: false,
      data: [],
      error: 'No car data found to extract specifications'
    };
  } catch (error) {
    console.error('Error fetching car data for specifications:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch car data'
    };
  }
};

// Fetch specification values for a specific specification
export const fetchSpecificationValues = async (specKey, params = {}) => {
  try {
    // Ensure we include required parameters
    const updatedParams = {
      ...params,
      page: params.page || 1,
      limit: params.limit || 100,
      lang: params.lang || 'en',
      sortBy: 'createdAt',
      order: 'DESC'
    };
    
    if (specKey === 'body_type') {
      console.log('🔍 Fetching car data to extract body_type values with params:', updatedParams);
    } else {
      console.log(`Fetching cars to extract ${specKey} specification values...`);
    }
    
    // Use the car/list endpoint and extract the specific specifications we need
    const response = await api.get('/car/list', { params: updatedParams });
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      if (specKey === 'body_type') {
        console.log(`📊 Received ${response.data.data.length} cars for body_type extraction`);
        console.log('🚗 First car sample:', JSON.stringify(response.data.data[0]?.id));
        
        if (response.data.data[0]?.SpecificationValues) {
          console.log('🧪 First car specifications sample:', JSON.stringify(response.data.data[0]?.SpecificationValues.slice(0, 3)));
        }
      } else {
        console.log(`Received ${response.data.data.length} cars, extracting ${specKey} specifications...`);
      }
      
      // Extract specification values for the specific key
      const specValues = [];
      const processedSpecIds = new Set();
      let bodyTypeCount = 0;
      
      response.data.data.forEach(car => {
        if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
          car.SpecificationValues.forEach(specValue => {
            // Check if this specification matches our key - handle both uppercase and lowercase property names
            const hasUppercaseSpec = specValue.Specification && specValue.Specification.key === specKey;
            const hasLowercaseSpec = specValue.specification && specValue.specification.key === specKey;
            
            if (hasUppercaseSpec || hasLowercaseSpec) {
              if (specKey === 'body_type') {
                bodyTypeCount++;
                console.log(`🏁 Found body_type in car ${car.id}: ${specValue.name || 'unnamed'}`);
              }
              
              // Only add if we haven't seen this ID before
              if (!processedSpecIds.has(specValue.id)) {
                processedSpecIds.add(specValue.id);
                specValues.push(specValue);
                
                if (specKey === 'body_type') {
                  console.log(`✅ Added unique body_type: ${specValue.name || 'unnamed'}`);
                }
              }
            }
          });
        }
      });
      
      // If we didn't find values using the SpecificationValues approach,
      // try alternative approach using direct API data format you provided
      if (specValues.length === 0 && specKey === 'body_type') {
        console.log('Attempting to fetch body types directly from API...');
        try {
          const directResponse = await api.get('/specificationvalue/by-specification/body_type', { params });
          
          if (directResponse.data && Array.isArray(directResponse.data.data)) {
            console.log(`Found ${directResponse.data.data.length} body types from direct API call`);
            return {
              success: true,
              data: directResponse.data.data,
              pagination: directResponse.data.pagination
            };
          }
        } catch (directError) {
          console.error('Error fetching body types directly:', directError);
          // Continue with the existing approach if this fails
        }
      }
      
      if (specKey === 'body_type') {
        console.log(`🎯 Found ${bodyTypeCount} total body_type occurrences across all cars`);
        console.log(`🏆 Extracted ${specValues.length} unique body_type values`);
        
        if (specValues.length > 0) {
          console.log('📋 All unique body types:', specValues.map(v => v.name).join(', '));
          console.log('📝 First body_type full details:', JSON.stringify(specValues[0]));
        } else {
          console.log('❌ No body_type values found!');
        }
      } else {
        console.log(`Extracted ${specValues.length} unique ${specKey} values from cars`);
      }
      
      return {
        success: true,
        data: specValues,
        pagination: response.data.pagination
      };
    }
    
    if (specKey === 'body_type') {
      console.log('❌ No valid car data found in API response for body_type extraction');
      
      // Try to get body types directly as a fallback
      try {
        console.log('Attempting direct API call for body types as fallback...');
        const directResponse = await api.get('/specificationvalue/by-specification/body_type', { params });
        
        if (directResponse.data && Array.isArray(directResponse.data.data)) {
          console.log(`Found ${directResponse.data.data.length} body types from direct API call`);
        return {
          success: true,
            data: directResponse.data.data,
            pagination: directResponse.data.pagination
          };
        }
      } catch (directError) {
        console.error('Error in fallback body type fetch:', directError);
      }
    }
    
    return {
      success: false,
      data: [],
      error: 'No car data found to extract specifications'
    };
  } catch (error) {
    if (specKey === 'body_type') {
      console.error('❌ Error fetching car data for body_type specifications:', error);
      
      // Try direct API call as last resort
      try {
        console.log('Attempting direct API call for body types as last resort...');
        const directResponse = await api.get('/specificationvalue/by-specification/body_type', { params });
        
        if (directResponse.data && Array.isArray(directResponse.data.data)) {
          console.log(`Found ${directResponse.data.data.length} body types from direct API call`);
          return {
            success: true,
            data: directResponse.data.data,
            pagination: directResponse.data.pagination
          };
        }
      } catch (directError) {
        console.error('Error in last resort body type fetch:', directError);
      }
    } else {
      console.error(`Error fetching car data for ${specKey} specifications:`, error);
    }
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch car data'
    };
  }
};

// Direct function to fetch body types - more reliable approach
export const fetchBodyTypes = async () => {
  try {
    console.log('🚙 Making direct axios call to fetch body types using specification ID approach');
    
    // Try to get all specification values and filter by specification ID 6 (body_type)
    let allBodyTypes = [];
    let bodyTypeMap = new Map(); // Use a map to track unique items by ID
    
    try {
      // Direct approach: Get all specification values and filter by specification.id = 6
      const response = await api.get('/specificationvalue/list', {
        params: {
          page: 1,
          limit: 10,
          lang: 'en'
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`✅ Received ${response.data.data.length} total specification values`);
        
        // Filter to only keep body types (specification.id = 6)
        const bodyTypes = response.data.data.filter(item => 
          (item.specification && item.specification.id === 6) || 
          (item.Specification && item.Specification.id === 6)
        );
        
        console.log(`✅ Filtered to ${bodyTypes.length} body types by specification ID`);
        
        // Add to our collection, tracking by ID
        bodyTypes.forEach(item => {
          if (!bodyTypeMap.has(item.id)) {
            bodyTypeMap.set(item.id, item);
            console.log(`🚗 Found body type: ${item.name} (ID: ${item.id})`);
          }
        });
      }
    } catch (directError) {
      console.error('⚠️ Direct specification list approach failed:', directError);
    }
    
    // If the direct approach didn't find enough body types, try alternative approaches
    if (bodyTypeMap.size < 5) {
      console.log('⚠️ Specification ID approach didn\'t find enough body types, trying alternative approaches');
      
      // First approach: direct endpoint with by-specification
      try {
        const response = await api.get('specificationvalue/list/body_type', {
          params: {
            limit: 100,
            page: 1,
            sortBy: 'id',
            order: 'ASC'
          }
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          console.log(`✅ Direct endpoint found ${response.data.data.length} body types`);
          
          // Add to our collection, tracking by ID
          response.data.data.forEach(item => {
            if (!bodyTypeMap.has(item.id)) {
              bodyTypeMap.set(item.id, item);
              console.log(`🚗 Found body type: ${item.name} (ID: ${item.id})`);
            }
          });
        }
      } catch (directError) {
        console.error('⚠️ Direct endpoint approach failed:', directError);
      }
      
      // Second approach: query multiple pages of car data to extract body types
      if (bodyTypeMap.size < 5) {
        try {
          console.log('🚗 Trying car data approach with multiple pages');
          
          // Fetch multiple pages of car data to increase chances of finding all body types
          for (let page = 1; page <= 3; page++) {
            const carResponse = await api.get('/car/list', {
              params: {
                limit: 100,
                page: page,
                // Try different sort orders to get a variety of cars
                sortBy: page % 2 === 0 ? 'createdAt' : 'updatedAt',
                order: page % 2 === 0 ? 'DESC' : 'ASC'
              }
            });
            
            if (carResponse.data && Array.isArray(carResponse.data.data)) {
              console.log(`✅ Car endpoint page ${page} returned ${carResponse.data.data.length} cars`);
              
              // Extract body types from car data
              carResponse.data.data.forEach(car => {
                if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                  car.SpecificationValues.forEach(specValue => {
                    // Check for body type in both uppercase and lowercase properties
                    const hasUppercaseBodyType = specValue.Specification && 
                      (specValue.Specification.key === 'body_type' || specValue.Specification.id === 6);
                    const hasLowercaseBodyType = specValue.specification && 
                      (specValue.specification.key === 'body_type' || specValue.specification.id === 6);
                    
                    if (hasUppercaseBodyType || hasLowercaseBodyType) {
                      if (!bodyTypeMap.has(specValue.id)) {
                        bodyTypeMap.set(specValue.id, specValue);
                        console.log(`🚚 Found body type in car data: ${specValue.name} (ID: ${specValue.id})`);
                      }
                    }
                  });
                }
              });
              
              // If we already have all 9 body types we're looking for, we can stop
              if (bodyTypeMap.size >= 9) {
                console.log('🎯 Found all expected body types, stopping car data search');
                break;
              }
            }
            
            // If no more data or pagination info indicates we're at the end, break
            if (!carResponse.data || !carResponse.data.data || carResponse.data.data.length === 0) {
              break;
            }
          }
        } catch (carError) {
          console.error('⚠️ Car data approach failed:', carError);
        }
      }
    }
    
    // If we still don't have enough body types, check for missing known types
    if (bodyTypeMap.size < 9) {
      console.log(`⚠️ Only found ${bodyTypeMap.size} body types, checking for missing known types`);
      
      // List of expected body types based on your data
      const expectedTypes = [
        { id: 49, name: "Sedan", key: "body_type" },
        { id: 50, name: "Hatchback", key: "body_type" },
        { id: 51, name: "SUV", key: "body_type" },
        { id: 52, name: "Crossover", key: "body_type" },
        { id: 53, name: "Coupe", key: "body_type" },
        { id: 54, name: "Convertible", key: "body_type" },
        { id: 55, name: "Pickup Truck", key: "body_type" },
        { id: 56, name: "Van", key: "body_type" },
        { id: 57, name: "Wagon", key: "body_type" }
      ];
      
      // Check for missing types
      const currentNames = new Set([...bodyTypeMap.values()].map(item => item.name));
      
      expectedTypes.forEach(type => {
        if (!currentNames.has(type.name)) {
          console.log(`❓ Checking if '${type.name}' exists in the API results...`);
          
          // Look through what we have to see if same ID with different name
          const foundById = bodyTypeMap.get(type.id);
          if (foundById) {
            console.log(`⚠️ Found body type with ID ${type.id} but with name '${foundById.name}' instead of '${type.name}'`);
          } else {
            console.log(`❓ Body type '${type.name}' with ID ${type.id} not found in API results`);
          }
        }
      });
    }
    
    // Convert map to array for final result
    allBodyTypes = Array.from(bodyTypeMap.values());
    
    if (allBodyTypes.length > 0) {
      console.log(`🎯 Successfully collected ${allBodyTypes.length} body types using multiple approaches`);
      console.log('📋 All body types:', allBodyTypes.map(item => item.name).join(', '));
      
    return {
      success: true,
        data: allBodyTypes,
        pagination: { totalItems: allBodyTypes.length }
      };
    } else {
      console.error('❌ All approaches failed to find body types');
      return {
        success: false,
        data: [],
        error: 'Failed to find any body types'
      };
    }
  } catch (error) {
    console.error('❌ Direct body type fetch failed:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch body types'
    };
  }
};

// Direct function to fetch seats specifications - similar to the body types approach
export const fetchSeatsData = async () => {
  try {
    console.log('🪑 Making direct axios call to fetch seats using specification ID approach');
    
    // Try to get all specification values and filter by specification ID 7 (seats)
    let allSeats = [];
    let seatsMap = new Map(); // Use a map to track unique items by ID
    
    try {
      // Direct approach: Get all specification values and filter by specification.id = 7
      const response = await api.get('/specificationvalue/list', {
        params: {
          limit: 100,
          page: 1,
          lang: 'en'
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`✅ Received ${response.data.data.length} total specification values`);
        
        // Filter to only keep seats (specification.id = 7)
        const seats = response.data.data.filter(item => 
          (item.specification && item.specification.id === 7) || 
          (item.Specification && item.Specification.id === 7)
        );
        
        console.log(`✅ Filtered to ${seats.length} seat configurations by specification ID`);
        
        // Add to our collection, tracking by ID
        seats.forEach(item => {
          if (!seatsMap.has(item.id)) {
            seatsMap.set(item.id, item);
            console.log(`🪑 Found seat configuration: ${item.name} (ID: ${item.id})`);
          }
        });
      }
    } catch (directError) {
      console.error('⚠️ Direct specification list approach failed for seats:', directError);
    }
    
    // If the direct approach didn't find enough seats, try alternative approaches
    if (seatsMap.size < 5) {
      console.log('⚠️ Specification ID approach didn\'t find enough seats, trying alternative approaches');
      
      // First approach: direct endpoint with by-specification
      try {
        const response = await api.get('specificationvalue/list/seats', {
          params: {
            limit: 100,
            page: 1,
            sortBy: 'id',
            order: 'ASC'
          }
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          console.log(`✅ Direct endpoint found ${response.data.data.length} seat specifications`);
          
          // Add to our collection, tracking by ID
          response.data.data.forEach(item => {
            if (!seatsMap.has(item.id)) {
              seatsMap.set(item.id, item);
              console.log(`🪑 Found seat configuration: ${item.name} (ID: ${item.id})`);
            }
          });
        }
      } catch (directError) {
        console.error('⚠️ Direct endpoint approach failed for seats:', directError);
      }
      
      // Second approach: query multiple pages of car data to extract seat specifications
      if (seatsMap.size < 5) {
        try {
          console.log('🚗 Trying car data approach with multiple pages for seats');
          
          // Fetch multiple pages of car data to increase chances of finding all seat types
          for (let page = 1; page <= 3; page++) {
            const carResponse = await api.get('/car/list', {
              params: {
                limit: 100,
                page: page,
                // Try different sort orders to get a variety of cars
                sortBy: page % 2 === 0 ? 'createdAt' : 'updatedAt',
                order: page % 2 === 0 ? 'DESC' : 'ASC'
              }
            });
            
            if (carResponse.data && Array.isArray(carResponse.data.data)) {
              console.log(`✅ Car endpoint page ${page} returned ${carResponse.data.data.length} cars for seats data`);
              
              // Extract seats from car data
              carResponse.data.data.forEach(car => {
                if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                  car.SpecificationValues.forEach(specValue => {
                    // Check for seats in both uppercase and lowercase properties
                    const hasUppercaseSeats = specValue.Specification && 
                      (specValue.Specification.key === 'seats' || specValue.Specification.id === 7);
                    const hasLowercaseSeats = specValue.specification && 
                      (specValue.specification.key === 'seats' || specValue.specification.id === 7);
                    
                    if (hasUppercaseSeats || hasLowercaseSeats) {
                      if (!seatsMap.has(specValue.id)) {
                        seatsMap.set(specValue.id, specValue);
                        console.log(`💺 Found seats in car data: ${specValue.name} (ID: ${specValue.id})`);
                      }
                    }
                  });
                }
              });
              
              // If we already have a good number of seat specifications, we can stop
              if (seatsMap.size >= 8) {
                console.log('🎯 Found plenty of seat specifications, stopping car data search');
                break;
              }
            }
            
            // If no more data or pagination info indicates we're at the end, break
            if (!carResponse.data || !carResponse.data.data || carResponse.data.data.length === 0) {
              break;
            }
          }
        } catch (carError) {
          console.error('⚠️ Car data approach failed for seats:', carError);
        }
      }
    }
    
    // If we still don't have enough seat specifications, check for missing known ones
    if (seatsMap.size < 8) {
      console.log(`⚠️ Only found ${seatsMap.size} seat specifications, checking for missing known types`);
      
      // List of commonly expected seat configurations
      const expectedSeats = [
        { id: 59, name: "3-Seater", key: "seats" },
        { id: 60, name: "2-Seater", key: "seats" },
        { id: 61, name: "4-Seater", key: "seats" },
        { id: 62, name: "5-Seater", key: "seats" },
        { id: 63, name: "6-Seater", key: "seats" },
        { id: 64, name: "7-Seater", key: "seats" },
        { id: 65, name: "8-Seater", key: "seats" },
        { id: 66, name: "9-Seater", key: "seats" },
        { id: 67, name: "12-Seater", key: "seats" }
      ];
      
      // Check for missing types
      const currentNames = new Set([...seatsMap.values()].map(item => item.name));
      
      expectedSeats.forEach(type => {
        if (!currentNames.has(type.name)) {
          console.log(`❓ Checking if '${type.name}' exists in the API results...`);
          
          // Look through what we have to see if same ID with different name
          const foundById = seatsMap.get(type.id);
          if (foundById) {
            console.log(`⚠️ Found seat with ID ${type.id} but with name '${foundById.name}' instead of '${type.name}'`);
          } else {
            console.log(`❓ Seat '${type.name}' with ID ${type.id} not found in API results`);
          }
        }
      });
    }
    
    // Convert map to array for final result
    allSeats = Array.from(seatsMap.values());
    
    if (allSeats.length > 0) {
      console.log(`🎯 Successfully collected ${allSeats.length} seat specifications using multiple approaches`);
      console.log('📋 All seats:', allSeats.map(item => item.name).join(', '));
      
      return {
        success: true,
        data: allSeats,
        pagination: { totalItems: allSeats.length }
      };
    } else {
      console.error('❌ All approaches failed to find seat specifications');
      return {
        success: false,
        data: [],
        error: 'Failed to find any seat specifications'
      };
    }
  } catch (error) {
    console.error('❌ Direct seats fetch failed:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch seat specifications'
    };
  }
};

// Direct function to fetch doors specifications - using the same specification ID approach
export const fetchDoorsData = async () => {
  try {
    console.log('🚪 Making direct axios call to fetch doors using specification ID approach');
    
    // Try to get all specification values and filter by specification ID 8 (doors)
    let allDoors = [];
    let doorsMap = new Map(); // Use a map to track unique items by ID
    
    try {
      // Direct approach: Get all specification values and filter by specification.id = 8
      const response = await api.get('/specificationvalue/list', {
        params: {
          limit: 100,
          page: 1,
          lang: 'en'
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`✅ Received ${response.data.data.length} total specification values`);
        
        // Filter to only keep doors (specification.id = 8)
        const doors = response.data.data.filter(item => 
          (item.specification && item.specification.id === 8) || 
          (item.Specification && item.Specification.id === 8)
        );
        
        console.log(`✅ Filtered to ${doors.length} door options by specification ID`);
        
        // Add to our collection, tracking by ID
        doors.forEach(item => {
          if (!doorsMap.has(item.id)) {
            doorsMap.set(item.id, item);
            console.log(`🚪 Found door option: ${item.name} (ID: ${item.id})`);
          }
        });
      }
    } catch (directError) {
      console.error('⚠️ Direct specification list approach failed for doors:', directError);
    }
    
    // If the direct approach didn't find enough doors, try alternative approaches
    if (doorsMap.size < 3) {
      console.log('⚠️ Specification ID approach didn\'t find enough doors, trying alternative approaches');
      
      // First approach: direct endpoint with by-specification
      try {
        const response = await api.get('specificationvalue/list/doors', {
          params: {
            limit: 1000,
            page: 1,
            sortBy: 'id',
            order: 'ASC'
          }
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          console.log(`✅ Direct endpoint found ${response.data.data.length} door options`);
          
          // Add to our collection, tracking by ID
          response.data.data.forEach(item => {
            if (!doorsMap.has(item.id)) {
              doorsMap.set(item.id, item);
              console.log(`🚪 Found door option: ${item.name} (ID: ${item.id})`);
            }
          });
        }
      } catch (directError) {
        console.error('⚠️ Direct endpoint approach failed for doors:', directError);
      }
      
      // Second approach: query multiple pages of car data to extract door options
      if (doorsMap.size < 3) {
        try {
          console.log('🚗 Trying car data approach with multiple pages for doors');
          
          // Fetch multiple pages of car data to increase chances of finding all door options
          for (let page = 1; page <= 3; page++) {
            const carResponse = await api.get('/car/list', {
              params: {
                limit: 100,
                page: page,
                // Try different sort orders to get a variety of cars
                sortBy: page % 2 === 0 ? 'createdAt' : 'updatedAt',
                order: page % 2 === 0 ? 'DESC' : 'ASC'
              }
            });
            
            if (carResponse.data && Array.isArray(carResponse.data.data)) {
              console.log(`✅ Car endpoint page ${page} returned ${carResponse.data.data.length} cars for doors data`);
              
              // Extract doors from car data
              carResponse.data.data.forEach(car => {
                if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                  car.SpecificationValues.forEach(specValue => {
                    // Check for doors in both uppercase and lowercase properties
                    const hasUppercaseDoors = specValue.Specification && 
                      (specValue.Specification.key === 'doors' || specValue.Specification.id === 8);
                    const hasLowercaseDoors = specValue.specification && 
                      (specValue.specification.key === 'doors' || specValue.specification.id === 8);
                    
                    if (hasUppercaseDoors || hasLowercaseDoors) {
                      if (!doorsMap.has(specValue.id)) {
                        doorsMap.set(specValue.id, specValue);
                        console.log(`🚪 Found doors in car data: ${specValue.name} (ID: ${specValue.id})`);
                      }
                    }
                  });
                }
              });
              
              // If we already have a good number of door options, we can stop
              if (doorsMap.size >= 6) {
                console.log('🎯 Found plenty of door options, stopping car data search');
                break;
              }
            }
            
            // If no more data or pagination info indicates we're at the end, break
            if (!carResponse.data || !carResponse.data.data || carResponse.data.data.length === 0) {
              break;
            }
          }
        } catch (carError) {
          console.error('⚠️ Car data approach failed for doors:', carError);
        }
      }
    }
    
    // If we still don't have enough door options, check for missing known ones
    if (doorsMap.size < 6) {
      console.log(`⚠️ Only found ${doorsMap.size} door options, checking for missing known types`);
      
      // List of commonly expected door options
      const expectedDoors = [
        { id: 68, name: "2 Doors", key: "doors" },
        { id: 69, name: "4 Doors", key: "doors" },
        { id: 70, name: "3 Doors", key: "doors" },
        { id: 71, name: "5 Doors", key: "doors" }
      ];
      
      // Check for missing types
      const currentNames = new Set([...doorsMap.values()].map(item => item.name));
      
      expectedDoors.forEach(type => {
        if (!currentNames.has(type.name)) {
          console.log(`❓ Checking if '${type.name}' exists in the API results...`);
          
          // Look through what we have to see if same ID with different name
          const foundById = doorsMap.get(type.id);
          if (foundById) {
            console.log(`⚠️ Found door option with ID ${type.id} but with name '${foundById.name}' instead of '${type.name}'`);
          } else {
            console.log(`❓ Door option '${type.name}' with ID ${type.id} not found in API results`);
          }
        }
      });
    }
    
    // Convert map to array for final result
    allDoors = Array.from(doorsMap.values());
    
    if (allDoors.length > 0) {
      console.log(`🎯 Successfully collected ${allDoors.length} door options using multiple approaches`);
      console.log('📋 All doors:', allDoors.map(item => item.name).join(', '));
      
    return {
      success: true,
        data: allDoors,
        pagination: { totalItems: allDoors.length }
      };
    } else {
      console.error('❌ All approaches failed to find door options');
      return {
        success: false,
        data: [],
        error: 'Failed to find any door options'
      };
    }
  } catch (error) {
    console.error('❌ Direct doors fetch failed:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch door options'
    };
  }
};

// Direct function to fetch fuel type specifications - using the same specification ID approach
export const fetchFuelTypeData = async () => {
  try {
    console.log('⛽ Making direct axios call to fetch fuel types using specification ID approach');
    
    // Try to get all specification values and filter by specification ID 9 (fuel_type)
    let allFuelTypes = [];
    let fuelTypeMap = new Map(); // Use a map to track unique items by ID
    
    try {
      // Direct approach: Get all specification values and filter by specification.id = 9
      const response = await api.get('/specificationvalue/list', {
        params: {
          limit: 10,
          page: 1,
          lang: 'en'
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`✅ Received ${response.data.data.length} total specification values`);
        
        // Filter to only keep fuel types (specification.id = 9)
        const fuelTypes = response.data.data.filter(item => 
          (item.specification && item.specification.id === 9) || 
          (item.Specification && item.Specification.id === 9)
        );
        
        console.log(`✅ Filtered to ${fuelTypes.length} fuel types by specification ID`);
        
        // Add to our collection, tracking by ID
        fuelTypes.forEach(item => {
          if (!fuelTypeMap.has(item.id)) {
            fuelTypeMap.set(item.id, item);
            console.log(`⛽ Found fuel type: ${item.name} (ID: ${item.id})`);
          }
        });
      }
    } catch (directError) {
      console.error('⚠️ Direct specification list approach failed for fuel types:', directError);
    }
    
    // If the direct approach didn't find enough fuel types, try alternative approaches
    if (fuelTypeMap.size < 3) {
      console.log('⚠️ Specification ID approach didn\'t find enough fuel types, trying alternative approaches');
      
      // First approach: direct endpoint with by-specification
      try {
        const response = await api.get('specificationvalue/list/fuel_type', {
          params: {
            limit: 10,
            page: 1,
            sortBy: 'id',
            order: 'ASC'
          }
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          console.log(`✅ Direct endpoint found ${response.data.data.length} fuel types`);
          
          // Add to our collection, tracking by ID
          response.data.data.forEach(item => {
            if (!fuelTypeMap.has(item.id)) {
              fuelTypeMap.set(item.id, item);
              console.log(`⛽ Found fuel type: ${item.name} (ID: ${item.id})`);
            }
          });
        }
      } catch (directError) {
        console.error('⚠️ Direct endpoint approach failed for fuel types:', directError);
      }
      
      // Second approach: query multiple pages of car data to extract fuel types
      if (fuelTypeMap.size < 3) {
        try {
          console.log('🚗 Trying car data approach with multiple pages for fuel types');
          
          // Fetch multiple pages of car data to increase chances of finding all fuel types
          for (let page = 1; page <= 3; page++) {
            const carResponse = await api.get('/car/list', {
              params: {
                limit: 100,
                page: page,
                // Try different sort orders to get a variety of cars
                sortBy: page % 2 === 0 ? 'createdAt' : 'updatedAt',
                order: page % 2 === 0 ? 'DESC' : 'ASC'
              }
            });
            
            if (carResponse.data && Array.isArray(carResponse.data.data)) {
              console.log(`✅ Car endpoint page ${page} returned ${carResponse.data.data.length} cars for fuel type data`);
              
              // Extract fuel types from car data
              carResponse.data.data.forEach(car => {
                if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                  car.SpecificationValues.forEach(specValue => {
                    // Check for fuel types in both uppercase and lowercase properties
                    const hasUppercaseFuelType = specValue.Specification && 
                      (specValue.Specification.key === 'fuel_type' || specValue.Specification.id === 9);
                    const hasLowercaseFuelType = specValue.specification && 
                      (specValue.specification.key === 'fuel_type' || specValue.specification.id === 9);
                    
                    if (hasUppercaseFuelType || hasLowercaseFuelType) {
                      if (!fuelTypeMap.has(specValue.id)) {
                        fuelTypeMap.set(specValue.id, specValue);
                        console.log(`⛽ Found fuel type in car data: ${specValue.name} (ID: ${specValue.id})`);
                      }
                    }
                  });
                }
              });
              
              // If we already have a good number of fuel types, we can stop
              if (fuelTypeMap.size >= 5) {
                console.log('🎯 Found plenty of fuel types, stopping car data search');
                break;
              }
            }
            
            // If no more data or pagination info indicates we're at the end, break
            if (!carResponse.data || !carResponse.data.data || carResponse.data.data.length === 0) {
              break;
            }
          }
        } catch (carError) {
          console.error('⚠️ Car data approach failed for fuel types:', carError);
        }
      }
    }
    
    // If we still don't have enough fuel types, check for missing known ones
    if (fuelTypeMap.size < 5) {
      console.log(`⚠️ Only found ${fuelTypeMap.size} fuel types, checking for missing known types`);
      
      // List of commonly expected fuel types
      const expectedFuelTypes = [
        { id: 74, name: "Petrol", key: "fuel_type" },
        { id: 75, name: "Diesel", key: "fuel_type" },
        { id: 76, name: "Hybrid", key: "fuel_type" },
        { id: 77, name: "Electric", key: "fuel_type" },
        { id: 78, name: "LPG", key: "fuel_type" }
      ];
      
      // Check for missing types
      const currentNames = new Set([...fuelTypeMap.values()].map(item => item.name));
      
      expectedFuelTypes.forEach(type => {
        if (!currentNames.has(type.name)) {
          console.log(`❓ Checking if '${type.name}' exists in the API results...`);
          
          // Look through what we have to see if same ID with different name
          const foundById = fuelTypeMap.get(type.id);
          if (foundById) {
            console.log(`⚠️ Found fuel type with ID ${type.id} but with name '${foundById.name}' instead of '${type.name}'`);
          } else {
            console.log(`❓ Fuel type '${type.name}' with ID ${type.id} not found in API results`);
          }
        }
      });
    }
    
    // Convert map to array for final result
    allFuelTypes = Array.from(fuelTypeMap.values());
    
    if (allFuelTypes.length > 0) {
      console.log(`🎯 Successfully collected ${allFuelTypes.length} fuel types using multiple approaches`);
      console.log('📋 All fuel types:', allFuelTypes.map(item => item.name).join(', '));
      
      return {
        success: true,
        data: allFuelTypes,
        pagination: { totalItems: allFuelTypes.length }
      };
    } else {
      console.error('❌ All approaches failed to find fuel types');
      return {
        success: false,
        data: [],
        error: 'Failed to find any fuel types'
      };
    }
  } catch (error) {
    console.error('❌ Direct fuel type fetch failed:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch fuel types'
    };
  }
};

// Direct function to fetch cylinder specifications - using the same specification ID approach
export const fetchCylindersData = async () => {
  try {
    console.log('🔧 Making direct axios call to fetch cylinders using specification ID approach');
    
    // Try to get all specification values and filter by specification ID 10 (cylinders)
    let allCylinders = [];
    let cylindersMap = new Map(); // Use a map to track unique items by ID
    
    try {
      // Direct approach: Get all specification values and filter by specification.id = 10
      const response = await api.get('/specificationvalue/list', {
        params: {
          limit: 1000,
          page: 1,
          lang: 'en'
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`✅ Received ${response.data.data.length} total specification values`);
        
        // Filter to only keep cylinders (specification.id = 10)
        const cylinders = response.data.data.filter(item => 
          (item.specification && item.specification.id === 10) || 
          (item.Specification && item.Specification.id === 10)
        );
        
        console.log(`✅ Filtered to ${cylinders.length} cylinder options by specification ID`);
        
        // Add to our collection, tracking by ID
        cylinders.forEach(item => {
          if (!cylindersMap.has(item.id)) {
            cylindersMap.set(item.id, item);
            console.log(`🔧 Found cylinder option: ${item.name} (ID: ${item.id})`);
          }
        });
      }
    } catch (directError) {
      console.error('⚠️ Direct specification list approach failed for cylinders:', directError);
    }
    
    // If the direct approach didn't find enough cylinders, try alternative approaches
    if (cylindersMap.size < 3) {
      console.log('⚠️ Specification ID approach didn\'t find enough cylinders, trying alternative approaches');
      
      // First approach: direct endpoint with by-specification
      try {
        const response = await api.get('specificationvalue/list/cylinders', {
          params: {
            limit: 100,
            page: 1,
            sortBy: 'id',
            order: 'ASC'
          }
        });
        
        if (response.data && Array.isArray(response.data.data)) {
          console.log(`✅ Direct endpoint found ${response.data.data.length} cylinder options`);
          
          // Add to our collection, tracking by ID
          response.data.data.forEach(item => {
            if (!cylindersMap.has(item.id)) {
              cylindersMap.set(item.id, item);
              console.log(`🔧 Found cylinder option: ${item.name} (ID: ${item.id})`);
            }
          });
        }
      } catch (directError) {
        console.error('⚠️ Direct endpoint approach failed for cylinders:', directError);
      }
      
      // Second approach: query multiple pages of car data to extract cylinder options
      if (cylindersMap.size < 3) {
        try {
          console.log('🚗 Trying car data approach with multiple pages for cylinders');
          
          // Fetch multiple pages of car data to increase chances of finding all cylinder options
          for (let page = 1; page <= 3; page++) {
            const carResponse = await api.get('/car/list', {
              params: {
                limit: 100,
                page: page,
                // Try different sort orders to get a variety of cars
                sortBy: page % 2 === 0 ? 'createdAt' : 'updatedAt',
                order: page % 2 === 0 ? 'DESC' : 'ASC'
              }
            });
            
            if (carResponse.data && Array.isArray(carResponse.data.data)) {
              console.log(`✅ Car endpoint page ${page} returned ${carResponse.data.data.length} cars for cylinders data`);
              
              // Extract cylinders from car data
              carResponse.data.data.forEach(car => {
                if (car.SpecificationValues && Array.isArray(car.SpecificationValues)) {
                  car.SpecificationValues.forEach(specValue => {
                    // Check for cylinders in both uppercase and lowercase properties
                    const hasUppercaseCylinders = specValue.Specification && 
                      (specValue.Specification.key === 'cylinders' || specValue.Specification.id === 10);
                    const hasLowercaseCylinders = specValue.specification && 
                      (specValue.specification.key === 'cylinders' || specValue.specification.id === 10);
                    
                    if (hasUppercaseCylinders || hasLowercaseCylinders) {
                      if (!cylindersMap.has(specValue.id)) {
                        cylindersMap.set(specValue.id, specValue);
                        console.log(`🔧 Found cylinder in car data: ${specValue.name} (ID: ${specValue.id})`);
                      }
                    }
                  });
                }
              });
              
              // If we already have a good number of cylinder options, we can stop
              if (cylindersMap.size >= 6) {
                console.log('🎯 Found plenty of cylinder options, stopping car data search');
                break;
              }
            }
            
            // If no more data or pagination info indicates we're at the end, break
            if (!carResponse.data || !carResponse.data.data || carResponse.data.data.length === 0) {
              break;
            }
          }
        } catch (carError) {
          console.error('⚠️ Car data approach failed for cylinders:', carError);
        }
      }
    }
    
    // If we still don't have enough cylinder options, check for missing known ones
    if (cylindersMap.size < 6) {
      console.log(`⚠️ Only found ${cylindersMap.size} cylinder options, checking for missing known types`);
      
      // List of commonly expected cylinder options
      const expectedCylinders = [
        { id: 79, name: "3 Cylinders", key: "cylinders" },
        { id: 80, name: "4 Cylinders", key: "cylinders" },
        { id: 81, name: "6 Cylinders", key: "cylinders" },
        { id: 82, name: "8 Cylinders", key: "cylinders" },
        { id: 83, name: "12 Cylinders", key: "cylinders" },
        { id: 89, name: "None - Electric", key: "cylinders" }
      ];
      
      // Check for missing types
      const currentNames = new Set([...cylindersMap.values()].map(item => item.name));
      
      expectedCylinders.forEach(type => {
        if (!currentNames.has(type.name)) {
          console.log(`❓ Checking if '${type.name}' exists in the API results...`);
          
          // Look through what we have to see if same ID with different name
          const foundById = cylindersMap.get(type.id);
          if (foundById) {
            console.log(`⚠️ Found cylinder option with ID ${type.id} but with name '${foundById.name}' instead of '${type.name}'`);
          } else {
            console.log(`❓ Cylinder option '${type.name}' with ID ${type.id} not found in API results`);
          }
        }
      });
    }
    
    // Convert map to array for final result
    allCylinders = Array.from(cylindersMap.values());
    
    if (allCylinders.length > 0) {
      console.log(`🎯 Successfully collected ${allCylinders.length} cylinder options using multiple approaches`);
      console.log('📋 All cylinders:', allCylinders.map(item => item.name).join(', '));
      
      return {
        success: true,
        data: allCylinders,
        pagination: { totalItems: allCylinders.length }
      };
    } else {
      console.error('❌ All approaches failed to find cylinder options');
      return {
        success: false,
        data: [],
        error: 'Failed to find any cylinder options'
      };
    }
  } catch (error) {
    console.error('❌ Direct cylinders fetch failed:', error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch cylinder options'
    };
  }
};

// Fetch specification values by specification ID
export const fetchSpecificationValuesBySpecId = async (specId, params = {}) => {
  try {
    console.log(`📋 Fetching specification values for specification ID: ${specId}`);
    
    // Ensure we include required parameters
    const updatedParams = {
      ...params,
      page: params.page || 1,
      limit: params.limit || 1000,
      lang: params.lang || 'en'
    };
    
    // Use the direct specification values list endpoint
    const response = await api.get('/specificationvalue/list', { params: updatedParams });
    
    if (response.data && Array.isArray(response.data.data)) {
      console.log(`✅ Received ${response.data.data.length} total specification values`);
      
      // Filter by the specification ID we're looking for
      const filteredValues = response.data.data.filter(item => 
        (item.specification && item.specification.id === specId) || 
        (item.Specification && item.Specification.id === specId)
      );
      
      console.log(`✅ Filtered to ${filteredValues.length} values for specification ID ${specId}`);
      
      if (filteredValues.length > 0) {
        console.log(`📊 First few values: ${filteredValues.slice(0, 3).map(v => v.name).join(', ')}...`);
      }
      
      return {
        success: true,
        data: filteredValues,
        pagination: response.data.pagination
      };
    }
    
    return {
      success: false,
      data: [],
      error: 'No specification values found'
    };
  } catch (error) {
    console.error(`Error fetching specification values for ID ${specId}:`, error);
    return {
      success: false,
      data: [],
      error: error.message || 'Failed to fetch specification values'
    };
  }
};

export default {
  fetchBrands,
  fetchCarModels,
  fetchTrims,
  fetchYears,
  fetchSpecifications,
  fetchSpecificationValues,
  fetchAllSpecificationValues,
  fetchBodyTypes,
  fetchSeatsData,
  fetchDoorsData,
  fetchFuelTypeData,
  fetchCylindersData,
  fetchSpecificationValuesBySpecId,
  api
}; 