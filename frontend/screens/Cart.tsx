import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedBackground } from '../components/AnimatedBackground';
import Header from '../components/Header';
import { useLocation } from '../contexts/LocationContext';
import { useCart } from '../contexts/CartContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
type RootStackParamList = {
  Home: undefined;
  Cart: undefined;
  CompareResult: { query: string };
};

interface CartItemProps {
  item: {
    id: string;
    name: string;
    image: string;
    quantity: string;
    shopName: string;
    price: string;
    url: string;
  };
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  const handleBuyNow = async () => {
    if (item.url) {
      await Linking.openURL(item.url);
    } else {
      Alert.alert('URL not found', `No buy link available for ${item.name} from ${item.shopName}`);
    }
  };

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <Text style={styles.shopName}>{item.shopName}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{item.price}</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleBuyNow}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Buy</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(item.id)}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5253']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const { cartItems, removeFromCart, clearCart } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price), 0);
  };

  const calculateDiscount = () => {
    // 10% discount
    return calculateTotal() * 0.1;
  };

  const handleBuyNow = (shopName: string, itemName: string) => {
    Alert.alert(
      'Buy Item',
      `Would you like to purchase ${itemName} from ${shopName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Buy',
          onPress: () => {
            Alert.alert('Success', 'Purchase initiated successfully!');
          },
        },
      ]
    );
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
      <View style={styles.content}>
        <Text style={styles.title}>Your Cart</Text>

        {/* Cart Items Section */}
        <View style={styles.cartSection}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.sectionGradient}
          >
            <ScrollView
              style={styles.cartItemsContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cartItemsContent}
            >
              {cartItems.length === 0 ? (
                <View style={styles.emptyCart}>
                  <MaterialCommunityIcons name="cart-outline" size={48} color="#666" />
                  <Text style={styles.emptyCartText}>Your cart is empty</Text>
                </View>
              ) : (
                cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromCart}
                  />
                ))
              )}
            </ScrollView>
          </LinearGradient>
        </View>

        {/* Order Summary Section */}
        <View style={styles.summarySection}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.sectionGradient}
          >
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>₹{calculateTotal().toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount (10%)</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -₹{calculateDiscount().toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Final Amount</Text>
              <Text style={styles.totalValue}>
                ₹{(calculateTotal() - calculateDiscount()).toFixed(2)}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={24} color="#2196F3" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2196F3" />
          <Text style={styles.navText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 12,
    paddingBottom: 100, // Account for bottom navigation
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cartSection: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cartItemsContainer: {
    minHeight: 100,
    maxHeight: '100%',
  },
  cartItemsContent: {
    flexGrow: 1,
  },
  sectionGradient: {
    padding: 16,
    borderRadius: 16,
  },
  emptyCart: {
    alignItems: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  shopName: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    minWidth: 100,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2ecc71',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyButton: {
    overflow: 'hidden',
    borderRadius: 16,
    marginRight: 8,
  },
  removeButton: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  buttonGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  summarySection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 'auto', // Push to bottom of available space
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  discountText: {
    color: '#2ecc71',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  orderButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  orderButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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

export default CartScreen;