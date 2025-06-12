import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {
  Header,
  SearchBar,
  CategoryFilter,
  PromotionBanner,
  PopularBrands,
  HotDeals,
  BodyTypeSearch,
  NewsBlogs,
} from '../../components/home';
// import { FooterNav } from "../../components/navigation";
import {COLORS} from '../../utils/constants';
import MostPopular from '../../components/home/MostPopular';
import JustArrived from '../../components/home/JustArrived';
// import BottomTabNavigator from "../../navigation/BottomTabNavigator";
import Footer from '../../components/Footer';
import {useTheme} from '../../context/ThemeContext';

const HomeScreen = () => {
  const {isDark} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDark ? '#2D2D2D' : COLORS.background},
      ]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Header />
        {/* <SearchBar /> */}
        <CategoryFilter />
        <PromotionBanner />
        <PopularBrands />
        <HotDeals />
        <BodyTypeSearch />
        <NewsBlogs />
        <MostPopular />
        <JustArrived />
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 70, // Add padding at the bottom for the footer
  },
});

export default HomeScreen;
