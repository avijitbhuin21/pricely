// SearchHistory.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchHistoryProps } from '../types';

const ITEM_HEIGHT = 48; // height of a single search history item

const SearchHistory: React.FC<SearchHistoryProps> = ({ searches, onSearchPress, onClearHistory, onDeleteSearch }) => {
  if (searches.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <TouchableOpacity
          onPress={onClearHistory}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={[styles.historyList, { maxHeight: searches.length > 3 ? ITEM_HEIGHT * 3 : 'auto' }]}
        showsVerticalScrollIndicator={true}
      >
        {searches.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.historyItem,
              pressed && styles.historyItemPressed
            ]}
            onPress={() => onSearchPress(item)}
            android_ripple={{ color: 'rgba(232, 9, 156, 0.1)' }}
          >
            <View style={styles.historyItemContent}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.historyText} numberOfLines={1} ellipsizeMode="tail">
                {item}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onDeleteSearch(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteButton}
            >
              <Ionicons name="close-outline" size={20} color="#666" />
            </TouchableOpacity>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#E8099C',
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    width: '100%',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  historyItemPressed: {
    backgroundColor: 'rgba(232, 9, 156, 0.05)',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  historyText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
});

export default SearchHistory;
