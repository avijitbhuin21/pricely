import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Switch,
  StatusBar,
  TextInput
} from 'react-native';
import Header from '../components/Header';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { UserContext, UserContextType } from '../contexts/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Footer from '../components/Footer';
import { useLocation } from '../contexts/LocationContext'; // Import useLocation

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { userName, setUserName } = useContext(UserContext) as UserContextType; // Keep UserContext for userName
  const { currentLocation, updateLocation, autoLocate } = useLocation(); // Get location data from useLocation
  const navigation = useNavigation<NavigationProp<RootStackParamList, 'Profile'>>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

    const [activeTab, setActiveTab] = useState('profile');

  // Toggle states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationTrackingEnabled, setLocationTrackingEnabled] = useState(true);

  // Demo profile details
  const userId = 'USER12345';
  const [email, setEmail] = useState('Demo@example.com');
  const phoneNumber = '+91 98765 43210';
  const memberSince = 'May 2023';

  const [avatarUri, setAvatarUri] = useState('https://source.unsplash.com/random/300x300?face');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempName, setTempName] = useState("Demo");

  useEffect(() => {
    setTempName(userName);
  }, [userName]);
  const [tempEmail, setTempEmail] = useState(email);

  useEffect(() => {
    // Create sequential animations for a more polished experience
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        })
      ]),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Create a continuous rotation animation for the edit button
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Interpolate the spin value to rotate from 0 to 360 degrees
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // Animation before navigating away
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
              })
            ]).start(() => console.log("Logged out"));
          }
        }
      ]
    );
  };

  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please grant camera roll permissions to change your profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        // Save image to app's permanent storage
        const fileName = result.assets[0].uri.split('/').pop();
        const newPath = `${FileSystem.documentDirectory}profile/${fileName}`;

        await FileSystem.makeDirectoryAsync(
          `${FileSystem.documentDirectory}profile/`,
          { intermediates: true }
        );

        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: newPath
        });

        setAvatarUri(newPath);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleNameEdit = () => {
    if (isEditingName) {
      // Save name changes
      // You would typically make an API call here
      setUserName(tempName);
    }
    setIsEditingName(!isEditingName);
  };

  const handleEmailEdit = () => {
    if (isEditingEmail) {
      // Save email changes
      // You would typically make an API call here
      setEmail(tempEmail); // Assume setEmail is from UserContext
    }
    setIsEditingEmail(!isEditingEmail);
  };

  const renderBadge = (text: string, color: string) => {
    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Header
            userName={userName}
            currentLocation={currentLocation} // Use currentLocation from useLocation
            onLocationSelect={updateLocation} // Use updateLocation from useLocation
            onAutoLocate={autoLocate} // Use autoLocate from useLocation
          />

          {/* Profile card with animation */}
          <Animated.View style={[
            styles.profileCard,
            {
              opacity: cardOpacity,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <LinearGradient
              colors={['#fff', 'snow']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.avatarContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleAvatarPress}
                >
                  <Animated.View style={[styles.avatarInner, { transform: [{ scale: scaleAnim }] }]}>
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatar}
                    />
                  </Animated.View>
                </TouchableOpacity>
                <Animated.View style={[styles.editButtonWrapper, { transform: [{ rotate: spin }] }]}>
                  <TouchableOpacity style={styles.editButton} onPress={pickImage}>
                    <Ionicons name="pencil" size={16} color="#000" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={styles.nameContainer}>
                {isEditingName ? (
                  <TextInput
                    style={styles.editInput}
                    value={tempName}
                    onChangeText={setTempName}
                    autoFocus
                  />
                ) : (
                  <Text style={styles.name}>{tempName}</Text>
                )}
                <TouchableOpacity style={styles.editFieldButton} onPress={handleNameEdit}>
                  <Ionicons
                    name={isEditingName ? "checkmark" : "pencil"}
                    size={16}
                    color="#000"
                  />
                </TouchableOpacity>
              </View>
              

              <View style={styles.divider} />

              {/* Profile details with icons - with ripple effect */}
              <View style={styles.infoContainer}>
                <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                  <Ionicons name="person-circle-outline" size={24} color="#000" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>User ID</Text>
                    <Text style={styles.infoValue}>{userId}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#000" style={styles.infoArrow} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                  <Ionicons name="mail-outline" size={24} color="#000" style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email Address</Text>
                    {isEditingEmail ? (
                      <TextInput
                        style={styles.editInput}
                        value={tempEmail}
                        onChangeText={setTempEmail}
                        autoFocus
                        keyboardType="email-address"
                      />
                    ) : (
                      <Text style={styles.infoValue}>{email}</Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.editFieldButton} onPress={handleEmailEdit}>
                    <Ionicons
                      name={isEditingEmail ? "checkmark" : "pencil"}
                      size={16}
                      color="#000"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity style={styles.infoRow} activeOpacity={0.7}>
                  <Ionicons name="call-outline" size={24} color="#000" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{phoneNumber}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#000" style={styles.infoArrow} />
                </TouchableOpacity>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={24} color="#000" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Member Since</Text>
                    <Text style={styles.infoValue}>{memberSince}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF5252', '#FF1A1A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.logoutGradient}
                >
                  <Ionicons name="log-out-outline" size={22} color="#000" />
                  <Text style={styles.logoutText}>Logout</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <Footer navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingBlockStart: 43,
    paddingBottom: 80, // To account for bottom nav height
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 80,
    borderRadius: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarInner: {
    borderRadius: 75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#000',
  },
  editButtonWrapper: {
    position: 'absolute',
    right: '30%',
    bottom: 0,
  },
  editButton: {
    backgroundColor: '#2196F3',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    width: '100%',
    position: 'relative',
  },
  name: {
    fontFamily: 'ARCHIVE',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    width: '100%',
    marginVertical: 16,
  },
  infoContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderRadius: 10,
    // padding: 10,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoArrow: {
    marginLeft: 'auto',
  },
  infoLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontFamily: 'Poppins',
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  settingsSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  optionsContainer: {
    marginTop: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
  optionBadge: {
    backgroundColor: '#000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    fontWeight: '600',
  },
  versionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#000',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    backgroundColor: '#E8099C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  activeNavButton: {
    borderTopWidth: 3,
    borderTopColor: '#2196F3',
  },
  navText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editInput: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
    paddingVertical: 4,
    minWidth: 150,
    textAlign: 'center',
  },
  editFieldButton: {
    padding: 8,
    position: 'absolute',
    right: 16,
  },
  infoContent: {
    flex: 1,
  },
});