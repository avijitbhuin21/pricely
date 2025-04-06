import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation } from '../contexts/LocationContext';
import { useCart } from '../contexts/CartContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: screenWidth } = Dimensions.get('window');

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

interface VendorCartSectionProps {
  vendor: string;
  items: CartItemProps['item'][];
  onRemove: (id: string) => void;
  total: number;
}

const shopLogos: { [key: string]: any } = {
  Instamart: require('../assets/logos/instamart.png'),
  BigBasket: require('../assets/logos/bigbasket.png'),
  Blinkit: require('../assets/logos/blinkit.png'),
  DMart: require('../assets/logos/d-mart.png'),
  Zepto: require('../assets/logos/zepto.png'),
};

const vendorUrls = require('../JSONfiles/vendor_app_url.json');

const VendorCartSection: React.FC<VendorCartSectionProps> = ({ vendor, items, onRemove, total }) => {
  if (items.length === 0) {
    return null;
  }

  const handleOpenApp = async () => {
    try {
      const vendorKey = vendor === 'DMart' ? 'Dmart' : vendor;
      const url = vendorUrls[vendorKey];
      
      if (url) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', `Cannot open ${vendor} app/website`);
        }
      } else {
        Alert.alert('Error', `Could not find URL for ${vendor}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${vendor} app/website`);
    }
  };

  return (
    <View style={styles.vendorSection}>
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sectionGradient}
      >
        {/* Vendor Header with Logo and Price Info */}
        <View style={styles.vendorHeader}>
          <View style={styles.vendorInfoContainer}>
            <Image source={shopLogos[vendor]} style={styles.vendorLogo} resizeMode="contain" />
            <View style={styles.priceInfo}>
              <Text style={styles.itemsCount}>{items.length} item{items.length > 1 ? 's' : ''}</Text>
              <Text style={styles.totalPrice}>₹{total.toFixed(0)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.openAppButton} onPress={handleOpenApp}>
            <Text style={styles.openAppText}>Open App</Text>
            <Ionicons name="arrow-forward" size={16} color="#E8099C" />
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.itemsScroll}
          contentContainerStyle={styles.itemsScrollContent}
        >
          {items.map((item, index) => (
            <CartItem key={`${vendor}-${item.id}-${index}`} item={item} onRemove={onRemove} />
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

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
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          <TouchableOpacity style={styles.removeButton} onPress={() => onRemove(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
        <LinearGradient
          colors={['#FF7BEA', '#E8099C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buyButtonGradient}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
          <Ionicons name="flash" size={16} color="#fff" style={styles.buyButtonIcon} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const CartScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { currentLocation, updateLocation, autoLocate } = useLocation();
  const { cartItems, removeFromCart, getItemsByVendor, calculateVendorTotal } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Top Row with Back Button and Title */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={48} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>CART</Text>
          </View>
        </View>
        
        {/* Location Row */}
        <View style={styles.locationRow}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => {
              // Check the address property for the specific string
              if (currentLocation.address !== 'Detecting location...') {
                updateLocation(currentLocation);
              }
            }}
            disabled={currentLocation.address === 'Detecting location...'}
          >
            {/* Check the address property for the specific string */}
            {currentLocation.address !== 'Detecting location...' && (
              <Ionicons name="chevron-down" size={screenWidth * 0.05} color="#fff" style={styles.locationIcon} />
            )}
            <Text style={styles.locationText} numberOfLines={1}>
              {currentLocation.address}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <ScrollView
          style={styles.cartItemsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cartItemsContent}
        >
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <MaterialCommunityIcons name="cart-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add some items to get started</Text>
            </View>
          ) : (
            <>
              {['Blinkit', 'Instamart', 'Zepto', 'BigBasket', 'DMart'].map((vendor) => (
                <VendorCartSection
                  key={vendor}
                  vendor={vendor}
                  items={getItemsByVendor(vendor)}
                  onRemove={removeFromCart}
                  total={calculateVendorTotal(vendor)}
                />
              ))}
            </>
          )}
        </ScrollView>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#C60053',
    paddingHorizontal: screenWidth * 0.04,
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 50,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    paddingTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: screenWidth * 0.09,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
    letterSpacing: 1,
  },
  locationRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingLeft: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: screenWidth * 0.035,
    color: '#ffffff',
    flexShrink: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 20,
    position: 'relative'
  },
  vendorSection: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionGradient: {
    padding: 16,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vendorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorLogo: {
    width: 60,
    height: 30,
    marginRight: 12,
  },
  priceInfo: {
    marginLeft: 8,
  },
  itemsCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#64748b',
  },
  totalPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  openAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fce4f1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  openAppText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#E8099C',
    marginRight: 4,
  },
  itemsScroll: {
    marginHorizontal: -16,
  },
  itemsScrollContent: {
    paddingHorizontal: 16,
  },
  cartItem: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginBottom: 8,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  itemQuantity: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#1e293b',
  },
  removeButton: {
    padding: 4,
  },
  buyButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buyButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  buyButtonIcon: {
    marginLeft: 6,
  },
  cartItemsContainer: {
    flex: 1,
  },
  cartItemsContent: {
    paddingBottom: 20,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 40,
  },
  emptyCartText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
});

export default CartScreen;