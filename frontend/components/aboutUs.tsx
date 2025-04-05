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
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Consider renaming the file to AboutUsScreen.tsx if appropriate for your project structure
const AboutUsScreen = () => { // Renamed component for clarity
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  const handleEmailPress = (email: string, subject?: string) => {
    let url = `mailto:${email}`;
    if (subject) {
      const encodedSubject = encodeURIComponent(subject.replace(/[^\w\s-]/g, ''));
      url += `?subject=${encodedSubject}`;
    }
    Linking.openURL(url).catch(err => console.error('Failed to open email client:', err));
  };

  const gradientColors = ['#FFFFFF', '#FFF2F7', '#F8C8DC'] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={gradientColors[0]} />
      <LinearGradient colors={gradientColors} style={styles.gradient}>
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
            <Text style={styles.title}>About Us</Text>
            <View style={styles.backButtonPlaceholder} />
          </View>

          {/* --- Updated Content Section (About Us) --- */}
          <View style={styles.content}>
            <Text style={styles.paragraph}>
              Welcome to Pricely – India’s smartest way to compare prices across
              your favorite quick commerce platforms!
            </Text>

            <Text style={styles.paragraph}>
              We know how frustrating it can be to check multiple apps just to
              find the best deal on daily essentials, groceries, snacks, or
              electronics. That’s why we built Pricely — a simple, fast, and
              reliable tool to help you save time and money.
            </Text>

            {/* Section: What We Do */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What We Do</Text>
              <Text style={styles.paragraph}>
                Pricely compares product prices across top quick commerce
                platforms in real-time. Just search, add products to your cart,
                and instantly see which platform offers the best price — all in
                one app.
              </Text>
            </View>

            {/* Section: Why We Built Pricely */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why We Built Pricely</Text>
              <Text style={styles.paragraph}>
                We believe in transparency and convenience. Quick commerce is
                growing fast, but with so many options, it’s easy to overspend
                or miss out on better deals. We built Pricely to give you full
                control over your spending, with tools that make comparison
                shopping effortless.
              </Text>
            </View>

            {/* Section: Key Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Features</Text>
              <Text style={styles.bulletPoint}>
                • Real-time Price Comparison: Instantly see the best prices
                across platforms
              </Text>
              <Text style={styles.bulletPoint}>
                • Cart Comparison: Create a cart and compare total prices across
                apps
              </Text>
              <Text style={styles.bulletPoint}>
                • Daily Free Searches: 3 searches every day, even without a
                subscription
              </Text>
              <Text style={styles.bulletPoint}>
                • Unlimited Access: Get unlimited searches for just ₹29/month
                after your first free month
              </Text>
            </View>

            {/* Section: Our Mission */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Our Mission</Text>
              <Text style={styles.paragraph}>
                To help every Indian shopper make smarter, faster, and more
                informed purchase decisions — every single day.
              </Text>
            </View>

            {/* Section: Get in Touch */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Get in Touch</Text>
              <Text style={styles.paragraphNoMargin}>
                Have feedback, questions, or partnership ideas? We’d love to
                hear from you.
              </Text>
              <Text style={styles.paragraph}>Email: support@pricely.com</Text>
              {/* support@pricely.com */}
              <TouchableOpacity onPress={() => handleEmailPress('support@pricely.com')}>
                <Text style={styles.contactDetail}>Email: <Text style={styles.linkText}>business@pricely.com</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* --- End of Updated Content Section --- */}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Styles remain largely the same as they fit the new content structure well
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
    marginBottom: 25, // Keeps consistent spacing between logical blocks
  },
  sectionTitle: { // Using this style for the headings like "What We Do"
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8,
    paddingLeft: 5, // Spacing after the bullet character
  },
  linkText: { // Style for making email addresses and social media links look like links
    color: '#007AFF', // Standard iOS blue link color
    textDecorationLine: 'underline',
  },
  contactDetail: { // Style for email, hours, social handles
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 8, // Space between contact details
  }
  // subBulletPoint style is not needed for this content but kept for reference if needed later
  // subBulletPoint: {
  //   marginLeft: 15,
  //   paddingLeft: 0,
  // },
});

export default AboutUsScreen; // Export the renamed component