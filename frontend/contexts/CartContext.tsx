import React, { createContext, useContext, useState } from 'react';

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    if (!isInCart(item.id)) {
      setCartItems(prev => [...prev, item]);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (id: string, searchId?: string) => {
    // Extract the base item ID without the shop name
    const [baseId, shopName] = id.split('-');
    
    // First check if exact item is in cart
    const exactMatch = cartItems.some(item => item.id === id);
    if (exactMatch) {
      return true;
    }
    
    // If no exact match, check if same item from same shop exists in cart
    return cartItems.some(item => {
      const [itemBaseId, itemShopName] = item.id.split('-');
      return itemBaseId === baseId && itemShopName === shopName;
    });
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
      calculateVendorTotal
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