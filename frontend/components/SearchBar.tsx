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
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle breathing animation for the search bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.4],
            }),
          }
        ]}
      >
        <Ionicons
          name="search"
          size={22}
          color="rgba(128, 229, 255, 0.8)"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="rgba(128, 229, 255, 0.5)"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          onPress={onSearch}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.searchButton}
        >
          <Animated.View style={[
            styles.buttonContent,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <Ionicons name="arrow-forward" size={24} color="rgba(128, 229, 255, 0.8)" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(2, 5, 20, 0.85)',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#80e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 229, 255, 0.4)',
    width: '100%',
    maxWidth: 500,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 10,
    color: '#ffffff',
    fontSize: 16,
    textShadowColor: 'rgba(128, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  searchButton: {
    marginLeft: 10,
  },
  buttonContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128, 229, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 255, 0.4)',
  },
});

export default SearchBar;