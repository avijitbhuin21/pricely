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
import { HeaderProps, Location, LocationSuggestion } from '../types';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useLocation } from '../contexts/LocationContext';

const AUTO_LOCATE: LocationSuggestion = {
  id: 'auto',
  name: 'Auto Locate',
  isAutoLocate: true
};

const Header: React.FC<HeaderProps> = ({
  userName,
  currentLocation,
  onLocationSelect,
  onAutoLocate,
  showBackButton = false,
  hideHamburger = false,
}): React.ReactElement => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { searchLocations: searchLocationsFromContext } = useLocation();
  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSuggestion[]>([AUTO_LOCATE]);
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

  const handleLocationSelect = (locationSuggestion: LocationSuggestion) => {
    if (locationSuggestion.isAutoLocate) {
      onAutoLocate();
    } else {
      // Convert LocationSuggestion to Location
      const location: Location = {
        address: locationSuggestion.fullName || locationSuggestion.name,
      };
      onLocationSelect(location);
    }
    setLocationModalVisible(false);
    setSearchQuery('');
    setSearchResults([AUTO_LOCATE]); // Reset search results
  };

  const handleProfilePress = () => {
    //@ts-ignore
    navigation.navigate('Profile');
  };

  const handleMenuPress = () => {
    console.log('Hamburger pressed - navigating to Profile with slide animation');
    navigation.navigate('Profile');
  };

  const renderLocationItem: ListRenderItem<LocationSuggestion> = ({ item }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <Ionicons
        name={item.isAutoLocate ? "navigate" : "location-outline"}
        size={iconSizeSmall} // Dynamic size
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
      {/* Main content area */}
      <View style={styles.contentContainer}>
        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={iconSizeMedium} color="#ffffff" />
          </TouchableOpacity>
        )}
        {/* Text and Location section */}
        <View style={styles.textAndLocationContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>PRICELY</Text>
            <Text style={styles.compareText}>- Compare It</Text>
          </View>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => {
              if (currentLocation.address !== 'Detecting location...') {
                setLocationModalVisible(true);
              }
            }}
            disabled={currentLocation.address === 'Detecting location...'}
          >
            {/* Location Icon (moved to the left) */}
            {currentLocation.address !== 'Detecting location...' && (
              <Ionicons name="chevron-down" size={iconSizeSmall} color="#fff" style={styles.locationIconLeft} />
            )}
            <Text
              style={styles.locationText}
              numberOfLines={1}
            >
              {currentLocation.address}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hamburger Menu (now on the right) */}
        {!hideHamburger && (
          <TouchableOpacity
            onPress={handleMenuPress}
            style={styles.hamburgerIconContainer}
          >
            <View style={styles.hamburgerLine} aria-label="Menu button top line" />
            <View style={styles.hamburgerLine} aria-label="Menu button middle line" />
            <View style={styles.hamburgerLine} aria-label="Menu button bottom line" />
          </TouchableOpacity>
        )}
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
                <Ionicons name="close" size={iconSizeMedium} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={iconSizeSmall} color="#757575" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location..."
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoFocus
              />
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sync" size={iconSizeSmall} color="#757575" />
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

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define base sizes/scaling factors (adjust as needed)
const headerMinHeight = screenHeight * 0.1; // e.g., 10% of screen height
const headerPaddingVertical = screenHeight * 0.015;
const headerPaddingHorizontal = screenWidth * 0.04;
const titleFontSize = screenWidth * 0.07;
const compareFontSize = screenWidth * 0.055;
const locationFontSize = screenWidth * 0.04;
const iconSizeSmall = screenWidth * 0.05;
const iconSizeMedium = screenWidth * 0.06;
const hamburgerWidth = screenWidth * 0.09;
const hamburgerHeight = hamburgerWidth * 0.8;
const hamburgerLineHeight = hamburgerHeight * 0.1;
const modalTitleSize = screenWidth * 0.045;
const searchInputSize = screenWidth * 0.04;
const locationItemSize = screenWidth * 0.04;
const menuItemSize = screenWidth * 0.04;


const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  container: {
    backgroundColor: '#C60053',
    minHeight: headerMinHeight, // Dynamic min height
    paddingVertical: headerPaddingVertical, // Dynamic padding
    paddingHorizontal: headerPaddingHorizontal, // Dynamic padding
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out items for right alignment of hamburger
  },
  textAndLocationContainer: {
    // Removed marginLeft, let space-between handle spacing
    justifyContent: 'flex-start',
    flexShrink: 1, // Allow text container to shrink if needed
    marginRight: 10, // Add some margin to the right of the text block
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align text based on baseline
    marginBottom: 2, // Reduced margin
  },
  titleText: {
    fontSize: titleFontSize, // Dynamic font size
    fontWeight: 'bold', // Already bold, ensure it stays
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
  },
  compareText: {
    fontSize: compareFontSize, // Dynamic font size
    fontWeight: 'bold', // Make subtitle bold
    color: '#ffffff',
    fontFamily: 'ARCHIVE',
    marginLeft: 6, // Adjusted margin
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginTop: 2, // Add a little top margin
  },
  locationIconLeft: { // Style for the icon when it's on the left
    marginRight: 5, // Add space between icon and text
  },
  locationText: {
    fontSize: locationFontSize, // Dynamic font size
    color: '#ffffff',
    flexShrink: 1, // Allow text to shrink if location name is long
  },
  hamburgerIconContainer: {
    justifyContent: 'space-around', // Use space-around for even spacing of lines
    height: hamburgerHeight, // Dynamic height
    width: hamburgerWidth,  // Dynamic width
    alignItems: 'center', // Center lines horizontally
    // Removed alignSelf, paddingVertical
  },
  hamburgerLine: {
    height: hamburgerLineHeight, // Dynamic line height
    width: '100%', // Make lines take full width of container
    backgroundColor: '#ffffff',
    borderRadius: 2, // Adjusted border radius
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
    right: 0,
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
