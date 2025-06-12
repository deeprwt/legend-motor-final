/**
 * Utility functions for working with car colors
 */

// Cache for color extraction to improve performance
const colorExtractionCache = new Map();

/**
 * Extract colors from a car slug
 * @param {string} slug - The car slug to extract colors from
 * @returns {Object} Object with exteriorColors and interiorColors arrays
 */
export const extractColorsFromSlug = (slug) => {
  if (!slug) return { exteriorColors: [], interiorColors: [] };
  
  // Common color list for matching
  const commonColors = [
    'white', 'black', 'red', 'blue', 'green', 'yellow', 
    'orange', 'purple', 'pink', 'brown', 'grey', 'gray',
    'silver', 'gold', 'bronze', 'beige', 'cream', 'ivory'
  ];
  
  // Normalize the slug to lowercase
  const normalizedSlug = slug.toLowerCase();
  
  const exteriorColors = [];
  const interiorColors = [];
  
  // Check for each color in the normalized slug
  commonColors.forEach(color => {
    // Exterior color patterns
    if (
      normalizedSlug.includes(`${color}-body`) || 
      normalizedSlug.includes(`${color}-exterior`) || 
      (normalizedSlug.includes(color) && 
       !normalizedSlug.includes(`${color}-interior`) && 
       !normalizedSlug.includes(`inside-${color}`) &&
       !normalizedSlug.includes(`interior-${color}`))
    ) {
      exteriorColors.push(color);
    }
    
    // Interior color patterns
    if (
      normalizedSlug.includes(`${color}-interior`) || 
      normalizedSlug.includes(`inside-${color}`) || 
      normalizedSlug.includes(`interior-${color}`)
    ) {
      interiorColors.push(color);
    }
  });
  
  return { exteriorColors, interiorColors };
};

/**
 * Create a filter function to match cars by their extracted colors
 * @param {string[]} targetColors - The colors to match against
 * @returns {Function} A filter function that takes a slug and returns true if colors match
 */
export const createColorMatchFunction = (targetColors) => {
  // Normalize colors for comparison
  const normalizedTargetColors = targetColors.map(color => color.toLowerCase().trim());
  
  return (slug) => {
    // If no target colors specified, don't filter
    if (!targetColors || targetColors.length === 0) {
      return true;
    }
    
    // Extract colors from the slug
    const { exteriorColors, interiorColors } = extractColorsFromSlug(slug);
    const allExtractedColors = [...exteriorColors, ...interiorColors];
    
    // If no colors found in the slug, don't exclude it
    // Some cars might not have color in their slug but could match in other ways
    if (allExtractedColors.length === 0) {
      return true;
    }
    
    // Check if any of the extracted colors match our target colors
    const matchFound = allExtractedColors.some(extractedColor => 
      normalizedTargetColors.includes(extractedColor.toLowerCase().trim())
    );
    
    return matchFound;
  };
};

/**
 * Get the color name from a SpecificationValue object
 * @param {Object} car - The car object
 * @returns {string|null} The color name or null if not found
 */
export const getCarColorFromSpecs = (car) => {
  if (!car || !car.SpecificationValues) return null;
  
  const colorSpec = car.SpecificationValues.find(spec => 
    (spec.Specification && spec.Specification.key === 'color') ||
    (spec.specification && spec.specification.key === 'color')
  );
  
  return colorSpec ? colorSpec.name : null;
};

// Function to extract colors from additionalInfo field
export const extractColorsFromAdditionalInfo = (additionalInfo, colorType = 'all') => {
  if (!additionalInfo) return [];
  
  const exteriorColors = [];
  const interiorColors = [];
  
  // Common color list for matching
  const commonColors = [
    'white', 'black', 'red', 'blue', 'green', 'yellow', 
    'orange', 'purple', 'pink', 'brown', 'grey', 'gray',
    'silver', 'gold', 'bronze', 'beige', 'cream', 'ivory'
  ];
  
  // Normalize the additionalInfo to lowercase
  const normalizedInfo = additionalInfo.toLowerCase();
  
  // Parse exterior colors (generally mentioned before 'inside' or with body/roof/exterior)
  const exteriorPattern = /\b(?:white|black|red|blue|green|yellow|orange|purple|pink|brown|grey|gray|silver|gold|bronze|beige|cream|ivory)\b(?:\s+(?:body|roof|exterior))?\b/gi;
  const exteriorMatches = normalizedInfo.match(exteriorPattern) || [];
  
  // Extract unique exterior colors
  exteriorMatches.forEach(match => {
    const colorText = match.toLowerCase().replace(/body|roof|exterior/i, '').trim();
    // Find the matching color from our common colors list
    const matchedColor = commonColors.find(color => colorText.includes(color));
    if (matchedColor && !exteriorColors.includes(matchedColor)) {
      exteriorColors.push(matchedColor);
    }
  });
  
  // Parse interior colors (generally after 'inside' or 'interior')
  const interiorPattern = /(?:inside|interior)\s+\b(?:white|black|red|blue|green|yellow|orange|purple|pink|brown|grey|gray|silver|gold|bronze|beige|cream|ivory)\b/gi;
  const interiorMatches = normalizedInfo.match(interiorPattern) || [];
  
  // Extract unique interior colors
  interiorMatches.forEach(match => {
    const colorText = match.replace(/inside|interior/i, '').trim().toLowerCase();
    // Find the matching color from our common colors list
    const matchedColor = commonColors.find(color => colorText.includes(color));
    if (matchedColor && !interiorColors.includes(matchedColor)) {
      interiorColors.push(matchedColor);
    }
  });
  
  // Also look for "&" pattern which often indicates combinations
  // For example "WHITE BODY & BLACK ROOF inside BLACK & RED"
  if (normalizedInfo.includes('&')) {
    commonColors.forEach(color => {
      // Check if the color appears directly in the text
      if (normalizedInfo.includes(color)) {
        // Determine if it's interior or exterior based on context
        if (normalizedInfo.includes('inside') && 
            normalizedInfo.indexOf(color) > normalizedInfo.indexOf('inside')) {
          // It's after "inside" keyword, likely interior
          if (!interiorColors.includes(color)) {
            interiorColors.push(color);
          }
        } else if (!exteriorColors.includes(color)) {
          // Otherwise assume exterior
          exteriorColors.push(color);
        }
      }
    });
  }
  
  // Return filtered results based on colorType
  if (colorType === 'exterior') {
    return exteriorColors;
  } else if (colorType === 'interior') {
    return interiorColors;
  }
  
  // Return all colors if no specific type is requested
  return [...exteriorColors, ...interiorColors];
};

// Utility to match colors in a car (combining both methods)
export const matchCarColors = (car, colorNames = [], colorType = 'all') => {
  if (!car || !colorNames || colorNames.length === 0) return false;
  
  // First try the additionalInfo field if available
  if (car.additionalInfo) {
    const colorsFromInfo = extractColorsFromAdditionalInfo(car.additionalInfo, colorType);
    // Check if any requested color is in the extracted colors
    const match = colorsFromInfo.some(extractedColor => 
      colorNames.some(requestedColor => 
        extractedColor.toLowerCase() === requestedColor.toLowerCase()
      )
    );
    if (match) return true;
  }
  
  // If additionalInfo didn't yield a match, try the slug
  if (car.slug) {
    const { exteriorColors, interiorColors } = extractColorsFromSlug(car.slug);
    let colorsToCheck = [];
    
    // Filter based on colorType
    if (colorType === 'exterior') {
      colorsToCheck = exteriorColors;
    } else if (colorType === 'interior') {
      colorsToCheck = interiorColors;
    } else {
      colorsToCheck = [...exteriorColors, ...interiorColors];
    }
    
    // Check if any requested color is in the extracted colors
    return colorsToCheck.some(extractedColor => 
      colorNames.some(requestedColor => 
        extractedColor.toLowerCase() === requestedColor.toLowerCase()
      )
    );
  }
  
  // If neither method found a match
  return false;
};

// Function to get color list from the car for display
export const getCarColorList = (car) => {
  const colors = [];
  
  // Try extracting from additionalInfo first
  if (car.additionalInfo) {
    const extractedColors = extractColorsFromAdditionalInfo(car.additionalInfo, 'all');
    colors.push(...extractedColors);
  }
  
  // If no colors found, try from slug
  if (colors.length === 0 && car.slug) {
    const { exteriorColors, interiorColors } = extractColorsFromSlug(car.slug);
    colors.push(...exteriorColors, ...interiorColors);
  }
  
  // Add specific color from car.color if available and not already in the list
  if (car.color && car.color !== 'Not specified') {
    const carColor = car.color.toLowerCase();
    if (!colors.some(c => carColor.includes(c))) {
      colors.push(carColor);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(colors)];
};

export default {
  extractColorsFromSlug,
  createColorMatchFunction,
  getCarColorFromSpecs,
  extractColorsFromAdditionalInfo,
  matchCarColors,
  getCarColorList
}; 