import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback, TextInput } from 'react-native';
import Footer from '../components/Footer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocation } from '../contexts/LocationContext';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchHistory from '../components/SearchHistory';

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
  const [activeTab, setActiveTab] = useState('home');
  const [userName] = useState('Sagnik'); // In a real app, this would come from authentication
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          {isKeyboardActive && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <View style={styles.headerSection}>
            <Header
              userName={userName}
              currentLocation={currentLocation}
              onLocationSelect={updateLocation}
              onAutoLocate={autoLocate}
            />
          </View>
          
          <View style={styles.searchSection}>
            <SearchBar
              onSearch={handleSearch}
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              onSubmitEditing={handleSearch}
            />
          </View>
          
          <View style={styles.historySection}>
            <SearchHistory
              searches={searchHistory}
              onSearchPress={(item) => {
                setSearchQuery(item);
              }}
              onClearHistory={handleClearHistory}
              onDeleteSearch={handleDeleteSearch}
            />
          </View>
          
          <View style={styles.footerSection}>
            <Footer navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'snow',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: 'snow',
  },
  searchSection: {
    width: '100%',
    alignItems: 'center',
  },
  headerSection: {
    width: '100%',
  },
  historySection: {
    flex: 1,
    width: '100%',
  },
  footerSection: {
    width: '100%',
  },
});