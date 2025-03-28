// SearchHistory.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Style constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VISIBLE_ITEMS = 5; // Show 5 items at a time
const ITEM_WIDTH = Math.floor((SCREEN_WIDTH - 10) / VISIBLE_ITEMS); // Reduced overall margin
const ITEM_MARGIN = 1; // Reduced spacing between items

export interface SearchHistoryProps {
  searches: Array<{
    query: string;
    imageUrl?: string;
  }>;
  onSearchPress: (query: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ searches, onSearchPress }) => {
  if (searches.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Searches</Text>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        decelerationRate="fast"
     >
        {[...searches].reverse().map((item, index) => (
          <Pressable
            key={index}
            style={[
              styles.historyItem,
              { width: ITEM_WIDTH - ITEM_MARGIN * 2 }
            ]}
            onPress={() => onSearchPress(item.query)}
          >
            <View style={styles.imageContainer}>
              {item.imageUrl ? (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={styles.historyImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={24} color="#666" />
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.historyText} numberOfLines={2} ellipsizeMode="tail">
                {item.query}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 0, // Remove bottom margin
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8, // Further reduced margin
    marginLeft: 6,
  },
  carouselContainer: {
    paddingHorizontal: ITEM_MARGIN, // Match item margin
  },
  historyItem: {
    alignItems: 'center',
    marginHorizontal: ITEM_MARGIN,
    backgroundColor: '#fff',
    borderRadius: 8, // Smaller border radius
    padding: 0, // Minimal padding
  },
  imageContainer: {
    width: 70, // Smaller size to fit 5 items
    height: 70, // Smaller size to fit 5 items
    borderRadius: 35, // Half of width/height
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8, // Reduced margin
    borderWidth: 1, // Add border width
    borderColor: 'rgba(0, 0, 0, 0.2)', // Light black border for better visibility
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
  },
  historyImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    borderColor: '#00000010', // Lighter border color
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  historyText: {
    fontSize: 12, // Smaller font size to match smaller items
    color: '#333',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default SearchHistory;