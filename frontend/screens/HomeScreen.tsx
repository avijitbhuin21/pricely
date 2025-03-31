import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  Keyboard, 
  TouchableWithoutFeedback, 
  TouchableOpacity,
  Image, 
  Text, 
  FlatList, 
  Animated, 
  Dimensions, 
  NativeScrollEvent, 
  NativeSyntheticEvent,
  Platform,
  PixelRatio,
  useWindowDimensions
} from 'react-native';
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

// Create responsive scale functions
const createScaleFunctions = (width: number, height: number) => {
  const baseWidth = 375; // Base width (iPhone X)
  const baseHeight = 812; // Base height (iPhone X)
  
  // Scale based on width
  const horizontalScale = (size: number): number => {
    const scaleFactor = width / baseWidth;
    const newSize = size * scaleFactor;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };
  
  // Scale based on height
  const verticalScale = (size: number): number => {
    const scaleFactor = height / baseHeight;
    const newSize = size * scaleFactor;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };
  
  // Moderate scale for fonts and elements that shouldn't scale too much
  const moderateScale = (size: number, factor = 0.5): number => {
    const scaleFactor = width / baseWidth;
    const newSize = size + (scaleFactor - 1) * factor * size;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };
  
  return { horizontalScale, verticalScale, moderateScale };
};

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
  scales: {
    horizontalScale: (size: number) => number;
    verticalScale: (size: number) => number;
    moderateScale: (size: number, factor?: number) => number;
  };
  recommendedCarouselHeight: number;
  trendingCarouselHeight: number;
  onItemPress: (item: CarouselItem) => void;
  showPrices?: boolean;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  items,
  scales,
  recommendedCarouselHeight,
  trendingCarouselHeight,
  onItemPress,
  showPrices = true
}) => {
  const { horizontalScale, verticalScale, moderateScale } = scales;
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(2);

  // Calculate item dimensions
  const itemGap = horizontalScale(24);
  const totalHorizontalPadding = horizontalScale(32);
  const flatListHorizontalPadding = horizontalScale(16);
  const availableWidth = Dimensions.get('window').width - totalHorizontalPadding;
  const itemWidth = (availableWidth - itemGap) / visibleItems;
  
  // Optimize image height based on whether prices are shown
  const imageHeight = verticalScale(showPrices ? 70 : 65);
  
  // Calculate card height with min/max constraints
  const minCardHeight = verticalScale(95);
  const maxCardHeight = verticalScale(120);
  const calculatedCardHeight = showPrices 
    ? imageHeight + verticalScale(35) // Image + space for name and price
    : imageHeight + verticalScale(25); // Image + space for just name
    
  // Apply min/max constraints
  const cardHeight = Math.min(Math.max(calculatedCardHeight, minCardHeight), maxCardHeight);
  
  // Dynamically adjust number of visible items based on screen width
  useEffect(() => {
    const width = Dimensions.get('window').width;
    if (width > 400) {
      setVisibleItems(2);
    } else {
      setVisibleItems(2); // Keep at 2 for consistency, adjust if needed for very small screens
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (items.length <= visibleItems) return; // Don't scroll if all items are visible
      
      const nextIndex = (currentIndex + 1) % (items.length - visibleItems + 1);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, items.length, visibleItems]);

  const renderItem = ({ item, index }: { item: CarouselItem, index: number }) => (
    <TouchableOpacity 
      style={[
        {
          width: itemWidth,
          marginRight: index === items.length - 1 ? 0 : itemGap,
          backgroundColor: '#fff',
          borderRadius: moderateScale(10),
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          overflow: 'hidden',
          height: cardHeight,
        }
      ]}
      activeOpacity={0.7}
      onPress={() => onItemPress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={{
          width: '100%',
          height: imageHeight,
        }}
        resizeMode="cover"
      />
      <View style={{ 
        padding: moderateScale(4), 
        flex: 1,
        justifyContent: 'center'
      }}>
        <View style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: verticalScale(1),
        }}>
          <Text 
            style={{
              fontSize: moderateScale(13),
              color: '#333',
              fontWeight: '600',
              width: '100%',
            }} 
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {showPrices && item.price && (
            <Text style={{
              fontSize: moderateScale(13),
              color: '#E8099C',
              fontWeight: 'bold',
              width: '100%',
            }}>
              {item.price}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{
      height: title.includes('Recommended') ? recommendedCarouselHeight : trendingCarouselHeight,
      marginBottom: title.includes('Recommended') ? verticalScale(4) : 0
    }}>
      <Text style={{
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(8),
        paddingLeft: horizontalScale(5),
      }}>
        {title}
      </Text>
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth + itemGap}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: flatListHorizontalPadding }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={item => item.id}
        getItemLayout={(data, index) => ({
          length: itemWidth + itemGap,
          offset: (itemWidth + itemGap) * index,
          index,
        })}
        initialNumToRender={visibleItems + 1}
      />
    </View>
  );
};

export default function HomeScreen() {
  interface SearchItem {
    query: string;
    imageUrl?: string;
  }

  // Get window dimensions
  const { width, height } = useWindowDimensions();
  const { horizontalScale, verticalScale, moderateScale } = createScaleFunctions(width, height);
  
  // State variables
  const [searchHistory, setSearchHistory] = useState<SearchItem[]>([]);
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [userName] = useState('Demo');

  // Animation refs
  const footerAnimation = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Navigation and context
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Calculate layout proportions based on available space
  const layoutProportions = useMemo(() => {
    // Estimated header height
    const headerHeight = verticalScale(60); 
    
    // Promo section - adjust based on screen height
    const promoHeight = verticalScale(height < 700 ? 140 : 170);
    
    // Spacing after search bar
    const searchBarBottomSpace = verticalScale(25);
    
    // Top margin for recent searches
    const historyTopMargin = verticalScale(10);
    
    // Search history section - if present
    const historyHeight = searchHistory.length > 0 ? verticalScale(90) : 0;
    
    // Add spacing between history and first carousel - INCREASED as requested
    const historyBottomMargin = searchHistory.length > 0 ? verticalScale(30) : 0;
    
    // Top margin for recommended section
    const recommendedTopMargin = verticalScale(10);
    
    // Footer height
    const footerHeight = verticalScale(70);
    
    // Dynamic spacing between carousels based on screen height
    const carouselGap = Math.max(verticalScale(1), Math.floor(height * .005)); // 0.5% of screen height
    
    // Calculate dynamic space for carousels based on available height
    const availableSpace = height - (
      headerHeight + 
      promoHeight + 
      searchBarBottomSpace + 
      historyTopMargin +
      historyHeight + 
      historyBottomMargin + 
      recommendedTopMargin +
      carouselGap +
      footerHeight
    );
    // Allocate space for carousels with dynamic ratio based on content
    const recommendedCarouselHeight = Math.floor(availableSpace * 0.40); // 52% for recommended items (slightly larger)
    const trendingCarouselHeight = Math.floor(availableSpace * 0.60); // 48% for trending items
    
    
    return {
      headerHeight,
      promoHeight,
      searchBarBottomSpace,
      historyTopMargin,
      historyHeight,
      historyBottomMargin,
      recommendedTopMargin,
      recommendedCarouselHeight,
      trendingCarouselHeight,
      carouselGap,
      footerHeight
    };
  }, [height, searchHistory.length, verticalScale]);

  // Handle scroll events to show/hide footer
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

  // Load search history from local storage
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('searchHistory');
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
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

  // Handle keyboard events
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

  // Add to search history
  const addToSearchHistory = async (query: string, imageUrl?: string) => {
    if (!query.trim()) return;

    try {
      const newHistory = [...searchHistory];
      const index = newHistory.findIndex(item => item.query === query.trim());
      if (index !== -1) {
        newHistory.splice(index, 1);
      }
      if (newHistory.length >= 10) {
        newHistory.shift();
      }
      newHistory.push({
        query: query.trim(),
        imageUrl,
      });

      setSearchHistory(newHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving to search history:', error);
    }
  };

  // Handle search action
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

  // Handle search input changes
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle item press in carousels
  const handleItemPress = (item: CarouselItem) => {
    // Navigate to product detail or perform search with this item
    console.log('Item pressed:', item.name);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'CompareResult',
        params: { 
          query: item.name,
          onSearchComplete: async (imageUrl: string) => {
            await addToSearchHistory(item.name, imageUrl);
          }
        },
      })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {isKeyboardActive && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ 
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'transparent',
                zIndex: 20 
              }} />
            </TouchableWithoutFeedback>
          )}

          {/* Header */}
          <View style={{ 
            width: '100%',
            backgroundColor: '#fff',
            zIndex: 10,
            height: layoutProportions.headerHeight 
          }}>
            <Header
              userName={userName}
              currentLocation={currentLocation}
              onLocationSelect={updateLocation}
              onAutoLocate={autoLocate}
            />
          </View>

          {/* Promo Image and Search */}
          <View style={{ 
            width: '100%',
            height: layoutProportions.promoHeight,
            backgroundColor: '#fff',
            position: 'relative'
          }}>
            <Image
              source={{ uri: PROMO_IMAGE_URL }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ 
              position: 'absolute',
              bottom: -verticalScale(20),
              left: 0,
              right: 0,
              paddingHorizontal: horizontalScale(20),
              zIndex: 5 
            }}>
              <SearchBar
                onSearch={handleSearch}
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                onSubmitEditing={handleSearch}
              />
            </View>
          </View>

          {/* Space after search bar */}
          <View style={{ height: layoutProportions.searchBarBottomSpace }} />

          {/* Search History with top margin */}
          {searchHistory.length > 0 && (
            <>
              {/* Top margin for search history */}
              <View style={{ height: layoutProportions.historyTopMargin }} />
              
              <View style={{ 
                width: '100%',
                height: layoutProportions.historyHeight,
                paddingHorizontal: horizontalScale(15),
                backgroundColor: '#fff',
                marginBottom: layoutProportions.historyBottomMargin,
              }}>
                <SearchHistory
                  searches={searchHistory}
                  onSearchPress={async (query) => {
                    setSearchQuery(query);
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
            </>
          )}

          {/* Main Content Area - No ScrollView */}
          <View style={{ 
            flex: 1,
          }}>
            {/* Top margin for recommended section */}
            <View style={{ height: layoutProportions.recommendedTopMargin }} />
            
            {/* Recommended Section - No prices */}
            <CarouselSection
              title="Recommended Daily Needs"
              items={recommendedItems}
              scales={{ horizontalScale, verticalScale, moderateScale }}
              recommendedCarouselHeight={layoutProportions.recommendedCarouselHeight}
              trendingCarouselHeight={layoutProportions.trendingCarouselHeight}
              onItemPress={handleItemPress}
              showPrices={false} // Don't show prices for recommended items
            />
            
            {/* Minimal space between carousels */}
            {layoutProportions.carouselGap > 0 && (
              <View style={{ height: layoutProportions.carouselGap }} />
            )}
            
            {/* Trending Section - With prices */}
            <CarouselSection
              title="Trending Items"
              items={trendingItems}
              scales={{ horizontalScale, verticalScale, moderateScale }}
              recommendedCarouselHeight={layoutProportions.recommendedCarouselHeight}
              trendingCarouselHeight={layoutProportions.trendingCarouselHeight}
              onItemPress={handleItemPress}
              showPrices={true} // Show prices for trending items
            />
          </View>

          {/* Footer */}
          <Animated.View style={{
            width: '100%',
            height: layoutProportions.footerHeight,
            backgroundColor: '#fff',
            paddingVertical: verticalScale(8),
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
            transform: [{
              translateY: footerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, layoutProportions.footerHeight]
              })
            }]
          }}>
            <Footer navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}