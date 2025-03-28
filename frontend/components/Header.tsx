import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  ListRenderItem,
  Image,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HeaderProps, Location } from '../types';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../contexts/LocationContext';

const AUTO_LOCATE: Location = { 
  id: 'auto', 
  name: 'Auto Locate', 
  isAutoLocate: true 
};

const Header: React.FC<HeaderProps> = ({
  userName,
  currentLocation,
  onLocationSelect,
  onAutoLocate,
}): React.ReactElement => {
  const navigation = useNavigation();
  const { searchLocations: searchLocationsFromContext } = useLocation();
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([AUTO_LOCATE]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([AUTO_LOCATE]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchLocationsFromContext(query);
      
      if (Array.isArray(results)) {
        const locationResults = results.map((item) => ({
          id: item.id,
          name: item.description.split(',')[0],
          fullName: item.description
        }));

        setSearchResults(locationResults.length > 0
          ? [AUTO_LOCATE, ...locationResults]
          : [AUTO_LOCATE]
        );
      } else {
        setSearchResults([AUTO_LOCATE]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([AUTO_LOCATE]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  const handleLocationSelect = (location: Location) => {
    if (location.isAutoLocate) {
      onAutoLocate();
    } else {
      // Extract the main location name from the full description
      // Google Places results have descriptions like "New York, NY, USA"
      const mainLocationName = location.name.split(',')[0].trim();
      onLocationSelect(mainLocationName);
    }
    setLocationModalVisible(false);
    setSearchQuery('');
    setSearchResults([AUTO_LOCATE]); // Reset search results
  };

  const handleProfilePress = () => {
    //@ts-ignore
    navigation.navigate('Profile');
  };

  const [isMenuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const handleMenuPress = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleMenuClose = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const renderLocationItem: ListRenderItem<Location> = ({ item }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <Ionicons
        name={item.isAutoLocate ? "navigate" : "location-outline"}
        size={20}
        color={item.isAutoLocate ? "#007AFF" : "#333"}
      />
      <View style={styles.locationTextContainer}>
        <Text style={[
          styles.locationItemText,
          item.isAutoLocate && styles.autoLocateText
        ]}>
          {item.name}
        </Text>
        {item.fullName && !item.isAutoLocate && (
          <Text style={styles.locationFullName} numberOfLines={1}>
            {item.fullName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          onPress={handleMenuPress}
          style={[styles.hamburgerIconContainer, { width: 60 }]}
        >
          <View style={[styles.hamburgerLine, { width: 45 }]} aria-label="Menu button top line" />
          <View style={[styles.hamburgerLine, { width: 45 }]} aria-label="Menu button middle line" />
          <View style={[styles.hamburgerLine, { width: 45 }]} aria-label="Menu button bottom line" />
        </TouchableOpacity>
        <View style={styles.textAndLocationContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>PRICELY</Text>
              <Text style={styles.compareText}>compare it</Text>
            </View>
            <TouchableOpacity
              style={styles.locationButton}
          onPress={() => {
            if (currentLocation !== 'Detecting location...') {
              setLocationModalVisible(true);
            }
          }}
          disabled={currentLocation === 'Detecting location...'}
        >
          <Text
            style={styles.locationText}
            numberOfLines={1}
          >
            {currentLocation}
          </Text>
          {currentLocation !== 'Detecting location...' && (
            <Ionicons name="chevron-down" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
      </View>

      <Modal
        visible={isLocationModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity
                onPress={() => setLocationModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#757575" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location..."
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoFocus
              />
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={20} color="#757575" />
                </View>
              )}
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderLocationItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                !isLoading && searchQuery.length >= 3 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No locations found</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={isMenuVisible}
        animationType="fade"
        transparent
        onRequestClose={handleMenuClose}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={handleMenuClose}
        >
          <Animated.View style={[
            styles.menuContent,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}>
            <View style={styles.menuHeader}>
              <View style={styles.menuTitleContainer}>
                <Text style={styles.menuTitleText}>PRICELY</Text>
                <Text style={styles.menuCompareText}>compare it</Text>
              </View>
              <TouchableOpacity
                style={styles.menuCloseButton}
                onPress={handleMenuClose}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => {
                  handleProfilePress();
                  handleMenuClose();
                }}
              >
                <Ionicons name="person-outline" size={22} color="#C60053" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: Implement contact us functionality
                  handleMenuClose();
                }}
              >
                <Ionicons name="mail-outline" size={22} color="#C60053" />
                <Text style={styles.menuItemText}>Contact Us</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C60053',
    minHeight: 80,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Changed alignment
  },
  textAndLocationContainer: {
    marginLeft: 10, // Increased margin
    justifyContent: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
  },
  compareText: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
    marginLeft: 4,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Transparent background
    borderRadius: 20,
  },
  locationText: {
    fontSize: 16, // Increased font size
    color: '#ffffff',
  },
  hamburgerIconContainer: {
    justifyContent: 'space-between', // Change to space-between for better line distribution
    height: 40, // Increased container height
    width: 45, // Increased container width
    alignSelf: 'center',
    alignItems: 'flex-start',
    paddingVertical: 2, // Add vertical padding
  },
  hamburgerLine: {
    height: 4, // Increased line height
    backgroundColor: '#ffffff',
    borderRadius: 3, // Increased border radius
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    marginLeft: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationItemText: {
    fontSize: 16,
    color: '#333',
  },
  locationFullName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  autoLocateText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  menuHeader: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#C60053',
  },
  menuTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 8,
  },
  menuTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
    letterSpacing: 1,
  },
  menuCompareText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
    marginLeft: 6,
    opacity: 0.9,
  },
  menuCloseButton: {
    position: 'absolute',
    right: 16,
    top: 40,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  menuItems: {
    paddingTop: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    transform: [{scale: 1}],
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Header;
