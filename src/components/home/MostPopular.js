import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  AntDesign,
  FontAwesome,
} from 'src/utils/icon';
import {CarImage} from '../common';

const MostPopular = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Most Popular</Text>
        <Text style={styles.subtitle}>Checkout our exclusive offers...</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.imageWrapper}>
          <CarImage
            source={require('./HotDealsCar.png')}
            style={styles.carImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.categoryContainer}>
            <MaterialCommunityIcons
              name="car-sports"
              size={20}
              color="#FF8C00"
            />
            <Text style={styles.categoryText}>SUV</Text>
          </View>

          <Text style={styles.carTitle}>
            2024 BYD SONG PLUS HONOR{'\n'}
            FLAGSHIP PLUS - BLACK inside BLUE
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="infinite" size={16} color="#8A2BE2" />
              <Text style={styles.detailText}>1tr</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="flash" size={16} color="#8A2BE2" />
              <Text style={styles.detailText}>Electric</Text>
            </View>

            <View style={styles.detailItem}>
              <AntDesign name="dashboard" size={16} color="#8A2BE2" />
              <Text style={styles.detailText}>Automatic</Text>
            </View>

            <View style={styles.detailItem}>
              <FontAwesome name="flag" size={16} color="#8A2BE2" />
              <Text style={styles.detailText}>China</Text>
            </View>
          </View>

          <View style={styles.drivingDetailItem}>
            <MaterialCommunityIcons name="steering" size={16} color="#8A2BE2" />
            <Text style={styles.detailText}>Left hand drive</Text>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login to view price</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.favoriteButton}>
              <AntDesign name="hearto" size={24} color="#FF8C00" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={24} color="#777" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'none',
    margin: 10,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cardContainer: {
    backgroundColor: 'white',
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
    color: '#FF8C00',
  },
  carTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  drivingDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  favoriteButton: {
    marginLeft: 15,
    padding: 5,
  },
  shareButton: {
    marginLeft: 15,
    padding: 5,
  },
});

export default MostPopular;
