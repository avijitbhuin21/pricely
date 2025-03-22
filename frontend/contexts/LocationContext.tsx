import React, { createContext, useContext, useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationContextType {
  currentLocation: string;
  isLocating: boolean;
  updateLocation: (location: string) => void;
  autoLocate: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState("Select Location");
  const [isLocating, setIsLocating] = useState(false);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant location permission to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const autoLocate = async () => {
    setIsLocating(true);
    setCurrentLocation('Detecting location...');
    
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setCurrentLocation('Select Location');
      setIsLocating(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const { latitude, longitude } = location.coords;
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const locationName = [
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
        
        setCurrentLocation(locationName || 'Location Found');
      } else {
        setCurrentLocation('Location not found');
        Alert.alert('Error', 'Could not determine your address');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings and try again.',
        [{ text: 'OK' }]
      );
      setCurrentLocation('Select Location');
    } finally {
      setIsLocating(false);
    }
  };

  const updateLocation = (location: string) => {
    setCurrentLocation(location);
  };

  return (
    <LocationContext.Provider 
      value={{ 
        currentLocation, 
        isLocating, 
        updateLocation, 
        autoLocate 
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}