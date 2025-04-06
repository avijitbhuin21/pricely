import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Share,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLocation } from '../contexts/LocationContext';

// Define RootStackParamList type for navigation
type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  EditAddresses: undefined;
  Member: undefined;
  ContactUs: undefined;
  privacy: undefined;
  Terms: undefined;
  Notifications: undefined;
  aboutus: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [userName, setUserName] = useState<string>('User'); // Default name
  const [userPhone, setUserPhone] = useState<string>(''); // Default phone
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null); // Default picture URI

  const { currentLocation, searchLocations, updateLocation, autoLocate } = useLocation();

  const [isLocationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([
    { id: 'auto', name: 'Auto Locate', isAutoLocate: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([{ id: 'auto', name: 'Auto Locate', isAutoLocate: true }]);
      return;
    }
    setIsLoading(true);
    try {
      const results = await searchLocations(query);
      if (Array.isArray(results)) {
        const locationResults = results.map((item: any) => ({
          id: item.id,
          name: item.description.split(',')[0],
          fullName: item.description,
        }));
        setSearchResults([
          { id: 'auto', name: 'Auto Locate', isAutoLocate: true },
          ...locationResults,
        ]);
      } else {
        setSearchResults([{ id: 'auto', name: 'Auto Locate', isAutoLocate: true }]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([{ id: 'auto', name: 'Auto Locate', isAutoLocate: true }]);
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
      handleSearchLocations(text);
    }, 500);
  };

  const handleLocationSelect = (item: any) => {
    if (item.isAutoLocate) {
      autoLocate();
    } else {
      updateLocation({
        address: item.fullName || item.name,
      });
    }
    setLocationModalVisible(false);
    setSearchQuery('');
    setSearchResults([{ id: 'auto', name: 'Auto Locate', isAutoLocate: true }]);
  };
  // Use useFocusEffect to reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        console.log('ProfileScreen: Loading user data...'); // Log start
        try {
          // Load user name and phone
          const userDataString = await AsyncStorage.getItem('userData');
          console.log('ProfileScreen: userDataString from AsyncStorage:', userDataString); // Log raw string
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            console.log('ProfileScreen: Parsed userData:', userData); // Log parsed object
            // Assuming userData has 'name' and 'phoneNumber' properties
            setUserName(userData.name || 'User');
            const phone = userData.phoneNumber || ''; // FIX: use correct key
            setUserPhone(phone);
            console.log('ProfileScreen: Setting userPhone state to:', phone); // Log phone value being set
          } else {
            console.log('ProfileScreen: No userData found in AsyncStorage.'); // Log if not found
            // Handle case where userData is not found
            setUserName('User');
            setUserPhone('');
          }

          // Load profile picture URI
          const pictureUri = await AsyncStorage.getItem('profilePictureUri');
          console.log('ProfileScreen: profilePictureUri from AsyncStorage:', pictureUri); // Log picture URI
          setProfilePictureUri(pictureUri);

        } catch (error) {
          console.error('ProfileScreen: Failed to load user data from storage', error); // Add context to error
          // Optionally set defaults or show an error message
          setUserName('User');
          setUserPhone('');
          setProfilePictureUri(null);
        }
      };

      loadUserData();

      // Optional: Return a cleanup function if needed
      return () => {
        // console.log('Profile screen lost focus');
      };
    }, []) // Empty dependency array means the callback itself doesn't depend on props/state
  );

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Pricely - Compare quick commerce prices easily! [Your App Link Here]',
      });
    } catch (error: any) {
      console.error('Error sharing app:', error.message);
    }
  };

  // Navigation Functions
  const navigateToEditProfile = () => navigation.navigate('EditProfile');
  const navigateToEditAddresses = () => navigation.navigate('EditAddresses');
  const navigateToCheckUpdate = () => {
    // TODO: Implement update check logic
    console.log('Checking for updates...');
  };
  const navigateToMemberPlus = () => navigation.navigate('Member');
  const navigateToContactUs = () => navigation.navigate('ContactUs');
  const navigateToPrivacyPolicy = () => navigation.navigate('privacy');
  const navigateToTerms = () => navigation.navigate('Terms');
  const navigateToNotifications = () => navigation.navigate('Notifications');
  const navigateToAboutUs = () => navigation.navigate('aboutus');

  // Define gradient colors as a readonly tuple
  const gradientColors = ['#F8F9FA', '#FFFFFF', '#FFF2F7', '#F8C8DC'] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={gradientColors[0]} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View style={styles.headerBar}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#000000" />
              </TouchableOpacity>
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Profile Info Section */}
            <View style={styles.profileInfoContainer}>
              <Image
                source={profilePictureUri ? { uri: profilePictureUri } : require('../assets/member_icon.png')}
                style={styles.avatar}
              />
              <View style={styles.profileTextContainer}>
                {/* Ensure name and phone are displayed vertically */}
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profilePhone}>
                  {userPhone ? `+91 ${userPhone.replace(/[^\x20-\x7E]+/g, '').trim().replace(/^\+?91\s*/, '')}` : ''}
                </Text>
                <TouchableOpacity onPress={navigateToEditProfile}>
                  <Text style={styles.editProfileLink}>Edit Profile ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Options Section */}
            <View style={styles.optionsSection}>
              {/* Edit Addresses Row */}
              <TouchableOpacity style={styles.optionRow} onPress={() => setLocationModalVisible(true)}>
                <View style={styles.optionIconText}>
                  <MaterialIcons name="location-on" size={24} color="#555" />
                  <Text style={styles.optionText} numberOfLines={1}>
                    {currentLocation?.address || 'Select Location'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#AAAAAA" />
              </TouchableOpacity>

              {/* Appearance Row */}
              {/* <View style={[styles.optionRow, styles.appearanceRow]}>
                <View style={styles.optionIconText}>
                  <Ionicons name="sunny-outline" size={24} color="#555" />
                  <Text style={styles.optionText}>Appearance</Text>
                </View>
                <View style={styles.appearanceToggle}>
                  <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setAppearance('light')}
                  >
                    <Ionicons
                      name={appearance === 'light' ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={appearance === 'light' ? '#000000' : '#AAAAAA'}
                    />
                    <Text style={[styles.toggleText, appearance === 'light' && styles.toggleTextActive]}>Light</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.toggleOption}
                    onPress={() => setAppearance('dark')}
                  >
                    <Ionicons
                      name={appearance === 'dark' ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={appearance === 'dark' ? '#000000' : '#AAAAAA'}
                    />
                    <Text style={[styles.toggleText, appearance === 'dark' && styles.toggleTextActive]}>Dark</Text>
                  </TouchableOpacity>
                </View>
              </View> */}

              {/* Member+ Banner */}
              <TouchableOpacity style={styles.memberBanner} onPress={navigateToMemberPlus}>
                <Text style={styles.memberTextHighlight}>MEMBER+</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberTextMain}>Join Now at ₹29</Text>
                  <Text style={styles.memberTextSub}>For 1 Month</Text>
                </View>
              </TouchableOpacity>

              {/* Check App Update Row */}
              <TouchableOpacity style={styles.optionRow} onPress={navigateToCheckUpdate}>
                <View style={styles.optionIconText}>
                  <Ionicons name="sync-circle-outline" size={24} color="#555" />
                  <Text style={styles.optionText}>Check App Update</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#AAAAAA" />
              </TouchableOpacity>
            </View>

            {/* Help & Support Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Help & Support</Text>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToContactUs}>
                <Ionicons name="call-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Contact Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToPrivacyPolicy}>
                <Ionicons name="lock-closed-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Privacy Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToTerms}>
                <Ionicons name="document-text-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Terms & Conditions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToNotifications}>
                <Ionicons name="notifications-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={navigateToAboutUs}>
                <Ionicons name="information-circle-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>About us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.helpRow} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={24} color="#555" style={styles.helpIcon} />
                <Text style={styles.helpText}>Share the app</Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
        {/* Footer Branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PRICELY</Text>
        </View>
      </LinearGradient>

      <Modal
        visible={isLocationModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '80%',
            padding: 16,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Select Location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              paddingHorizontal: 8,
              marginBottom: 12,
            }}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput
                style={{ flex: 1, marginLeft: 8, height: 40 }}
                placeholder="Search location..."
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                autoFocus
              />
              {isLoading && (
                <View style={{ marginLeft: 8 }}>
                  <Ionicons name="sync" size={20} color="#888" />
                </View>
              )}
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Ionicons
                    name={item.isAutoLocate ? 'navigate' : 'location-outline'}
                    size={20}
                    color={item.isAutoLocate ? '#007AFF' : '#333'}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: '#333' }}>{item.name}</Text>
                    {item.fullName && !item.isAutoLocate && (
                      <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={1}>
                        {item.fullName}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !isLoading && searchQuery.length >= 3 ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#666' }}>No locations found</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  gradient: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '4%',
    paddingTop: Platform.OS === 'android' ? '3%' : '2%',
    marginBottom: '2%',
  },
  backButton: {
    padding: '2%',
  },
  headerPlaceholder: {
    flex: 1,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '4%',
    marginBottom: '3%',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    marginHorizontal: '4%',
  },
  avatar: {
    width: '15%',
    aspectRatio: 1,
    borderRadius: 50,
    marginRight: '4%',
    backgroundColor: '#DDD',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '1%',
  },
  profilePhone: {
    fontSize: 16,
    color: '#555555',
    marginBottom: '2%',
  },
  editProfileLink: {
    fontSize: 14,
    color: '#888888',
    paddingVertical: '1%',
  },
  optionsSection: {
    paddingHorizontal: '4%',
    marginBottom: '3%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: '3%',
    paddingHorizontal: '4%',
    borderRadius: 12,
    marginBottom: '2%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: '3%',
    flex: 1,
  },
  appearanceRow: {
    paddingVertical: '2%',
  },
  appearanceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: '1%',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '2%',
    paddingVertical: '1%',
    marginHorizontal: '1%',
  },
  toggleText: {
    fontSize: 15,
    color: '#AAAAAA',
    marginLeft: '2%',
  },
  toggleTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  memberBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    borderRadius: 12,
    marginBottom: '2%',
  },
  memberTextHighlight: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberTextMain: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    width: '100%',
    paddingRight: 15,
    textAlign: 'right',
  },
  memberTextSub: {
    fontSize: 24,
    color: '#CCCCCC',
    marginTop: '1%',
    width: '100%',
    paddingRight: 15,
    textAlign: 'right',
  },
  helpSection: {
    paddingHorizontal: '4%',
    marginTop: '2%',
    marginHorizontal: '4%',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: '3%',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '2%',
  },
  helpIcon: {
    marginRight: '4%',
  },
  helpText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingVertical: '3%',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  footerText: {
    fontSize: Platform.OS === 'ios' ? 32 : 28,
    fontWeight: '700',
    color: '#555555',
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
  }
});

export default ProfileScreen;