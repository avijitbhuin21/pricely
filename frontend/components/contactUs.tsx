import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  StatusBar as RNStatusBar, // Import StatusBar for better platform handling
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Component name reflects content, while filename is as requested
const ContactUsScreen = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Function to open email client (optional, but good practice for email addresses)
  const handleEmailPress = (email: string, subject?: string) => {
    let url = `mailto:${email}`;
    if (subject) {
      const encodedSubject = encodeURIComponent(subject.replace(/[^\w\s-]/g, ''));
      url += `?subject=${encodedSubject}`;
    }
    Linking.openURL(url).catch(err => console.error('Failed to open email client:', err));
  };

  // Function to handle social media links
  const handleSocialMediaPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open social media link:', err));
  };

  const gradientColors = ['#FFFFFF', '#FFF2F7', '#F8C8DC'] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? gradientColors[0] : 'transparent'}
        translucent={Platform.OS === 'android'}
      />
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.gradient,
          Platform.OS === 'android' && { paddingTop: RNStatusBar.currentHeight || 0 }
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="chevron-back" size={32} color="#000000" />
            </TouchableOpacity>
            {/* Updated Title */}
            <Text style={styles.title}>Contact Us</Text>
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* --- Updated Content Section (Contact Us) --- */}
          <View style={styles.content}>
            <Text style={styles.paragraph}>
              We’d love to hear from you! Whether you have questions, feedback,
              or need support, feel free to reach out.
            </Text>

            {/* Section: General Queries & Support */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General Queries & Support</Text>
              <Text style={styles.paragraphNoMargin}>
                For help with using Pricely or to report a technical issue:
              </Text>
              {/* Make email tappable */}
              <TouchableOpacity onPress={() => handleEmailPress('support@pricely.com')}>
                 <Text style={styles.contactDetail}>Email: <Text style={styles.linkText}>support@pricely.com</Text></Text>
              </TouchableOpacity>
              <Text style={styles.contactDetail}>
                Support Hours: Monday to Saturday, 10:00 AM – 6:00 PM (IST)
              </Text>
            </View>

            {/* Section: Feedback & Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Feedback & Suggestions</Text>
              <Text style={styles.paragraphNoMargin}>
                Have an idea or feature you’d like to see in the app? We’re
                always looking to improve Pricely for our users.
              </Text>
              <TouchableOpacity onPress={() => handleEmailPress('feedback@pricely.com', 'Feedback')}>
                 <Text style={styles.contactDetail}>Email: <Text style={styles.linkText}>feedback@pricely.com</Text> with the subject: “Feedback”</Text>
              </TouchableOpacity>
            </View>

            {/* Section: Business & Partnerships */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business & Partnerships</Text>
              <Text style={styles.paragraphNoMargin}>
                If you’re interested in partnering with Pricely or exploring
                business opportunities:
              </Text>
               <TouchableOpacity onPress={() => handleEmailPress('business@pricely.com')}>
                 <Text style={styles.contactDetail}>Email: <Text style={styles.linkText}>business@pricely.com</Text></Text>
              </TouchableOpacity>
            </View>

            {/* Section: Social Media */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Social Media</Text>
              <Text style={styles.paragraphNoMargin}>
                Stay updated on our latest features, updates, and announcements:
              </Text>
              <TouchableOpacity onPress={() => handleSocialMediaPress('https://www.instagram.com/pricely.app')}>
                <Text style={[styles.contactDetail, styles.linkText]}>Instagram: @pricely.app</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSocialMediaPress('https://twitter.com/pricelyapp')}>
                <Text style={[styles.contactDetail, styles.linkText]}>Twitter: @pricelyapp</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSocialMediaPress('https://www.facebook.com/pricelyapp')}>
                <Text style={[styles.contactDetail, styles.linkText]}>Facebook: Pricely</Text>
              </TouchableOpacity>
            </View>

          </View>
          {/* --- End of Updated Content Section --- */}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles reused and added specific contact styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    paddingBottom: 10,
    width: '100%',
  },
  backButton: {
    padding: 5,
    zIndex: 1,
  },
  backButtonPlaceholder: {
    width: 32 + 5 * 2,
    height: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 20,
  },
  paragraphNoMargin: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: { // For headings like "General Queries & Support"
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  contactDetail: { // Style for email, hours, social handles
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8, // Space between contact details
  },
  linkText: { // Style for making email addresses and social media links look like links
    color: '#007AFF', // Standard iOS blue link color
    textDecorationLine: 'underline',
  },
  // bulletPoint style is not needed here but kept for reference
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8,
    paddingLeft: 5,
  }
});

// Export component named ContactUsScreen, even though filename is faq.tsx
export default ContactUsScreen;