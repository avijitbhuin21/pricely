// SearchBar.tsx
import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBarProps } from '../types';

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  value,
  onChangeText,
  onSubmitEditing
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
        <TextInput
          style={styles.input}
          placeholder="Search for products..."
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
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
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    color: '#333',
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