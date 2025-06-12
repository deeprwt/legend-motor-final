import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {COLORS, SPACING, FONT_SIZES, BORDER_RADIUS} from '../utils/constants';
import {useNavigation} from '@react-navigation/native';
import {API_KEY} from '../utils/apiConfig';
import axios from 'axios';
import {CarImage} from '../components/common';
import Svg, {Path} from 'react-native-svg';
import {useTheme} from 'src/context/ThemeContext';
import {useCurrencyLanguage} from '../context/CurrencyLanguageContext';
import api from 'src/services/api';

// Placeholder logo text examples for brands without logos
const LOGO_PLACEHOLDERS = {
  BYD: {text: 'BYD', color: '#333333'},
  CHANGAN: {text: 'CHANGAN', color: '#0055A5'},
  CHERY: {text: 'CHERY', color: '#E60012'},
};

// Back Arrow Icon
const BackIcon = ({isDark}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={isDark ? '#FFFFFF' : '#212121'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AllBrandsScreen = ({navigation}) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const {isDark} = useTheme();
  const {t} = useCurrencyLanguage();

  useEffect(() => {
    fetchAllBrands();
  }, []);

  // Extract logo path helper
  const extractLogoPath = useCallback(logoData => {
    // If it's already a string, use it directly
    if (typeof logoData === 'string') {
      return logoData;
    }

    // If it's an object with FileSystem structure
    if (logoData && logoData.FileSystem) {
      const fileSystem = logoData.FileSystem;
      return (
        fileSystem.thumbnailPath || fileSystem.compressedPath || fileSystem.path
      );
    }

    // If it's an object with a path property
    if (logoData && logoData.path) {
      return logoData.path;
    }

    // Last resort, try to get the name and create a standard path
    if (logoData && logoData.name) {
      return `/brand-logos/${logoData.name}.png`;
    }

    return null;
  }, []);

  const fetchAllBrands = async () => {
    try {
      setLoading(true);

      // Use the direct API endpoint to get brand list with logos
      const response = await api.get('brand/list', {
        params: {
          page: 1,
          limit: 500, // Get a larger limit to ensure we get all brands
          sortBy: 'name',
          order: 'asc',
        },
      });

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        // Process brand data to ensure we have logo information
        const processedBrands = response.data.data.map(brand => ({
          id: brand.id,
          name: brand.name || '',
          slug: brand.slug || '',
          // Normalize logo path to work with the CDN
          logo: brand.logo ? extractLogoPath(brand.logo) : null,
        }));

        // Sort brands alphabetically
        const sortedBrands = [...processedBrands].sort((a, b) =>
          (a.name || '').localeCompare(b.name || ''),
        );

        console.log(`Found ${sortedBrands.length} unique brands`);
        setBrands(sortedBrands);
      } else {
        console.log('No brands found, using fallback data');
        // If API returns no data, use fallback data
        setBrands([
          {id: 1, name: 'BYD', slug: 'byd', logo: 'brand-logos/BYD.png'},
          {
            id: 2,
            name: 'CHANGAN',
            slug: 'changan',
            logo: 'brand-logos/CHANGAN.png',
          },
          {id: 3, name: 'CHERY', slug: 'chery', logo: 'brand-logos/CHERY.png'},
          {
            id: 4,
            name: 'TOYOTA',
            slug: 'toyota',
            logo: 'brand-logos/TOYOTA.png',
          },
          {id: 5, name: 'HONDA', slug: 'honda', logo: 'brand-logos/HONDA.png'},
          {
            id: 6,
            name: 'MERCEDES',
            slug: 'mercedes',
            logo: 'brand-logos/MERCEDES.png',
          },
          {id: 7, name: 'BMW', slug: 'bmw', logo: 'brand-logos/BMW.png'},
          {id: 8, name: 'AUDI', slug: 'audi', logo: 'brand-logos/AUDI.png'},
          {id: 9, name: 'FORD', slug: 'ford', logo: 'brand-logos/FORD.png'},
        ]);
      }
    } catch (err) {
      console.error('Error fetching all brands:', err);
      // Use fallback data on error
      setBrands([
        {id: 1, name: 'BYD', slug: 'byd', logo: 'brand-logos/BYD.png'},
        {
          id: 2,
          name: 'CHANGAN',
          slug: 'changan',
          logo: 'brand-logos/CHANGAN.png',
        },
        {id: 3, name: 'CHERY', slug: 'chery', logo: 'brand-logos/CHERY.png'},
        {id: 4, name: 'TOYOTA', slug: 'toyota', logo: 'brand-logos/TOYOTA.png'},
        {id: 5, name: 'HONDA', slug: 'honda', logo: 'brand-logos/HONDA.png'},
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format brand name (capitalize first letter, rest lowercase)
  const formatBrandName = name => {
    if (!name) return '';

    // Handle special cases like BMW, BYD
    if (name.length <= 3) return name.toUpperCase();

    // Special case for brands in the image
    if (LOGO_PLACEHOLDERS[name]) {
      return LOGO_PLACEHOLDERS[name].text;
    }

    // General case
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleBrandPress = brand => {
    // Navigate to ExploreScreen with filtered results by brand
    navigation.navigate('Main', {
      screen: 'ExploreTab',
      params: {
        filters: {
          brands: [brand.name],
          brandIds: [brand.id],
          specifications: {}, // Add empty specifications object to match expected filter structure
        },
      },
    });
  };

  // Update the handleImageError function
  const handleImageError = brandId => {
    setImageErrors(prev => ({
      ...prev,
      [brandId]: true,
    }));
  };

  const renderBrandItem = ({item}) => {
    const hasImageError = imageErrors[item.id];

    return (
      <TouchableOpacity
        style={styles.brandItem}
        onPress={() => handleBrandPress(item)}>
        <View style={styles.logoContainer}>
          {item.logo && !hasImageError ? (
            <CarImage
              source={{
                uri: `https://cdn.legendmotorsglobal.com/${item.logo}`,
                filename: item.logo,
                fullPath: item.logo,
              }}
              style={styles.logo}
              resizeMode="contain"
              onError={() => handleImageError(item.id)}
              loadingIndicatorSource={null}
            />
          ) : (
            <Text style={styles.brandInitial}>
              {formatBrandName(item.name).charAt(0)}
            </Text>
          )}
        </View>
        <Text
          style={[styles.brandName, {color: isDark ? '#FFFFFF' : '#333'}]}
          numberOfLines={1}>
          {formatBrandName(item.name)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackIcon isDark={isDark} />
      </TouchableOpacity>
      <Text style={[styles.title, {color: isDark ? '#FFFFFF' : '#212121'}]}>
        {t('common.allBrands')}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
        ]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text
            style={[
              styles.loadingText,
              {color: isDark ? '#FFFFFF' : COLORS.textDark},
            ]}>
            {t('common.loadingBrands')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF'},
      ]}>
      {renderHeader()}
      <FlatList
        data={brands}
        renderItem={renderBrandItem}
        keyExtractor={item => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 30,
  },
  list: {
    padding: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'start',
    marginBottom: SPACING.lg,
    marginLeft: SPACING.xl,
    paddingLeft: SPACING.lg,
  },
  brandItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  logo: {
    width: '80%',
    height: '80%',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  brandInitial: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  brandName: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
});

export default AllBrandsScreen;
