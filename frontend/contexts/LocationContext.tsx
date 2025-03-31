import React, { createContext, useContext, useState, useEffect } from 'react';
import * as ExpoLocation from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location, LocationResult } from '../types';

interface LocationContextType {
  currentLocation: Location;
  isLocating: boolean;
  googleApiKey: string | null;
  updateLocation: (location: Location) => void;
  autoLocate: () => Promise<void>;
  searchLocations: (query: string) => Promise<LocationResult[]>;
}

const LocationContext = createContext<LocationContextType>({
  currentLocation: { address: 'Select Location' },
  isLocating: false,
  googleApiKey: null,
  updateLocation: () => {},
  autoLocate: async () => {},
  searchLocations: async () => [],
});

const STORAGE_KEY = 'Pricely_Location';
const API_ENDPOINT = 'https://noble-raven-entirely.ngrok-free.app/get-api-key';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Location>({ address: "Select Location" });
  const [isLocating, setIsLocating] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);

  // Load saved location from AsyncStorage on component mount
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        console.log('[LocationContext] Loading saved location from storage');
        const savedLocation = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (savedLocation) {
          console.log('[LocationContext] Found saved location:', savedLocation);
          setCurrentLocation({ address: savedLocation });
        } else {
          console.log('[LocationContext] No saved location found');
        }
      } catch (error) {
        console.error('[LocationContext] Failed to load saved location:', error);
        setCurrentLocation({ address: 'Select Location' });
      }
    };

    console.log('[LocationContext] Provider initialized');
    loadSavedLocation();
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    if (isLoadingApiKey) {
      console.log('[LocationContext] API key fetch already in progress, skipping');
      return;
    }
    
    setIsLoadingApiKey(true);
    console.log('[LocationContext] Fetching API key from server...');
    
    try {
      // Using POST request as specified
      console.log(`[LocationContext] Making POST request to ${API_ENDPOINT}`);
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), 
      });
      
      console.log(`[LocationContext] API response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const encryptedKey = await response.text();
      console.log('[LocationContext] Received encrypted key, length:', encryptedKey.length);
      console.log('[LocationContext] First 50 chars of encrypted key:', encryptedKey.substring(0, 50));
      
      const decodedKey = decodeApiKey(encryptedKey);
      console.log('[LocationContext] Successfully decoded API key');
      
      setGoogleApiKey(decodedKey);
      console.log('[LocationContext] API key stored in state');
      
    } catch (error) {
      console.error('[LocationContext] Error fetching API key:', error);
      Alert.alert(
        'Connection Error',
        'Unable to connect to location services. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingApiKey(false);
      console.log('[LocationContext] Finished API key fetch attempt');
    }
  };

  const decodeApiKey = (encodedKey: string): string => {
    try {
      console.log('[LocationContext] Starting API key decoding process');
      
      // Get current hour in 12-hour format (1-12)
      const now = new Date();
      const hourNumber = now.getHours() % 12 || 12; // Convert 0 to 12 for 12 AM
      console.log(`[LocationContext] Current hour (12-hour format): ${hourNumber}`);
      
      // Clean the encoded key by removing any quotes, whitespace, or other non-base64 characters
      let cleanedKey = encodedKey.trim();
      
      // Remove any quotes that might be wrapping the key
      if ((cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) || 
          (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))) {
        cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
      }
      
      console.log(`[LocationContext] Cleaned key length: ${cleanedKey.length}`);
      console.log(`[LocationContext] First 50 chars of cleaned key: ${cleanedKey.substring(0, 50)}`);
      
      let decodedKey = cleanedKey;
      
      // Decode the key multiple times based on current hour
      for (let i = 0; i < hourNumber; i++) {
        console.log(`[LocationContext] Decoding iteration ${i+1}/${hourNumber}`);
        try {
          // Using a more robust base64 decoding approach
          decodedKey = safeBase64Decode(decodedKey);
          console.log(`[LocationContext] Iteration ${i+1} success, result length: ${decodedKey.length}`);
          if (i < hourNumber - 1) {
            console.log(`[LocationContext] First 20 chars of intermediate result: ${decodedKey.substring(0, 20)}`);
          }
        } catch (decodeError) {
          console.error(`[LocationContext] Error during decode iteration ${i+1}:`, decodeError);
          console.log(`[LocationContext] Problematic string: "${decodedKey.substring(0, 50)}..."`);
          throw decodeError;
        }
      }
      
      console.log('[LocationContext] API key successfully decoded');
      return decodedKey;
    } catch (error) {
      console.error('[LocationContext] Error decoding API key:', error);
      // Return a fallback key if decoding fails - if you have a testing key you can use
      // Or you could implement a different backup strategy
      throw new Error('Failed to decode API key');
    }
  };

  // A more robust base64 decoder that handles common issues
  const safeBase64Decode = (input: string): string => {
    // Replace any non-base64 characters
    let sanitized = input.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // Make sure the length is a multiple of 4
    while (sanitized.length % 4 !== 0) {
      sanitized += '=';
    }
    
    try {
      return atob(sanitized);
    } catch (error) {
      console.error('[LocationContext] Base64 decode error:', error);
      console.log('[LocationContext] Problematic base64 string:', sanitized);
      throw error;
    }
  };

  const requestLocationPermission = async () => {
    try {
      console.log('[LocationContext] Requesting location permission');
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      console.log(`[LocationContext] Location permission status: ${status}`);
      
      if (status !== 'granted') {
        console.log('[LocationContext] Location permission denied');
        Alert.alert(
          'Permission Required',
          'Please grant location permission to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }
      console.log('[LocationContext] Location permission granted');
      return true;
    } catch (error) {
      console.error('[LocationContext] Error requesting location permission:', error);
      return false;
    }
  };

  const autoLocate = async () => {
    console.log('[LocationContext] Starting auto-location process');
    setIsLocating(true);
    setCurrentLocation({ address: 'Detecting location...' });
    
    // If we don't have the API key yet, try to fetch it
    if (!googleApiKey) {
      console.log('[LocationContext] No API key found, attempting to fetch');
      await fetchApiKey();
      if (!googleApiKey) {
        console.log('[LocationContext] Failed to get API key, aborting auto-locate');
        setCurrentLocation({ address: 'Location services unavailable' });
        setIsLocating(false);
        return;
      }
    }
    
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('[LocationContext] No location permission, aborting auto-locate');
      setCurrentLocation({ address: 'Select Location' });
      setIsLocating(false);
      return;
    }

    try {
      console.log('[LocationContext] Getting current position');
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High
      });
      
      const { latitude, longitude } = location.coords;
      console.log(`[LocationContext] Got coordinates: ${latitude}, ${longitude}`);
      await AsyncStorage.setItem("pricely_lat", String(latitude));
      await AsyncStorage.setItem('pricely_lon', String(longitude));
      
      // Use Google's Geocoding API with our API key
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`;
      console.log('[LocationContext] Calling Google Geocoding API');
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      console.log(`[LocationContext] Google Geocoding API status: ${data.status}`);
      
      if (data.status === 'OK' && data.results.length > 0) {
        // Use the most accurate address component from Google's response
        const addressComponents = data.results[0].address_components;
        console.log(`[LocationContext] whole location: ${data}`);
        
        const city = addressComponents.find((component: { types: string[], long_name: string }) =>
          component.types.includes('locality'))?.long_name;
        const region = addressComponents.find((component: { types: string[], long_name: string }) =>
          component.types.includes('administrative_area_level_1'))?.long_name;
        const country = addressComponents.find((component: { types: string[], long_name: string }) =>
          component.types.includes('country'))?.long_name;
        
        const locationName = [city, region, country].filter(Boolean).join(', ');
        console.log(`[LocationContext] Location resolved: ${locationName}`);
        
        updateLocation({
          address: locationName || 'Location Found',
          lat: latitude,
          lon: longitude
        });
      } else {
        // Fallback to Expo Location's reverseGeocodeAsync if Google API fails
        console.log('[LocationContext] Falling back to Expo reverseGeocodeAsync');
        const addresses = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
        
        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          console.log('[LocationContext] Got address from Expo:', address);
          
          const locationName = [
            address.city,
            address.region,
            address.country
          ].filter(Boolean).join(', ');
          
          console.log(`[LocationContext] Location resolved from Expo: ${locationName}`);
          updateLocation({
            address: locationName || 'Location Found',
            lat: latitude,
            lon: longitude
          });
        } else {
          console.log('[LocationContext] No address found from either source');
          setCurrentLocation({ address: 'Location not found' });
          Alert.alert('Error', 'Could not determine your address');
        }
      }
    } catch (error) {
      console.error('[LocationContext] Error in auto-locate process:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings and try again.',
        [{ text: 'OK' }]
      );
      setCurrentLocation({ address: 'Select Location' });
    } finally {
      setIsLocating(false);
      console.log('[LocationContext] Auto-locate process completed');
    }
  };

  const searchLocations = async (query: string): Promise<LocationResult[]> => {
    console.log(`[LocationContext] Searching locations for query: "${query}"`);
    
    if (!googleApiKey) {
      console.log('[LocationContext] No API key for search, attempting to fetch');
      await fetchApiKey();
      if (!googleApiKey) {
        console.log('[LocationContext] Failed to get API key for search');
        Alert.alert('Error', 'Location services unavailable');
        return [];
      }
    }

    try {
      // Use Google Places Autocomplete API
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}`;
      console.log('[LocationContext] Calling Google Places Autocomplete API');
      
      const response = await fetch(autocompleteUrl);
      const data = await response.json();
      
      console.log(`[LocationContext] Google Places API status: ${data.status}`);
      
      if (data.status === 'OK') {
        const results = data.predictions.map((prediction: any) => ({
          id: prediction.place_id,
          description: prediction.description,
        }));
        
        console.log(`[LocationContext] Found ${results.length} location suggestions`);
        return results;
      } else {
        console.log(`[LocationContext] Place search returned status: ${data.status}`);
      }
      
      return [];
    } catch (error) {
      console.error('[LocationContext] Error searching locations:', error);
      return [];
    }
  };

  const updateLocation = async (location: Location) => {
    console.log(`[LocationContext] Updating location to:`, location);
    setCurrentLocation(location);
    
    // Save location to AsyncStorage
    try {
      console.log(`[LocationContext] Saving location to storage with key: ${STORAGE_KEY}`);
      await AsyncStorage.setItem(STORAGE_KEY, location.address);
      console.log('[LocationContext] Location successfully saved to storage');

      // Get coordinates if not provided
      if (!location.lat && !location.lon && googleApiKey) {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location.address)}&key=${googleApiKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          await AsyncStorage.setItem("pricely_lat", String(lat));
          await AsyncStorage.setItem('pricely_lon', String(lng));
          console.log(`[LocationContext] Saved coordinates for selected location: lat=${lat}, lon=${lng}`);
        }
      }
    } catch (error) {
      console.error('[LocationContext] Failed to save location to storage:', error);
    }
  };

  return (
    <LocationContext.Provider 
      value={{ 
        currentLocation,
        isLocating,
        googleApiKey,
        updateLocation,
        autoLocate,
        searchLocations
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}