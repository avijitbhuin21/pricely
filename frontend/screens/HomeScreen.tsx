import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback, Image, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../components/Footer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocation } from '../contexts/LocationContext';

import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SearchHistory from '../components/SearchHistory';

const PROMO_IMAGE_URL = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc';

export default function HomeScreen() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from storage on mount
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('searchHistory');
        if (storedHistory) {
          setSearchHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    loadSearchHistory();
  }, []);

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

  const addToSearchHistory = async (query: string) => {
    if (!query.trim()) return;

    try {
      const newHistory = [...searchHistory];
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

      // Update state and storage
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving to search history:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleDeleteSearch = async (item: string) => {
    try {
      const newHistory = searchHistory.filter(search => search !== item);
      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error deleting search item:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
  
    console.log('Searching for:', searchQuery);
    await addToSearchHistory(searchQuery);
    setSearchQuery('');
    Keyboard.dismiss();
    
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CompareResult',
        params: { query: searchQuery },
      })
    );
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

          <View style={styles.fixedContent}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: PROMO_IMAGE_URL }}
                style={styles.promoImage}
                resizeMode="cover"
              />
              <View style={styles.searchOverlay}>
                <SearchBar
                  onSearch={handleSearch}
                  value={searchQuery}
                  onChangeText={handleSearchInputChange}
                  onSubmitEditing={handleSearch}
                />
              </View>
            </View>
          </View>

          <View style={styles.mainContainer}>
            <View style={[styles.sectionsContainer, { height: '100%' }]}>
              {searchHistory.length > 0 && (
                <View style={styles.historySection}>
                  <SearchHistory
                    searches={searchHistory}
                    onSearchPress={async (item) => {
                      setSearchQuery(item);
                      await addToSearchHistory(item);
                      navigation.dispatch(
                        CommonActions.navigate({
                          name: 'CompareResult',
                          params: { query: item },
                        })
                      );
                    }}
                    onClearHistory={handleClearHistory}
                    onDeleteSearch={handleDeleteSearch}
                  />
                </View>
              )}

              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>Recommended Daily Needs</Text>
                <View style={styles.recommendationsGrid}>
                  <View style={styles.recommendationItem}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb' }}
                      style={styles.recommendationImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recommendationInfo}>
                      <Text style={styles.recommendationText}>Fresh Onions</Text>
                      <Text style={styles.recommendationPrice}>1kg/ ₹40</Text>
                    </View>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73' }}
                      style={styles.recommendationImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recommendationInfo}>
                      <Text style={styles.recommendationText}>Fresh Bread</Text>
                      <Text style={styles.recommendationPrice}>₹45</Text>
                    </View>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Image
                      source={{ uri: 'https://m.media-amazon.com/images/I/61ZJhcdG7LL.jpg' }}
                      style={styles.recommendationImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recommendationInfo}>
                      <Text style={styles.recommendationText}>Fresh Tomatoes</Text>
                      <Text style={styles.recommendationPrice}>1kg/ ₹60</Text>
                    </View>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Image
                      source={{ uri: 'https://thehomesteadingrd.com/wp-content/uploads/2023/12/How-to-store-fresh-eggs.jpg' }}
                      style={styles.recommendationImage}
                      resizeMode="cover"
                    />
                    <View style={styles.recommendationInfo}>
                      <Text style={styles.recommendationText}>Fresh Eggs</Text>
                      <Text style={styles.recommendationPrice}>12pcs/ ₹85</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footerContainer}>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  fixedContent: {
    width: '100%',
    backgroundColor: '#fff',
    zIndex: 2,
  },
  mainContainer: {
    flex: 1,
    paddingTop: 40, // Give space for search bar
  },
  sectionsContainer: {
    backgroundColor: '#fff',
    paddingBottom: 80, // Account for footer
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  headerSection: {
    width: '100%',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    marginTop: -1, // Remove gap between header and image
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  searchOverlay: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  historySection: {
    width: '100%',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  recommendationsSection: {
    width: '100%',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  recommendationItem: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  recommendationInfo: {
    padding: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 14,
    color: '#E8099C',
    fontWeight: 'bold',
  },
  footerContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});
