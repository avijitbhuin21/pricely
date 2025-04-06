import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define RootStackParamList type if not already defined globally
type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  // Add other screens if needed
};

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const [name, setName] = useState<string>('');
  const [profilePictureUri, setProfilePictureUri] = useState<string | null>(null);
  const [initialName, setInitialName] = useState<string>('');
  const [initialProfilePictureUri, setInitialProfilePictureUri] = useState<string | null>(null);

  useEffect(() => {
    // Load existing data
    const loadData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setName(userData.name || '');
          setInitialName(userData.name || '');
        }
        const pictureUri = await AsyncStorage.getItem('profilePictureUri');
        setProfilePictureUri(pictureUri);
        setInitialProfilePictureUri(pictureUri);
      } catch (error) {
        console.error('Failed to load profile data', error);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    };
    loadData();
  }, []);

  const handleChoosePhoto = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access the photo library.');
      return;
    }

    // Launch image picker
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.5, // Reduce quality to save space
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setProfilePictureUri(pickerResult.assets[0].uri);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Save name (assuming phone number is not editable here)
      const userDataString = await AsyncStorage.getItem('userData');
      let userData = {};
      if (userDataString) {
        userData = JSON.parse(userDataString);
      }
      const updatedUserData = { ...userData, name: name };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

      // Save profile picture URI
      if (profilePictureUri) {
        await AsyncStorage.setItem('profilePictureUri', profilePictureUri);
      } else {
        // Option to remove picture if needed, or handle differently
        await AsyncStorage.removeItem('profilePictureUri');
      }

      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack(); // Go back to Profile screen
    } catch (error) {
      console.error('Failed to save profile data', error);
      Alert.alert('Error', 'Failed to save profile data.');
    }
  };

  const handleBackPress = () => {
     // Check if changes were made
     if (name !== initialName || profilePictureUri !== initialProfilePictureUri) {
        Alert.alert(
          "Discard Changes?",
          "You have unsaved changes. Are you sure you want to discard them?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Discard", onPress: () => navigation.goBack(), style: "destructive" }
          ]
        );
      } else {
        navigation.goBack();
      }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerPlaceholder} /> {/* To balance the title */}
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.avatarContainer}>
          <Image
            source={profilePictureUri ? { uri: profilePictureUri } : require('../assets/member_icon.png')} // Use a default placeholder
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChoosePhoto}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#AAAAAA"
          />
        </View>

        {/* Add other fields if needed, e.g., phone (if editable) */}

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '4%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : '2%',
    paddingBottom: '3%',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF', // Ensure header has a background
  },
  backButton: {
    padding: '2%',
    marginRight: '3%', // Add margin for spacing
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Allow title to take available space
  },
  headerPlaceholder: {
    width: 40, // Match approx width of back button for centering
  },
  container: {
    flex: 1,
    padding: '5%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: '8%',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    marginBottom: '4%',
  },
  changePhotoButton: {
    paddingVertical: '2%',
    paddingHorizontal: '4%',
  },
  changePhotoText: {
    fontSize: 16,
    color: '#007AFF', // iOS blue color for links
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: '5%',
  },
  label: {
    fontSize: 16,
    color: '#555555',
    marginBottom: '2%',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: '4%',
    paddingVertical: '3%',
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: '4%',
    alignItems: 'center',
    marginTop: '5%',
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;