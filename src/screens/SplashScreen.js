import React, {useEffect} from 'react';
import {View, StyleSheet, Image, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const navigation = useNavigation();
  const {checkAuthStatus} = useAuth();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      // Check if user is authenticated

      // Navigate based on authentication status
      const firstTimeUser = await AsyncStorage.getItem('firstTimeUser');
      setTimeout(() => {
        let isAuth = checkAuthStatus();
        if (isAuth) {
          // User is authenticated, go directly to main screen
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } else {
          if (!firstTimeUser) {
            // User is not authenticated, go to language selection
            navigation.reset({
              index: 0,
              routes: [{name: 'LanguageSelect'}],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{name: 'Main'}, {name: 'Login'}],
            });
          }
        }
      }, 3000);
    };

    checkAuthAndNavigate();

    // Clean up any timers on component unmount
    return () => {};
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo_Animation.gif')}
        style={styles.logo}
        resizeMode="contain" // Use the built-in Image resizeMode property
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#FFFFFF', // Background color for the splash screen
  },
  logo: {
    width: Dimensions.get('window').width, // Adjust as needed
    height: Dimensions.get('window').height, // Adjust as needed
    backgroundColor: '#E8E2D6',
  },
});

export default SplashScreen;
