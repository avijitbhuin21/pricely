import React, { useState, useRef } from 'react';
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
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Ionicons name="person-circle-outline" size={36} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/Pricely_app_icon.png')}
            style={styles.logo}
          />
        </View>
      </View>

      <View style={styles.rightContainer}>

        <TouchableOpacity
          style={[
            styles.locationButton,
            currentLocation === 'Detecting location...' && styles.pulsingLocationButton
          ]}
          onPress={() => {
            if (currentLocation !== 'Detecting location...') {
              setLocationModalVisible(true);
            }
          }}
          disabled={currentLocation === 'Detecting location...'}
        >
          <Ionicons
            name={currentLocation === 'Detecting location...' ? "locate" : "location"}
            size={18}
            color={currentLocation === 'Detecting location...' ? "#007AFF" : "#80e5ff"}
          />
          <Text
            style={[
              styles.locationText,
              currentLocation === 'Detecting location...' && { color: '#007AFF' }
            ]}
            numberOfLines={1}
          >
            {currentLocation}
          </Text>
          {currentLocation !== 'Detecting location...' && (
            <Ionicons name="chevron-down" size={16} color="#80e5ff" />
          )}
        </TouchableOpacity>
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
    </View>
  );
};

const WINDOW_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#C60053',
  },
  centerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    width: 44,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  profileButton: {
    padding: 4,
    marginLeft: -8,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#80e5ff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: WINDOW_WIDTH * 0.4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pulsingLocationButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  locationText: {
    marginHorizontal: 6,
    fontSize: 14,
    color: '#ffffff',
    maxWidth: WINDOW_WIDTH * 0.25,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
});

export default Header;