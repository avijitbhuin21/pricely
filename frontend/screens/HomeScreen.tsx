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
  useWindowDimensions,
  TextStyle
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

const PROMO_IMAGE_URL = 'https://images.unsplash.com/photo-1606787366850-de6330128bfc'; // fallback default, will be replaced dynamically

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
// Interfaces for server response
interface ServerItem {
  url: string;
  name: string;
}

interface ServerResponse {
  status: string;
  data: {
    trending: ServerItem[];
    daily_needs: ServerItem[];
  };
}

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
  carouselHeight: number;
  onItemPress: (item: CarouselItem) => void;
  showPrices?: boolean;
  standardCardHeight: number;
  standardImageHeight: number;
  standardItemWidth: number;
  standardItemGap: number;
  standardFontSizes: {
    title: number;
    price: number;
  };
  autoScrollInterval?: number; // New prop for customizing scroll interval
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  items,
  scales,
  carouselHeight,
  onItemPress,
  showPrices = true,
  standardCardHeight,
  standardImageHeight,
  standardItemWidth,
  standardItemGap,
  standardFontSizes,
  autoScrollInterval = 3000 // Default to 3 seconds if not specified
}) => {
  const { horizontalScale, verticalScale, moderateScale } = scales;
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Always show exactly 2 items
  const visibleItems = 2;
  
  // Use standardized dimensions passed from parent
  const itemWidth = standardItemWidth;
  const itemGap = standardItemGap;
  const cardHeight = standardCardHeight;
  const imageHeight = standardImageHeight;
  
  // Using standardized font sizes
  const titleFontSize = standardFontSizes.title;
  const priceFontSize = standardFontSizes.price;
  
  // Calculate side padding to ensure consistent layout
  const sidePadding = horizontalScale(16);
  
  // Memoize styles to prevent unnecessary recalculations
  const titleStyle = useMemo<TextStyle>(() => ({
    fontSize: titleFontSize,
    color: '#333',
    fontWeight: '600',
    width: '100%',
  }), [titleFontSize]);
  
  const priceStyle = useMemo<TextStyle>(() => ({
    fontSize: priceFontSize,
    color: '#E8099C',
    fontWeight: 'bold',
    width: '100%',
  }), [priceFontSize]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (items.length <= visibleItems) return; // Don't scroll if all items are visible
      
      const nextIndex = (currentIndex + 1) % (items.length - visibleItems + 1);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
      setCurrentIndex(nextIndex);
    }, autoScrollInterval);

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
            style={titleStyle} 
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {showPrices && item.price && (
            <Text style={priceStyle}>
              {item.price}
            </Text>
          )}
          
          {!showPrices && (
            <View style={{ height: priceFontSize * 1.2 }} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{
      height: carouselHeight,
      marginBottom: verticalScale(4)
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
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
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

  // Promo image URL state
  const [promoImageUrl, setPromoImageUrl] = useState<string>(PROMO_IMAGE_URL);
  
  // State for carousel data
  const [recommendedItems, setRecommendedItems] = useState<CarouselItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<CarouselItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch trending and daily needs data
  const fetchTrendingAndDailyNeeds = async () => {
    try {
      const response = await fetch('http://noble-raven-entirely.ngrok-free.app/trending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ServerResponse = await response.json();
      
      if (data.status === 'success' && data.data) {
        // Transform server data to match CarouselItem interface
        const transformedDailyNeeds = data.data.daily_needs.map((item, index) => ({
          id: `daily-${index}`,
          name: item.name,
          image: item.url
        }));

        const transformedTrending = data.data.trending.map((item, index) => ({
          id: `trending-${index}`,
          name: item.name,
          image: item.url
        }));

        setRecommendedItems(transformedDailyNeeds);
        setTrendingItems(transformedTrending);
      }
    } catch (error) {
      console.error('Error fetching trending and daily needs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation refs
  const footerAnimation = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // Navigation and context hooks
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const defaultLocation = { address: 'Select Location' };
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Calculate standardized item dimensions for both carousels
  const standardItemDimensions = useMemo(() => {
    // Calculate font sizes based on screen dimensions
    const fontScaleFactor = Math.min(width / 375, height / 812);
    const titleFontSize = moderateScale(13 * fontScaleFactor);
    const priceFontSize = moderateScale(13 * fontScaleFactor);
    
    // Calculate appropriate gap based on screen size
    const itemGapPercentage = 0.05; // 5% of screen width
    const itemGap = horizontalScale(Math.min(24, width * itemGapPercentage));
    
    // Calculate item width to ensure exactly 2 items are visible
    const sidePadding = horizontalScale(16);
    const totalHorizontalPadding = sidePadding * 2;
    const availableWidth = width - totalHorizontalPadding;
    const itemWidth = (availableWidth - itemGap) / 2; // Always show 2 items
    
    // Calculate image dimensions with appropriate aspect ratio
    const imageAspectRatio = 4/3; // Standard aspect ratio
    const baseImageHeight = itemWidth / imageAspectRatio;
    
    // Adjust image height based on screen size with min/max constraints
    const minImageHeight = verticalScale(60);
    const maxImageHeight = verticalScale(90);
    const imageHeight = Math.min(maxImageHeight, Math.max(minImageHeight, baseImageHeight));
    
    // Calculate text area height for both price and non-price versions
    const titleLineHeight = titleFontSize * 1.3;
    const priceLineHeight = priceFontSize * 1.3;
    const textAreaHeight = verticalScale(Math.ceil(titleLineHeight + priceLineHeight + 8));
    
    // Calculate final card height
    const cardHeight = imageHeight + textAreaHeight + verticalScale(6);
    
    return {
      itemWidth,
      itemGap,
      cardHeight,
      imageHeight,
      fontSizes: {
        title: titleFontSize,
        price: priceFontSize
      }
    };
  }, [width, height, horizontalScale, verticalScale, moderateScale]);

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
    const historyHeight = verticalScale(90); // Always allocate height
    
    // Add spacing between history and first carousel
    const historyBottomMargin = verticalScale(10); // Always allocate bottom margin
    
    // Top margin for recommended section
    const recommendedTopMargin = verticalScale(10);
    
    // Footer height
    const footerHeight = verticalScale(70);
    
    // Dynamic spacing between carousels based on screen height
    const carouselGap = Math.max(verticalScale(1), Math.floor(height * .005)); // 0.5% of screen height
    
    // Calculate standardized height for each carousel section (title + items)
    const sectionTitleHeight = verticalScale(30);
    const carouselItemHeight = standardItemDimensions.cardHeight;
    const standardCarouselHeight = sectionTitleHeight + carouselItemHeight + verticalScale(10);
    
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
    
    // Make both carousel sections equal height
    // Use a height that works for both carousels, considering we need space for two of them
    const equalCarouselHeight = Math.min(
      standardCarouselHeight,
      (availableSpace - carouselGap) / 2.3
    );
    
    return {
      headerHeight,
      promoHeight,
      searchBarBottomSpace,
      historyTopMargin,
      historyHeight,
      historyBottomMargin,
      recommendedTopMargin,
      carouselHeight: equalCarouselHeight,
      carouselGap,
      footerHeight
    };
  }, [height, searchHistory.length, verticalScale, standardItemDimensions]);

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
    
    // Fetch trending and daily needs data
    fetchTrendingAndDailyNeeds();

    // Fetch promo image URL from backend
    const fetchPromoImage = async () => {
      try {
        const response = await fetch('http://noble-raven-entirely.ngrok-free.app/api/bg_image');
        if (!response.ok) {
          console.error('Failed to fetch promo image, status:', response.status);
          return;
        }
        const data = await response.json();
        console.log('Promo image API response:', data);
        if (Array.isArray(data) && data.length > 0 && data[0].image_url) {
          setPromoImageUrl(data[0].image_url);
        } else {
          console.warn('Promo image API returned empty or invalid data');
        }
      } catch (error) {
        console.error('Error fetching promo image:', error);
      }
    };

    fetchPromoImage();
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
              currentLocation={currentLocation || { address: 'Select Location' }}
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
              source={{ uri: promoImageUrl }}
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
          {/* Always render the Search History section */}
          {(
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
            
            {/* Recommended Section */}
            {isLoading ? (
              <View style={{ height: layoutProportions.carouselHeight, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading daily needs...</Text>
              </View>
            ) : (
              <CarouselSection
                title="Recommended Daily Needs"
                items={recommendedItems}
                scales={{ horizontalScale, verticalScale, moderateScale }}
                carouselHeight={layoutProportions.carouselHeight}
                onItemPress={handleItemPress}
                showPrices={false} // Hide prices for all items
                standardCardHeight={standardItemDimensions.cardHeight}
                standardImageHeight={standardItemDimensions.imageHeight}
                standardItemWidth={standardItemDimensions.itemWidth}
                standardItemGap={standardItemDimensions.itemGap}
                standardFontSizes={standardItemDimensions.fontSizes}
              />
            )}
            
            {/* Minimal space between carousels */}
            {layoutProportions.carouselGap > 0 && (
              <View style={{ height: layoutProportions.carouselGap }} />
            )}
            
            {/* Trending Section */}
            {isLoading ? (
              <View style={{ height: layoutProportions.carouselHeight, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading trending items...</Text>
              </View>
            ) : (
              <CarouselSection
                title="Trending Items"
                items={trendingItems}
                scales={{ horizontalScale, verticalScale, moderateScale }}
                carouselHeight={layoutProportions.carouselHeight}
                onItemPress={handleItemPress}
                showPrices={false}
                standardCardHeight={standardItemDimensions.cardHeight}
                standardImageHeight={standardItemDimensions.imageHeight}
                standardItemWidth={standardItemDimensions.itemWidth}
                standardItemGap={standardItemDimensions.itemGap}
                standardFontSizes={standardItemDimensions.fontSizes}
                autoScrollInterval={5000} // 5 seconds interval for trending items
              />
            )}
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