import React, { useState, useEffect } from 'react';
import comparisonData from '../JSONfiles/comparison.json';
import { useLocation } from '../contexts/LocationContext';
import { useCart } from '../contexts/CartContext';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedBackground } from '../components/AnimatedBackground';
import Header from '../components/Header';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  Home: undefined;
  Cart: undefined;
  CompareResult: { query: string };
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
  }[];
}

const ComparisonCard: React.FC<{
  item: CompareResultItem;
  opacity: Animated.Value;
  onAddToCart: (shopName: string, price: string, remove: boolean) => void;
  isInCart: (shopId: string) => boolean;
}> = ({ item, opacity, onAddToCart, isInCart }) => (
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
      }
    ]}
  >
    <LinearGradient
      colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)']}
      style={styles.cardGradient}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <View style={styles.shopsContainer}>
          {item.shops.map((shop, index) => (
            <View key={index} style={styles.shopItem}>
              <View style={styles.shopInfo}>
                <MaterialCommunityIcons
                  name={getShopIcon(shop.name)}
                  size={20}
                  color="#333"
                  style={styles.shopIcon}
                />
                <Text style={styles.shopName}>{shop.name}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{shop.price}</Text>
                {isInCart(`${item.id}-${shop.name}`) ? (
                  <TouchableOpacity
                    onPress={() => onAddToCart(shop.name, shop.price, true)}
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
                    onPress={() => onAddToCart(shop.name, shop.price, false)}
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
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  </Animated.View>
);

const getShopIcon = (shopName: string) => {
  switch (shopName.toLowerCase()) {
    case 'blinkit':
      return 'lightning-bolt';
    case 'instamart':
      return 'cart';
    case 'bigbasket':
      return 'basket-outline';
    case 'dmart':
      return 'store';
    case 'zepto':
      return 'flash';
    default:
      return 'shopping';
  }
};

export default function CompareResultScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [compareData, setCompareData] = useState<CompareResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnims] = useState<Animated.Value[]>([]);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = () => {
    try {
      setCompareData(comparisonData.map((item, index) => ({
        id: index.toString(),
        image: item.data.image,
        name: item.data.name,
        quantity: item.data.quantity,
        shops: Object.entries(item.data.buy_button)
          .filter(([_, shopData]) => shopData !== undefined)
          .map(([shopName, shopData]) => ({
            name: shopName,
            price: shopData!.price,
            link: shopData!.url
          }))
      })));
    } catch (err) {
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
      addToCart({
        id: `${item.id}-${shopName}`,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        shopName: shopName,
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
      pairs.push(
        <View key={`pair-${i}`} style={styles.comparePair}>
          <ComparisonCard
            item={compareData[i]}
            opacity={fadeAnims[i] || new Animated.Value(1)}
            onAddToCart={(shopName, price, remove) => handleCartAction(compareData[i], shopName, price, remove)}
            isInCart={isInCart}
          />
          {i + 1 < compareData.length && (
            <ComparisonCard
              item={compareData[i + 1]}
              opacity={fadeAnims[i + 1] || new Animated.Value(1)}
              onAddToCart={(shopName, price, remove) => handleCartAction(compareData[i + 1], shopName, price, remove)}
              isInCart={isInCart}
            />
          )}
        </View>
      );
    }
    return pairs;
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <Header
        userName="Demo"
        currentLocation={currentLocation}
        onLocationSelect={updateLocation}
        onAutoLocate={autoLocate}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Compare Results</Text>
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
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#2196F3" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={24} color="#2196F3" />
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 100,
  },
  cardContainer: {
    width: '100%',
  },
  comparePair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    width: Dimensions.get('window').width * 0.45,
    minHeight: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardGradient: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 20,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  shopsContainer: {
    marginTop: 8,
  },
  shopItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopIcon: {
    marginRight: 8,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ecc71',
  },
  button: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  buttonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
  },
  error: {
    color: '#ff6b6b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navText: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
    fontWeight: '500',
  },
});
