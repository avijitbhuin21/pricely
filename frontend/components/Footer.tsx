import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Easing, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

interface FooterProps {
  navigation: NavigationProp<RootStackParamList>;
  activeTab: string;
  setActiveTab: (tab: 'home' | 'cart') => void;
}

export default function Footer({ navigation, activeTab, setActiveTab }: FooterProps) {
  const cartScale = React.useRef(new Animated.Value(1)).current;
  const homeScale = React.useRef(new Animated.Value(1)).current;

  const animateHomeIcon = () => {
    Animated.sequence([
      Animated.timing(homeScale, { toValue: 1.2, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(homeScale, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const animateCartIcon = () => {
    Animated.sequence([
      Animated.timing(cartScale, { toValue: 1.2, duration: 100, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(cartScale, { toValue: 1, duration: 100, easing: Easing.linear, useNativeDriver: true }),
    ]).start();
  };

  const handleTabPress = (tabName: 'home' | 'cart') => {
    setActiveTab(tabName);
    if (tabName === 'cart') {
      animateCartIcon();
      navigation.navigate('Cart');
    }
    if (tabName === 'home') {
      animateHomeIcon();
      navigation.navigate('Home');
    }
  };

  const handleMemberPress = () => {
    navigation.navigate('Member');
  };

  // Determine icon names based on active tab
  const homeIconName = activeTab === 'home' ? 'home' : 'home-outline';
  const cartIconName = activeTab === 'cart' ? 'cart' : 'cart-outline';
  const iconColor = (tab: 'home' | 'cart') => activeTab === tab ? '#fff' : '#f0f0f0';

  return (
    <View style={styles.footerContainer}>
      {/* Member+ Button - positioned above footer */}
      <TouchableOpacity
        style={styles.memberButton}
        onPress={handleMemberPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: 'https://img.icons8.com/plasticine/100/crown.png' }}
          style={styles.crownImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      
      {/* Main Footer Bar */}
      <View style={styles.bottomNav}>
        {/* Home Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleTabPress('home')}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: homeScale }] }}>
            <Ionicons
              name={homeIconName}
              size={iconSize}
              color={iconColor('home')}
            />
          </Animated.View>
          <Text style={[
            styles.buttonText,
            activeTab === 'home' && styles.activeButtonText
          ]}>Home</Text>
        </TouchableOpacity>

        {/* Member+ Text - now in proper alignment with other texts */}
        <View style={styles.memberTextContainer}>
          <Text style={styles.memberButtonText}>Member+</Text>
        </View>

        {/* Cart Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleTabPress('cart')}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: cartScale }] }}>
            <Ionicons
              name={cartIconName}
              size={iconSize}
              color={iconColor('cart')}
            />
          </Animated.View>
          <Text style={[
            styles.buttonText,
            activeTab === 'cart' && styles.activeButtonText
          ]}>Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define base height/scaling factors
const footerHeight = screenHeight * 0.085;
const memberButtonSize = screenWidth * 0.16;
const iconSize = screenWidth * 0.06;
const crownImageSize = memberButtonSize * 0.75;
const fontSize = screenWidth * 0.03;

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: footerHeight + memberButtonSize * 0.5,
    alignItems: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: footerHeight,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start', // Align to top for proper text alignment
    backgroundColor: '#E8099C',
    paddingTop: footerHeight * 0.15, // Add padding to the top for proper spacing
    paddingHorizontal: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: footerHeight * 0.04,
    flex: 1,
  },
  buttonText: {
    fontFamily: 'Poppins',
    color: '#f0f0f0',
    fontSize: fontSize,
    marginTop: 4, // Consistent spacing for all text elements
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  memberButton: {
    position: 'absolute',
    top: 0,
    width: memberButtonSize,
    height: memberButtonSize,
    borderRadius: memberButtonSize / 2,
    backgroundColor: '#fff',
    borderColor: '#E8099C',
    borderWidth: memberButtonSize * 0.04,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 10,
  },
  crownImage: {
    width: crownImageSize,
    height: crownImageSize,
  },
  memberTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: footerHeight * 0.08,
  },
  memberButtonText: {
    fontFamily: 'Poppins',
    fontSize: fontSize,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 30, // Match the spacing of other text elements
  },
});