import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { useLocation } from '../contexts/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../contexts/CartContext';
import { RootStackParamList } from '../navigation/AppNavigator';

// Import shop logos
const shopLogos: { [key: string]: ImageSourcePropType } = {
  blinkit: require('../assets/logos/blinkit.png'),
  instamart: require('../assets/logos/instamart.png'),
  bigbasket: require('../assets/logos/bigbasket.png'),
  dmart: require('../assets/logos/d-mart.png'),
  zepto: require('../assets/logos/zepto.png'),
};

interface CompareResultItem {
  id: string;
  image: string;
  name: string;
  quantity: string;
  shops: {
    name: string;
    price: string;
    link: string;
    quantity: string;
  }[];
}

const ComparisonCard: React.FC<{
  item: CompareResultItem;
  opacity: Animated.Value;
  onAddToCart: (item: CompareResultItem, shopName: string, price: string, remove: boolean) => void;
  isInCart: (shopId: string) => boolean;
  style?: any;
}> = ({ item, opacity, onAddToCart, isInCart, style }) => {
  const displayQuantity = item.shops.length > 0 ? item.shops[0].quantity : item.quantity;
  const areAllItemsInCart = item.shops.every(shop => isInCart(`${item.id}-${shop.name}`));

  const handleAddAllItems = () => {
    const shouldRemove = areAllItemsInCart;
    item.shops.forEach(shop => {
      onAddToCart(item, shop.name, shop.price, shouldRemove);
    });
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{
            translateY: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        },
        style
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
        style={styles.cardGradient}
      >
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardContent}>
          <View style={styles.topContent}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <View style={styles.shopsContainer}>
              {item.shops.map((shop, index) => (
                <View key={index} style={styles.shopItem}>
                  <Image
                    source={getShopLogo(shop.name)}
                    style={styles.shopIcon}
                    resizeMode="contain"
                  />
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{shop.price}</Text>
                    <Text style={styles.shopQuantity}>{shop.quantity}</Text>
                  </View>
                  {isInCart(`${item.id}-${shop.name}`) ? (
                    <TouchableOpacity
                      onPress={() => onAddToCart(item, shop.name, shop.price, true)}
                      style={styles.button}
                    >
                      <LinearGradient
                        colors={['#ff6b6b', '#ee5253']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Ionicons name="remove" size={16} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => onAddToCart(item, shop.name, shop.price, false)}
                      style={styles.button}
                    >
                      <LinearGradient
                        colors={['#2ecc71', '#27ae60']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.bottomContent}>
            <TouchableOpacity
              style={styles.addAllButton}
              onPress={handleAddAllItems}
            >
              <LinearGradient
                colors={areAllItemsInCart ? ['#ff6b6b', '#ee5253'] : ['#4c669f', '#3b5998', '#192f6a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addAllButtonGradient}
              >
                <Text style={styles.addAllButtonText}>
                  {areAllItemsInCart ? 'Remove all items' : 'Add all items'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const getShopLogo = (shopName: string): ImageSourcePropType => {
  const key = shopName.toLowerCase();
  return shopLogos[key] || shopLogos['bigbasket']; // fallback to bigbasket if logo not found
};

export default function CompareResultScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CompareResult'>>();
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [compareData, setCompareData] = useState<CompareResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnims] = useState<Animated.Value[]>([]);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    console.log('Initiating comparison data fetch...');
    fetchComparisonData().catch(err => {
      console.error('Failed to fetch comparison data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    });
  }, [route.params?.query]); // Re-fetch when search query changes

  useEffect(() => {
    if (compareData.length > 0 && route.params?.onSearchComplete) {
      const firstProductImage = compareData[0].image;
      route.params.onSearchComplete(firstProductImage);
    }
  }, [compareData, route.params?.onSearchComplete]);

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get coordinates from AsyncStorage
      const lat = await AsyncStorage.getItem('pricely_lat') || '22.6382939';
      const lon = await AsyncStorage.getItem('pricely_lon') || '88.448261';
      const item_name = route.params?.query || '';

      // Prepare request payload
      const payload = {
        item_name,
        lat,
        lon,
        credentials: null
      };

      // Make API call
      const response = await fetch('https://noble-raven-entirely.ngrok-free.app/get-search-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2));
      
      if (!result.data?.data || !Array.isArray(result.data.data)) {
        throw new Error('Invalid response format: expected data.data array');
      }

      // Transform API response to match expected format
      const transformedData = result.data.data.map((item: any, index: number) => {
        if (!item) {
          console.error('Invalid item format:', item);
          return null;
        }

        // Create shops array from price array
        const shops = (item.price || []).map((priceData: any) => ({
          name: priceData.store.toLowerCase(),
          price: priceData.price.toString(),
          link: priceData.url,
          quantity: priceData.quantity
        }));

        return {
          id: index.toString(),
          image: item.image,
          name: item.name,
          quantity: shops[0]?.quantity || '', // Use quantity from first price entry
          shops: shops
        };
      }).filter(Boolean);

      if (transformedData.length === 0) {
        throw new Error('No valid items found in response');
      }

      setCompareData(transformedData);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCartAction = (item: CompareResultItem, shopName: string, price: string, remove: boolean) => {
    if (remove) {
      removeFromCart(`${item.id}-${shopName}`);
      Toast.show({
        type: 'info',
        text1: 'Removed from Cart',
        text2: `${item.name} from ${shopName} removed from your cart`,
        position: 'bottom',
      });
    } else {
      // Capitalize shop name to match Cart screen's vendor names
      let capitalizedShopName = shopName.charAt(0).toUpperCase() + shopName.slice(1);
      // Fix case for special vendor names
      if (capitalizedShopName === "Dmart") {
        capitalizedShopName = "DMart";
      } else if (capitalizedShopName === "Bigbasket") {
        capitalizedShopName = "BigBasket";
      }
      addToCart({
        id: `${item.id}-${shopName}`,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        shopName: capitalizedShopName,
        price: price,
        url: item.shops.find(shop => shop.name === shopName)?.link || ''
      });
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${item.name} from ${shopName} added to your cart`,
        position: 'bottom',
      });
    }
  };

  const renderComparisonPairs = () => {
    const pairs = [];
    for (let i = 0; i < compareData.length; i += 2) {
      const firstCard = compareData[i];
      const secondCard = i + 1 < compareData.length ? compareData[i + 1] : null;
      
      // Calculate dynamic height based on number of shops
      const firstCardShops = firstCard.shops.length;
      const secondCardShops = secondCard ? secondCard.shops.length : 0;
      const maxShops = Math.max(firstCardShops, secondCardShops);
      
      // Calculate exact height needed
      const imageHeight = 160;
      const headerHeight = 65; // Reduced space for name and quantity
      const shopItemHeight = Dimensions.get('window').height * 0.056;
      const bottomButtonHeight = Dimensions.get('window').height * 0.06;
      const padding = Dimensions.get('window').height * 0.025;
      
      // Calculate height needed for all items
      const contentHeight = headerHeight + (maxShops * shopItemHeight) + bottomButtonHeight + padding;
      const minHeight = imageHeight + contentHeight;
      
      const cardStyle = { minHeight };

      pairs.push(
        <View key={`pair-${i}`} style={styles.comparePair}>
          <ComparisonCard
            item={compareData[i]}
            opacity={fadeAnims[i] || new Animated.Value(1)}
            onAddToCart={(item, shopName, price, remove) => handleCartAction(item, shopName, price, remove)}
            isInCart={isInCart}
            style={cardStyle}
          />
          {i + 1 < compareData.length && (
            <ComparisonCard
              item={compareData[i + 1]}
              opacity={fadeAnims[i + 1] || new Animated.Value(1)}
              onAddToCart={(item, shopName, price, remove) => handleCartAction(item, shopName, price, remove)}
              isInCart={isInCart}
              style={cardStyle}
            />
          )}
        </View>
      );
    }
    return pairs;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        userName="Demo"
        currentLocation={currentLocation}
        onLocationSelect={updateLocation}
        onAutoLocate={autoLocate}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.message}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={[styles.message, styles.error]}>{error}</Text>
          </View>
        ) : compareData.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>No results found</Text>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {renderComparisonPairs()}
          </View>
        )}
      </ScrollView>
      <Footer navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'snow',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    width: '100%',
  },
  comparePair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  card: {
    width: Dimensions.get('window').width * 0.45,
    backgroundColor: 'white',
    borderRadius: Dimensions.get('window').width * 0.035,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 1, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardGradient: {
    backgroundColor: 'white',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').height * 0.2,
    maxHeight: 160,
    borderTopLeftRadius: Dimensions.get('window').width * 0.035,
    borderTopRightRadius: Dimensions.get('window').width * 0.035,
    backgroundColor: '#f8f8f8',
  },
  cardContent: {
    padding: Dimensions.get('window').width * 0.025,
    paddingBottom: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  topContent: {
    flex: 1,
  },
  bottomContent: {
    paddingTop: Dimensions.get('window').height * 0.008,
    paddingBottom: Dimensions.get('window').height * 0.008,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'white',
  },
  name: {
    fontFamily: 'Poppins',
    fontSize: Dimensions.get('window').width * 0.034,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: Dimensions.get('window').height * 0.004,
    lineHeight: Dimensions.get('window').width * 0.042,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.03)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  quantity: {
    fontFamily: 'Poppins',
    fontSize: Dimensions.get('window').width * 0.03,
    color: '#666',
    marginBottom: Dimensions.get('window').height * 0.006,
    fontWeight: '500',
    opacity: 0.9,
  },
  shopsContainer: {
    marginTop: Dimensions.get('window').height * 0.006,
    flexDirection: 'column',
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Dimensions.get('window').height * 0.008,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    height: Dimensions.get('window').height * 0.056,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
  },
  shopIcon: {
    width: Dimensions.get('window').width * 0.065,
    height: Dimensions.get('window').width * 0.065,
    marginRight: Dimensions.get('window').width * 0.015,
    flexShrink: 0,
    opacity: 0.95,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: Dimensions.get('window').width * 0.008,
  },
  price: {
    fontFamily: 'Poppins',
    fontSize: Dimensions.get('window').width * 0.034,
    fontWeight: '700',
    color: '#2ecc71',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(46,204,113,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  shopQuantity: {
    fontFamily: 'Poppins',
    fontSize: Dimensions.get('window').width * 0.026,
    color: '#666',
    marginTop: 2,
    opacity: 0.9,
  },
  button: {
    overflow: 'hidden',
    borderRadius: Dimensions.get('window').width * 0.016,
    marginLeft: Dimensions.get('window').width * 0.015,
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.12)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonGradient: {
    paddingVertical: Dimensions.get('window').width * 0.014,
    paddingHorizontal: Dimensions.get('window').width * 0.014,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.065,
    height: Dimensions.get('window').width * 0.065,
    borderRadius: Dimensions.get('window').width * 0.016,
  },
  buttonText: {
    fontFamily: 'Poppins',
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 24,
  },
  message: {
    fontFamily: 'Poppins',
    fontSize: 18,
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  error: {
    color: '#ff6b6b',
    opacity: 0.9,
  },
  title: {
    fontFamily: 'ARCHIVE',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addAllButton: {
    borderRadius: Dimensions.get('window').width * 0.02,
    overflow: 'hidden',
    marginTop: Dimensions.get('window').height * 0.008,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addAllButtonGradient: {
    paddingVertical: Dimensions.get('window').height * 0.01,
    paddingHorizontal: Dimensions.get('window').width * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height * 0.042,
  },
  addAllButtonText: {
    fontFamily: 'Poppins',
    fontSize: Dimensions.get('window').width * 0.032,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});