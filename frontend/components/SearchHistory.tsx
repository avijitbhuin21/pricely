import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchHistoryProps } from '../types';

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {searches.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.historyItem,
              pressed && styles.historyItemPressed
            ]}
            onPress={() => onSearchPress(item)}
            android_ripple={{ color: 'rgba(128, 229, 255, 0.2)' }}
          >
            <View style={styles.historyItemContent}>
              <Ionicons name="time-outline" size={20} color="rgba(128, 229, 255, 0.8)" />
              <Text style={styles.historyText} numberOfLines={1} ellipsizeMode="tail">
                {item}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onDeleteSearch(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteButton}
            >
              <Ionicons name="close-outline" size={20} color="rgba(128, 229, 255, 0.8)" />
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
    backgroundColor: 'rgba(2, 5, 20, 0.85)',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#80e5ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    margin: 20,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(128, 229, 255, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(128, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(128, 229, 255, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 255, 0.4)',
  },
  clearButtonText: {
    color: '#80e5ff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(128, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scrollView: {
    maxHeight: 250,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 229, 255, 0.2)',
    justifyContent: 'space-between',
  },
  historyItemPressed: {
    backgroundColor: 'rgba(128, 229, 255, 0.1)',
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
    color: '#ffffff',
    flex: 1,
    textShadowColor: 'rgba(128, 229, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(128, 229, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(128, 229, 255, 0.3)',
  },
});

export default SearchHistory;