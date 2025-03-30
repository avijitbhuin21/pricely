import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback, Image, Text, FlatList, Animated, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
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
const { width } = Dimensions.get('window');
const SCREEN_PADDING = 32; // Total horizontal padding
const ITEM_GAP = 24; // Space between items
const ITEM_WIDTH = (width - SCREEN_PADDING - ITEM_GAP) / 2; // Dynamic width for exactly 2 items

// ... (keep your data arrays the same)
// Sample data for carousels
const recommendedItems = [
  {
    id: '1',
    name: 'Fresh Onions',
    price: '1kg/ ₹40',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb'
  },
  {
    id: '2',
    name: 'Fresh Bread',
    price: '₹45',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73'
  },
  {
    id: '3',
    name: 'Fresh Tomatoes',
    price: '1kg/ ₹60',
    image: 'https://m.media-amazon.com/images/I/61ZJhcdG7LL.jpg'
  },
  {
    id: '4',
    name: 'Fresh Eggs',
    price: '12pcs/ ₹85',
    image: 'https://thehomesteadingrd.com/wp-content/uploads/2023/12/How-to-store-fresh-eggs.jpg'
  },
  {
    id: '5',
    name: 'Fresh Potatoes',
    price: '1kg/ ₹35',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655'
  },
  {
    id: '6',
    name: 'Carrots',
    price: '500g/ ₹30',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'
  }
];

const trendingItems = [
  {
    id: '1',
    name: 'Fresh Apples',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'
  },
  {
    id: '2',
    name: 'Organic Honey',
    image: 'https://heavenearth.in/wp-content/uploads/2023/01/Organic-Honey-by-Heaven-earth-foods-1.jpg'
  },
  {
    id: '3',
    name: 'Fresh Milk',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150'
  },
  {
    id: '4',
    name: 'Whole Wheat',
    image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877'
  },
  {
    id: '5',
    name: 'Cheese',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d'
  },
  {
    id: '6',
    name: 'Dark Chocolate',
    image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e'
  }
];

interface CarouselItem {
  id: string;
  name: string;
  price?: string;
  image: string;
}

interface CarouselSectionProps {
  title: string;
  items: CarouselItem[];
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ title, items }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % (items.length - 1);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const renderItem = ({ item }: { item: CarouselItem }) => (
    <View style={styles.recommendationItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.recommendationImage}
        resizeMode="cover"
      />
      <View style={styles.recommendationInfo}>
        <View style={styles.nameAndPriceContainer}>
          <Text style={styles.recommendationText} numberOfLines={1}>{item.name}</Text>
          {item.price && <Text style={styles.recommendationPrice}>{item.price}</Text>}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.carouselSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={item => item.id}
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH + ITEM_GAP,
          offset: (ITEM_WIDTH + ITEM_GAP) * index,
          index,
        })}
      />
    </View>
  );
};

// export default function HomeScreen() {
  // ... (keep all your existing state and functions the same until the return statement)

  export default function HomeScreen() {
    interface SearchItem {
      query: string;
      imageUrl?: string;
    }
  
    const [searchHistory, setSearchHistory] = useState<SearchItem[]>([]);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const footerAnimation = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
  
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      
      if (currentScrollY > lastScrollY.current && isFooterVisible) {
        // Scrolling down, hide footer
        Animated.timing(footerAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        setIsFooterVisible(false);
      } else if (currentScrollY < lastScrollY.current && !isFooterVisible) {
        // Scrolling up, show footer
        Animated.timing(footerAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        setIsFooterVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
  
    // Load search history from storage on mount
    useEffect(() => {
      const loadSearchHistory = async () => {
        try {
          const storedHistory = await AsyncStorage.getItem('searchHistory');
          if (storedHistory) {
            const parsedHistory = JSON.parse(storedHistory);
            // Convert old format to new format if needed
            const formattedHistory = Array.isArray(parsedHistory) ? 
              parsedHistory.map((item: string | SearchItem) => {
                if (typeof item === 'string') {
                  return {
                    query: item,
                    timestamp: new Date().toLocaleString(),
                  };
                }
                return item;
              }) : [];
            setSearchHistory(formattedHistory);
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
    const [userName] = useState('Demo'); // In a real app, this would come from authentication
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
  
    const addToSearchHistory = async (query: string, imageUrl?: string) => {
      if (!query.trim()) return;
  
      try {
        const newHistory = [...searchHistory];
        // Remove if query already exists
        const index = newHistory.findIndex(item => item.query === query.trim());
        if (index !== -1) {
          newHistory.splice(index, 1);
        }
        // Remove the first item if we already have 10 items
        if (newHistory.length >= 10) {
          newHistory.shift();
        }
        // Add new search query at the end
        newHistory.push({
          query: query.trim(),
          imageUrl,
        });
  
        // Update state and storage
        setSearchHistory(newHistory);
        await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.error('Error saving to search history:', error);
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
          params: { 
            query: searchQuery,
            onSearchComplete: async (imageUrl: string) => {
              await addToSearchHistory(searchQuery, imageUrl);
            }
          },
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

          <View style={styles.fixedHeaderContainer}>
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
            
            {searchHistory.length > 0 && (
              <View style={styles.historySection}>
                <SearchHistory
                 searches={searchHistory}
                  onSearchPress={async (query) => {
                    setSearchQuery(query);
                    const existingSearch = searchHistory.find(item => item.query === query);
                    navigation.dispatch(
                      CommonActions.navigate({
                        name: 'CompareResult',
                        params: {
                          query,
                          onSearchComplete: async (imageUrl: string) => {
                            await addToSearchHistory(query, imageUrl);
                          }
                        },
                      })
                    );
                  }}
                />
              </View>
            )}
          </View>

          <ScrollView
            style={styles.mainContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sectionsContainer}>
              <CarouselSection title="Recommended Daily Needs" items={recommendedItems} />
              <CarouselSection title="Trending Items" items={trendingItems} />
            </View>
          </ScrollView>

          <Animated.View
            style={[
              styles.footerContainer,
              {
                transform: [
                  {
                    translateY: footerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 70]
                    })
                  }
                ]
              }
            ]}
          >
            <Footer navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
          </Animated.View>
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
  fixedHeaderContainer: {
    width: '100%',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  fixedContent: {
    width: '100%',
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 60, // Reduced space for footer
  },
  sectionsContainer: {
    paddingVertical: 5,
    gap: 10, // Reduced space between carousel sections
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  headerSection: {
    width: '100%',
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 200,
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
    zIndex: 5,
  },
  historySection: {
    width: '100%',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    paddingTop: 35, // Increased to accommodate search bar overlap
    paddingBottom: 10,
    marginBottom: 5,
  },
  carouselSection: {
    width: '100%',
    paddingHorizontal: SCREEN_PADDING / 2,
    marginBottom: 15,
  },
  carouselContent: {
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingLeft: 5,
  },
  recommendationItem: {
    width: ITEM_WIDTH,
    marginRight: ITEM_GAP,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  recommendationImage: {
    width: '100%',
    height: 100,  // Reduced height
  },
  recommendationInfo: {
    padding: 8,  // Reduced padding
  },
  nameAndPriceContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    width: '100%',
  },
  recommendationPrice: {
    fontSize: 13,
    color: '#E8099C',
    fontWeight: 'bold',
    width: '100%',
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