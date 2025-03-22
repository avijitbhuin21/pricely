import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Easing, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocation } from '../contexts/LocationContext';

import { AnimatedBackground } from '../components/AnimatedBackground';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchHistory from '../components/SearchHistory';
import Notifications from '../components/Notifications';

export default function HomeScreen() {
  const [searchHistory, setSearchHistory] = useState([
    'Mango Fruity',
    'Maaza',
    'Chocolate',
    'Towel',
    'Ice Cream',
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [userName] = useState('Demo'); // In a real app, this would come from authentication
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const profileScale = useRef(new Animated.Value(1)).current;
  const historyScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardActive(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardActive(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;

    setSearchHistory(prevHistory => {
      const newHistory = [...prevHistory];
      // Remove if query already exists
      const index = newHistory.indexOf(query.trim());
      if (index !== -1) {
        newHistory.splice(index, 1);
      }
      // Remove the first item if we already have 10 items
      if (newHistory.length >= 10) {
        newHistory.shift();
      }
      // Add new search query at the end
      newHistory.push(query.trim());
      return newHistory;
    });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleDeleteSearch = (item: string) => {
    setSearchHistory(prevHistory =>
      prevHistory.filter(search => search !== item)
    );
  };

  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
  
    console.log('Searching for:', searchQuery);
    addToSearchHistory(searchQuery);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CompareResult',
        params: { query: searchQuery },
      })
    );
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
  };

  const animateProfileIcon = () => {
    Animated.sequence([
      Animated.timing(profileScale, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(profileScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateHistoryIcon = () => {
    Animated.sequence([
      Animated.timing(historyScale, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(historyScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabPress = (tabName: 'profile' | 'search' | 'cart') => {
    setActiveTab(tabName);
    if (tabName === 'profile') animateProfileIcon();
    if (tabName === 'cart') {
      animateHistoryIcon();
      navigation.navigate('Cart');
    }
    if (tabName === 'search' && searchQuery.trim()) {
      handleSearch();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Notifications />
          {isKeyboardActive && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <Header
            userName={userName}
            currentLocation={currentLocation}
            onLocationSelect={updateLocation}
            onAutoLocate={autoLocate}
          />
          <SearchBar
            onSearch={handleSearch}
            value={searchQuery}
            onChangeText={handleSearchInputChange}
            onSubmitEditing={handleSearch}
          />
          <SearchHistory
            searches={searchHistory}
            onSearchPress={(item) => {
              setSearchQuery(item);
            }}
            onClearHistory={handleClearHistory}
            onDeleteSearch={handleDeleteSearch}
          />
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Profile' }))}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: profileScale }] }}>
                <Ionicons
                  name="person"
                  size={24}
                  color="#2196F3"
                />
              </Animated.View>
              <Text style={styles.buttonText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.searchButton]}
              onPress={() => handleTabPress('search')}
              activeOpacity={0.8}
            >
              <Animated.View style={[
                styles.searchIconContainer,
                { transform: [{ scale: isKeyboardActive ? 0.9 : 1 }] }
              ]}>
                <Ionicons name="search" size={28} color="#FFFFFF" />
              </Animated.View>
              <Text style={[
                styles.buttonText,
                activeTab === 'search' && styles.activeButtonText
              ]}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButton}
              onPress={() => handleTabPress('cart')}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: historyScale }] }}>
                <Ionicons
                  name="cart"
                  size={24}
                  color={activeTab === 'cart' ? '#2196F3' : '#757575'}
                />
              </Animated.View>
              <Text style={[
                styles.buttonText,
                activeTab === 'cart' && styles.activeButtonText
              ]}>Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  searchButton: {
    transform: [{ translateY: -20 }],
  },
  searchIconContainer: {
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonText: {
    color: '#333',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
  },
});