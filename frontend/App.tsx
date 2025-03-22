import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { LocationProvider } from './contexts/LocationContext';
import { CartProvider } from './contexts/CartContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LocationProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </LocationProvider>
    </SafeAreaProvider>
  );
}
