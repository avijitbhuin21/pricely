import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
  Member: undefined;
  HomeScreen: undefined;
  [key: string]: undefined | object;
};

type MemberScreenProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

interface Sparkle {
  translateY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
}

const createSparkle = (index: number): Sparkle => ({
  translateY: new Animated.Value(100),
  scale: new Animated.Value(0.5 + Math.random() * 0.5),
  opacity: new Animated.Value(1)
});

const MemberScreen = ({ navigation }: MemberScreenProps) => {
  const [sparkles] = useState(
    Array(20).fill(0).map((_, index) => createSparkle(index))
  );
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [dustParticles] = useState(
    Array(50).fill(0).map(() => ({
      translateY: new Animated.Value(Math.random() * 300),
      translateX: new Animated.Value(Math.random() * 300),
      opacity: new Animated.Value(Math.random()),
      scale: new Animated.Value(Math.random() * 0.5 + 0.5)
    }))
  );

  // Animation effect for the golden glow
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setGlowIntensity(0.5 + 0.5 * Math.sin(Date.now() / 1000));
    }, 50);
    
    return () => clearInterval(glowInterval);
  }, []);

  // Sparkles animation
  useEffect(() => {
    sparkles.forEach((sparkle, index) => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.parallel([
            Animated.timing(sparkle.translateY, {
              toValue: -20,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle.opacity, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            })
          ]),
          Animated.timing(sparkle.translateY, {
            toValue: 100,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.opacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      );
      
      animation.start();
    });

    return () => {
      sparkles.forEach(sparkle => {
        sparkle.translateY.stopAnimation();
        sparkle.opacity.stopAnimation();
      });
    };
  }, []);

  // Original glow effect
  useEffect(() => {
    dustParticles.forEach(particle => {
      const animateParticle = () => {
        Animated.parallel([
          Animated.timing(particle.translateY, {
            toValue: -100,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          })
        ]).start(() => {
          particle.translateY.setValue(300);
          particle.translateX.setValue(Math.random() * 300);
          particle.opacity.setValue(Math.random());
          animateParticle();
        });
      };
      animateParticle();
    });
  }, []);

  const renderDustParticles = () => {
    return dustParticles.map((particle, index) => (
      <Animated.View
        key={index}
        style={[
          styles.dustParticle,
          {
            transform: [
              { translateY: particle.translateY },
              { translateX: particle.translateX },
              { scale: particle.scale }
            ],
            opacity: particle.opacity
          }
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                // If can't go back, navigate to home screen
                navigation.navigate('HomeScreen');
              }
            }}
          >
            <Ionicons name="chevron-back" size={SCREEN_WIDTH * 0.06} color="#fff" />
          </TouchableOpacity>

          {/* App title */}
          <Text style={styles.title}>PRICELY</Text>

          {/* Member+ label */}
          <Animated.Text
            style={[
              styles.memberPlus,
              {
                opacity: 0.8 + 0.2 * glowIntensity,
                shadowColor: '#eed7a5',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8 + 0.2 * glowIntensity,
                shadowRadius: SCREEN_WIDTH * 0.04,
                textShadowColor: '#eed7a5',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: SCREEN_WIDTH * 0.05,
              }
            ]}
          >
            MEMBER +
          </Animated.Text>

          {/* Price box */}
          {/* Price box */}
          <View style={styles.priceBox}>
            {/* Unlimited Free Searches label */}
            <View style={styles.searchesTagWrapper}>
              <LinearGradient
                colors={['#ffffff', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.searchesTag}
              >
                <Text style={styles.searchesText}>UNLIMITED FREE SEARCHES</Text>
              </LinearGradient>
            </View>

            {/* Price content */}
            <View style={styles.priceContent}>
              <View style={styles.priceRow}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Animated.Text
                  style={[
                    styles.price,
                    {
                      shadowColor: '#eed7a5',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8 + 0.2 * glowIntensity,
                      shadowRadius: 15 + 5 * glowIntensity,
                      textShadowColor: '#eed7a5',
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 15,
                    }
                  ]}
                >
                  29
                </Animated.Text>
                <View style={styles.monthlyContainer}>
                  <Text style={styles.monthly}>MONTHLY</Text>
                  <TouchableOpacity>
                    <LinearGradient
                      colors={['#ffffff', '#ffffff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.joinButtonSmall}>
                      <Text style={styles.joinButtonTextSmall}>JOIN NOW</Text>
                      <View style={styles.arrowContainer}>
                        <Text style={styles.arrowText}>&gt;</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Sparkles effect container */}
          <View style={styles.sparklesContainer}>
            <View style={styles.sparklesInner}>
              {sparkles.map((sparkle, index) => (
                <Animated.View
                  key={`sparkle-${index}`}
                  style={[
                    styles.sparkle,
                    {
                      left: `${(index % 10) * 10}%`,
                      transform: [
                        { translateY: sparkle.translateY },
                        { scale: sparkle.scale }
                      ],
                      opacity: sparkle.opacity
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Benefits section */}
          <View style={styles.benefitsTitleContainer}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.benefitsTitle}>MEMBER+ BENEFITS</Text>
            <Text style={styles.star}>★</Text>
          </View>

          {/* Benefit Items */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconCircle}>
                <MaterialCommunityIcons name="text-search" size={SCREEN_WIDTH * 0.06} color="#eed7a5" />
              </View>
              <Text style={styles.benefitText}>Unlimited Searches</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconCircle}>
                <MaterialCommunityIcons name="cart-outline" size={SCREEN_WIDTH * 0.06} color="#eed7a5" />
              </View>
              <Text style={styles.benefitText}>Unlimited Cart Making</Text>
            </View>
          </View>

          {/* Join Button Large */}
          <TouchableOpacity>
            <LinearGradient
              colors={['#eed7a5', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.joinButtonLarge}>
              <Text style={[styles.joinButtonLargeText, { color: '#000' }]}>Join Now at ₹29</Text>
              <Text style={[styles.joinButtonSubtext, { color: '#000' }]}>For 1 Month</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer links */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerText}>View all FAQs</Text>
              <Ionicons name="chevron-forward" size={SCREEN_WIDTH * 0.05} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerText}>View Terms & Conditons</Text>
              <Ionicons name="chevron-forward" size={SCREEN_WIDTH * 0.05} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    minHeight: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.02,
  },
  backButton: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  title: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.09,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    letterSpacing: SCREEN_WIDTH * 0.003,
  },
  memberPlus: {
    color: '#eed7a5',
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    letterSpacing: SCREEN_WIDTH * 0.003,
  },
  priceBox: {
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: '#eed7a5',
    borderRadius: SCREEN_WIDTH * 0.03,
    overflow: 'visible',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginHorizontal: SCREEN_WIDTH * 0.04,
    position: 'relative',
    borderStyle: 'dashed',
    shadowColor: '#eed7a5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: SCREEN_WIDTH * 0.025,
    elevation: 5,
  },
  searchesTagWrapper: {
    position: 'absolute',
    top: SCREEN_HEIGHT * -0.02,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  searchesTag: {
    paddingVertical: SCREEN_HEIGHT * 0.008,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.003 },
    shadowOpacity: 0.25,
    shadowRadius: SCREEN_WIDTH * 0.01,
    elevation: 5,
  },
  searchesText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: 'bold',
    letterSpacing: SCREEN_WIDTH * 0.002,
    textTransform: 'uppercase',
  },
  priceContent: {
    paddingVertical: SCREEN_HEIGHT * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    color: '#eed7a5',
    fontSize: SCREEN_WIDTH * 0.1,
    fontWeight: 'bold',
    marginRight: SCREEN_WIDTH * 0.012,
    textShadowColor: '#eed7a5',
    textShadowRadius: SCREEN_WIDTH * 0.025,
    shadowColor: '#eed7a5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: SCREEN_WIDTH * 0.02,
  },
  price: {
    color: '#eed7a5',
    fontSize: SCREEN_WIDTH * 0.15,
    fontWeight: 'bold',
    marginRight: SCREEN_WIDTH * 0.04,
    textShadowColor: '#eed7a5',
    textShadowRadius: SCREEN_WIDTH * 0.037,
    shadowColor: '#eed7a5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: SCREEN_WIDTH * 0.037,
  },
  monthlyContainer: {
    alignItems: 'flex-start',
  },
  monthly: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  joinButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.006,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.002 },
    shadowOpacity: 0.25,
    shadowRadius: SCREEN_WIDTH * 0.01,
    elevation: 5,
  },
  joinButtonTextSmall: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: 'bold',
    marginRight: SCREEN_WIDTH * 0.02,
  },
  arrowContainer: {
    backgroundColor: '#000',
    width: SCREEN_WIDTH * 0.04,
    height: SCREEN_WIDTH * 0.04,
    borderRadius: SCREEN_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.025,
    fontWeight: 'bold',
  },
  dustContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.15,
  },
  dustParticle: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.01,
    height: SCREEN_WIDTH * 0.01,
    backgroundColor: '#FCD34D',
    borderRadius: SCREEN_WIDTH * 0.005,
  },
  benefitsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  star: {
    color: '#eed7a5',
    fontSize: SCREEN_WIDTH * 0.04,
    marginHorizontal: SCREEN_WIDTH * 0.02,
    textShadowColor: '#eed7a5',
    textShadowRadius: SCREEN_WIDTH * 0.02,
  },
  benefitsTitle: {
    color: '#eed7a5',
    fontSize: SCREEN_WIDTH * 0.04,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: SCREEN_WIDTH * 0.0025,
    textShadowColor: '#eed7a5',
    textShadowRadius: SCREEN_WIDTH * 0.02,
  },
  benefitsCard: {
    backgroundColor: '#fff',
    borderRadius: SCREEN_WIDTH * 0.04,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.03,
    overflow: 'hidden',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  benefitIconCircle: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    borderRadius: SCREEN_WIDTH * 0.05,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SCREEN_WIDTH * 0.04,
    borderWidth: SCREEN_WIDTH * 0.002,
    borderColor: '#eed7a5',
    shadowColor: '#eed7a5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: SCREEN_WIDTH * 0.01,
    elevation: 3,
  },
  benefitText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  divider: {
    height: SCREEN_HEIGHT * 0.001,
    backgroundColor: '#E5E7EB',
    marginHorizontal: SCREEN_WIDTH * 0.04,
  },
  sparklesContainer: {
    height: 60,
    width: '100%',
    marginTop: -10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sparklesInner: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  sparkle: {
    top: 0,
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#eed7a5',
    borderRadius: 2,
    shadowColor: '#eed7a5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  joinButtonLarge: {
    borderRadius: SCREEN_WIDTH * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  joinButtonLargeText: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: 'bold',
  },
  joinButtonSubtext: {
    color: '#000',
    fontSize: SCREEN_WIDTH * 0.03,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  footerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3e3d39',
    borderTopWidth: 1,
    borderTopColor: '#3e3d39',
  },
  footerText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.035,
  },
});

export default MemberScreen;