import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  name: string;
  image: string;
  quantity: string;
  shopName: string;
  price: string;
  url: string;
  searchId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string, searchId?: string) => boolean;
  getItemsByVendor: (vendor: string) => CartItem[];
  calculateVendorTotal: (vendor: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'PricelyCartItems';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("Failed to load cart items from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (!isLoading) { // Avoid saving initial empty state before loading
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
          console.error("Failed to save cart items to storage", error);
        }
      };
      saveCart();
    }
  }, [cartItems, isLoading]);

  const addToCart = (item: CartItem) => {
    // Check if item with the exact same ID already exists
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (!existingItem) {
      setCartItems(prev => [...prev, item]);
    } else {
      console.log("Item already in cart:", item.id);
      // Optionally: update quantity or show a message
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (id: string) => {
    // With unique IDs, we just need to check for the exact ID
    return cartItems.some(item => item.id === id);
  };

  const getItemsByVendor = (vendor: string) => {
    return cartItems.filter(item => item.shopName === vendor);
  };

  const calculateVendorTotal = (vendor: string) => {
    return getItemsByVendor(vendor)
      .reduce((total, item) => total + parseFloat(item.price), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
      getItemsByVendor,
      calculateVendorTotal,
      // isLoading // Optionally expose loading state if needed by UI
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};