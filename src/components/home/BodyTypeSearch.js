import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {BodyTypeIcon} from '../icons';
import {useTheme} from 'src/context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import {SPACING} from 'src/utils/constants';
import {useCurrencyLanguage} from '../../context/CurrencyLanguageContext';
import {getTranslation} from '../../translations';

const BodyTypeItem = ({icon, title, isDark, onPress}) => {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View
        style={[
          styles.imageContainer,
          {backgroundColor: isDark ? '#ffffff' : '#FFF'},
        ]}>
        {icon}
      </View>
      <Text style={[styles.itemTitle, {color: isDark ? '#FFFFFF' : '#333'}]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const BodyTypeSearch = () => {
  const {selectedLanguage} = useCurrencyLanguage();
  const {isDark} = useTheme();
  const navigation = useNavigation();

  const bodyTypes = [
    {
      id: 53,
      title: getTranslation('bodyType.hatchback', selectedLanguage),
      icon: (
        <BodyTypeIcon
          img={require('./icons-body-type/hatchback.png')}
          width={100}
          height={70}
        />
      ),
    },
    {
      id: 49,
      title: getTranslation('bodyType.sedan', selectedLanguage),
      icon: (
        <BodyTypeIcon
          width={100}
          height={70}
          img={require('./icons-body-type/sedan.png')}
        />
      ),
    },
    {
      id: 51,
      title: getTranslation('bodyType.suv', selectedLanguage),
      icon: (
        <BodyTypeIcon
          width={100}
          height={70}
          img={require('./icons-body-type/suv.png')}
        />
      ),
    },
    {
      id: 56,
      title: getTranslation('bodyType.van', selectedLanguage),
      icon: (
        <BodyTypeIcon
          width={100}
          height={70}
          img={require('./icons-body-type/Van.png')}
        />
      ),
    },
    {
      id: 52,
      title: getTranslation('bodyType.crossover', selectedLanguage),
      icon: (
        <BodyTypeIcon
          width={100}
          height={70}
          img={require('./icons-body-type/crossover.png')}
        />
      ),
    },
    {
      id: 55,
      title: getTranslation('bodyType.pickupTruck', selectedLanguage),
      icon: (
        <BodyTypeIcon
          width={100}
          height={70}
          img={require('./icons-body-type/PickupTruck.png')}
        />
      ),
    },
    {
      id: 58,
      title: getTranslation('bodyType.convertible', selectedLanguage),
      icon: (
        <BodyTypeIcon
          width={100}
          height={70}
          img={require('./icons-body-type/Convertible.png')}
        />
      ),
    },
  ];

  const handleBodyTypePress = id => {
    navigation.navigate('ExploreTab', {
      filters: {
        specifications: {
          body_type: [id],
        },
        brands: [],
        brandIds: [],
        models: [],
        modelIds: [],
        trims: [],
        trimIds: [],
        years: [],
        yearIds: [],
      },
    });
  };

  const handleSeeAllPress = () => {
    navigation.navigate('FilterScreen', {
      filterType: 'bodyType',
    });
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : 'none'},
      ]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: isDark ? '#FFFFFF' : '#333'}]}>
          {getTranslation('bodyType.title', selectedLanguage)}
        </Text>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>
            {getTranslation('bodyType.seeAll', selectedLanguage)}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {bodyTypes.map(item => (
          <BodyTypeItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            isDark={isDark}
            onPress={() => handleBodyTypePress(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '500',
  },
  scrollContent: {
    paddingRight: 20,
  },
  itemContainer: {
    width: 91,
    marginRight: 12,
    alignItems: 'center',
    marginLeft: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default BodyTypeSearch;
