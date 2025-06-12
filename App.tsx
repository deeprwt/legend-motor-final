import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {CurrencyLanguageProvider} from './src/context/CurrencyLanguageContext';
import {ThemeProvider} from './src/context/ThemeContext';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {CountryCodesProvider} from './src/context/CountryCodesContext';

import {NavigationContainer} from '@react-navigation/native';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyLanguageProvider>
            <AuthProvider>
              <CountryCodesProvider>
                <WishlistProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </WishlistProvider>
              </CountryCodesProvider>
            </AuthProvider>
          </CurrencyLanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
