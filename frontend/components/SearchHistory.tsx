// SearchHistory.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Style constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VISIBLE_ITEMS = 3;
const ITEM_WIDTH = Math.floor((SCREEN_WIDTH - 65) / VISIBLE_ITEMS);
const ITEM_MARGIN = 4;

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
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        pagingEnabled
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
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    marginLeft: 8,
  },
  carouselContainer: {
    paddingHorizontal: 4,
  },
  historyItem: {
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#E8099C',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#transparent',
  },
  historyImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  historyText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SearchHistory;