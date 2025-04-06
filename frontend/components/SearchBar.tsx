// SearchBar.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated, Easing, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBarProps } from '../types';

// Define the list of words for the placeholder
const placeholderWords = ["Milk", "Biscuits", "Ear-phone", "Frooti", "Coca-cola", "Chips", "Bread", "Eggs", "Butter", "Cheese", "Ice-cream", "Juice", "Vegetables", "Fruits", "Snacks", "Chocolates", "Cereals", "Pasta", "Rice", "Noodles", "Sauces", "Spices", "Condiments", "Frozen Foods", "Beverages"];

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  value,
  onChangeText,
  onSubmitEditing
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(25)).current; // Start from 25 units below
  const opacityAnim = useRef(new Animated.Value(0)).current; // Start fully transparent

  // Animation sequence for word transition
  const animateWord = () => {
    // Reset animation values
    slideAnim.setValue(25);
    opacityAnim.setValue(0);

    // Create animation sequence
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  };

  // Effect to change the placeholder word every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % placeholderWords.length);
      animateWord();
    }, 3000); // Change every 3000ms (3 seconds)

    // Initial animation
    animateWord();

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only once on mount

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#666"
          style={styles.searchIcon}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: value ? '#333' : 'transparent' }]}
            placeholder=""
            placeholderTextColor="transparent"
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {!value && (
            <View style={styles.placeholderContainer}>
              <Text style={styles.staticPlaceholder}>Search for </Text>
              <Animated.Text
                style={[
                  styles.animatedPlaceholder,
                  {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                  }
                ]}
              >
                "{placeholderWords[currentWordIndex]}"
              </Animated.Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={onSearch}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.searchButton}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  placeholderContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  staticPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  animatedPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
  },
  buttonContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8099C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;
