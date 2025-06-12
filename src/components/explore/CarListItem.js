import React, {Fragment} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
} from '../../utils/constants';
import {CarImageCarousel} from '../../components/common';
import {Ionicons, MaterialCommunityIcons, AntDesign} from 'src/utils/icon';
import {useWishlist} from '../../context/WishlistContext';

const CarListItem = ({
  car,
  item,
  onPress,
  searchQuery = '',
  filteredBySearch = false,
  onToggleFavorite,
  onShare,
}) => {
  const {isInWishlist} = useWishlist();
  const isFavorite = isInWishlist(car.id);

  // Use either car or item prop (for compatibility)
  const carData = car || item;

  // Safety check - return null if no valid car data
  if (!carData || !carData.id) {
    console.warn('CarListItem received invalid car data');
    return null;
  }

  // Check if this is a mock car
  const isMockCar = String(carData.id).includes('mock-');

  // Extract values from the car object
  const brand = carData.Brand?.name || carData.brand || '';
  const model = carData.CarModel?.name || carData.model || '';
  const trim = carData.Trim?.name || carData.trim || '';
  const year = carData.Year?.year || carData.year || '';
  const transmission = carData.transmission || 'N/A';
  const fuelType = carData.fuelType || 'N/A';
  const bodyType = carData.type || 'N/A';
  const regionalSpec = carData.regionalSpec || '';
  const steeringSide = carData.steeringSide || '';

  // Use the images array directly from the processed car
  const carImages = carData.images || [carData.image] || [
      require('../../components/home/car_Image.jpg'),
    ];

  // Check if we need to highlight parts of text due to search
  const highlightText = (text, type) => {
    if (!filteredBySearch || !text || !searchQuery) {
      return (
        <Text
          style={
            type === 'title'
              ? styles.carTitle
              : type === 'subtitle'
              ? styles.carSubtitle
              : styles.specText
          }>
          {text}
        </Text>
      );
    }

    const query = searchQuery.toLowerCase();

    // No highlighting if query not in text
    if (!text.toLowerCase().includes(query)) {
      // Try with special characters removed for more flexible matching
      const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
      const cleanText = text.toLowerCase().replace(/[^\w\s]/gi, '');

      // If no match even with clean versions, return the original text
      if (!cleanText.includes(cleanQuery)) {
        return (
          <Text
            style={
              type === 'title'
                ? styles.carTitle
                : type === 'subtitle'
                ? styles.carSubtitle
                : styles.specText
            }>
            {text}
          </Text>
        );
      }

      // If we match with clean version but not original, highlight based on positions
      try {
        const startIndex = cleanText.indexOf(cleanQuery);
        const endIndex = startIndex + cleanQuery.length;

        return (
          <Text
            style={
              type === 'title'
                ? styles.carTitle
                : type === 'subtitle'
                ? styles.carSubtitle
                : styles.specText
            }>
            {text.substring(0, startIndex)}
            <Text style={styles.highlightedText}>
              {text.substring(startIndex, endIndex)}
            </Text>
            {text.substring(endIndex)}
          </Text>
        );
      } catch (e) {
        return (
          <Text
            style={
              type === 'title'
                ? styles.carTitle
                : type === 'subtitle'
                ? styles.carSubtitle
                : styles.specText
            }>
            {text}
          </Text>
        );
      }
    }

    // Standard highlighting for direct matches
    try {
      const parts = text.split(new RegExp(`(${query})`, 'gi'));

      return (
        <Text
          style={
            type === 'title'
              ? styles.carTitle
              : type === 'subtitle'
              ? styles.carSubtitle
              : styles.specText
          }>
          {parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <Text key={index} style={styles.highlightedText}>
                {part}
              </Text>
            ) : (
              <Fragment key={index}>{part}</Fragment>
            ),
          )}
        </Text>
      );
    } catch (e) {
      return (
        <Text
          style={
            type === 'title'
              ? styles.carTitle
              : type === 'subtitle'
              ? styles.carSubtitle
              : styles.specText
          }>
          {text}
        </Text>
      );
    }
  };

  // Create a safe onPress handler
  const handlePress = () => {
    if (onPress) {
      onPress(carData);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.carCard,
        (carData.inWishlist || isFavorite) && styles.favoriteHighlight,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <CarImageCarousel
          images={carImages}
          style={styles.carImage}
          height={180}
          onImagePress={handlePress}
        />
        {bodyType && (
          <View style={styles.carTypeContainer}>
            <Text style={styles.carTypeText}>{bodyType}</Text>
          </View>
        )}
      </View>

      {/* {carData.stockId && (
        <View style={styles.stockIdContainer}>
          <Text style={styles.stockIdText}>{carData.stockId}</Text>
        </View>
      )} */}

      {isMockCar && (
        <View
          style={[
            styles.stockIdContainer,
            {backgroundColor: 'rgba(255, 0, 0, 0.6)'},
          ]}>
          <Text style={styles.stockIdText}>MOCK DATA</Text>
        </View>
      )}

      <View style={styles.carDetails}>
        {filteredBySearch ? (
          highlightText(`${year} ${brand} ${model}`, 'title')
        ) : (
          <Text style={styles.carTitle}>
            {year} {brand} {model}
          </Text>
        )}

        {filteredBySearch ? (
          highlightText(
            `${trim ? `${trim} - ` : ''}${carData.color || 'N/A'}`,
            'subtitle',
          )
        ) : (
          <Text style={styles.carSubtitle}>
            {trim ? `${trim} - ` : ''}
            {carData.color || 'N/A'}
          </Text>
        )}

        <View style={styles.specRow}>
          {carData.engineSize && (
            <View style={styles.specItem}>
              <Text style={styles.specIcon}>🔧</Text>
              <Text style={styles.specText}>{carData.engineSize}L</Text>
            </View>
          )}
          <View style={styles.specItem}>
            <Text style={styles.specIcon}>⚡</Text>
            <Text style={styles.specText}>{fuelType}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specIcon}>🔄</Text>
            <Text style={styles.specText}>{transmission}</Text>
          </View>
        </View>

        <View style={styles.specRow}>
          {regionalSpec && (
            <View style={styles.originBadge}>
              <Text style={styles.originText}>{regionalSpec}</Text>
            </View>
          )}
          {steeringSide && (
            <View style={styles.steeringBadge}>
              <Text style={styles.steeringText}>{steeringSide}</Text>
            </View>
          )}
        </View>

        <Text style={styles.carPrice}>
          {carData.price
            ? `AED ${carData.price.toLocaleString()}`
            : 'Price on Request'}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.priceText}>
          {carData.price
            ? `AED ${carData.price.toLocaleString()}`
            : 'Price on Request'}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onToggleFavorite(carData.id)}>
            <AntDesign
              name={isFavorite ? 'heart' : 'hearto'}
              size={22}
              color={isFavorite ? COLORS.error : COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onShare(carData)}>
            <Ionicons
              name="share-social-outline"
              size={22}
              color={COLORS.textMedium}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  carCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  favoriteHighlight: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  carTypeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 140, 0, 0.8)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  carTypeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  stockIdContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stockIdText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  carDetails: {
    padding: SPACING.md,
  },
  carTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  carSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  specIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: 4,
  },
  specText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
  },
  carPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: SPACING.sm,
  },
  originBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginRight: SPACING.sm,
  },
  originText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  steeringBadge: {
    backgroundColor: 'rgba(120, 180, 220, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  steeringText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  highlightedText: {
    backgroundColor: 'rgba(237, 135, 33, 0.2)',
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: SPACING.sm,
    padding: 4,
  },
});

export default CarListItem;
