import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

interface FooterProps {
  navigation: NavigationProp<RootStackParamList>;
  activeTab: string;
  setActiveTab: (tab: 'offers' | 'home' | 'cart') => void;
}

export default function Footer({ navigation, activeTab, setActiveTab }: FooterProps) {
  const offersScale = React.useRef(new Animated.Value(1)).current;
  const cartScale = React.useRef(new Animated.Value(1)).current;

  const animateoffersIcon = () => {
    Animated.sequence([
      Animated.timing(offersScale, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(offersScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatecartIcon = () => {
    Animated.sequence([
      Animated.timing(cartScale, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(cartScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabPress = (tabName: 'offers' | 'home' | 'cart') => {
    setActiveTab(tabName);
    if (tabName === 'offers') animateoffersIcon();
    if (tabName === 'cart') {
      animatecartIcon();
      navigation.navigate('Cart');
    }
    if (tabName === 'home') {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Offers' }))}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: offersScale }] }}>
          <Ionicons
            name="pricetag"
            size={24}
            color={activeTab === 'offers' ? '#fff' : '#f0f0f0'}
          />
        </Animated.View>
        <Text style={[
          styles.buttonText,
          activeTab === 'offers' && styles.activeButtonText
        ]}>Offers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Animated.View>
          <Ionicons
            name="home"
            size={24}
            color={activeTab === 'home' ? '#fff' : '#f0f0f0'}
          />
        </Animated.View>
        <Text style={[
          styles.buttonText,
          activeTab === 'home' && styles.activeButtonText
        ]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => handleTabPress('cart')}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: cartScale }] }}>
          <Ionicons
            name="cart"
            size={24}
            color="#fff"
          />
        </Animated.View>
        <Text style={[
          styles.buttonText,
          activeTab === 'cart' && styles.activeButtonText
        ]}>Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E8099C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  buttonText: {
    fontFamily: 'Poppins',
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  activeButtonText: {
    fontFamily: 'Poppins',
    color: '#fff',
    fontWeight: '600',
  },
});