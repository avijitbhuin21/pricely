import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  image: string;
  quantity: string;
  shopName: string;
  price: string;
  url: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
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

  const isInCart = (id: string) => {
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
