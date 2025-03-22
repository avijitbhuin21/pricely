import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/** Interface for animation values */
interface WaveAnimation {
  moveX: Animated.Value;
  wave: Animated.Value;
}

/** Interface for wave style parameters */
interface WaveStyleParams {
  wave: Animated.Value;
  moveX: Animated.Value;
  heightOffset: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width,
    height,
    backgroundColor: '#020514',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    width: '200%', // Increased for smoother horizontal movement
    height: '200%',
    opacity: 0.3,
    borderRadius: 600,
  }
});

/**
 * Animated background component with wave effect
 * Creates a flowing water-like animation
 */
export const AnimatedBackground: React.FC = () => {
  const animations = useRef<WaveAnimation[]>([
    { moveX: new Animated.Value(0), wave: new Animated.Value(0) },
    { moveX: new Animated.Value(0), wave: new Animated.Value(0) },
    { moveX: new Animated.Value(0), wave: new Animated.Value(0) },
  ]).current;

  const createWaveAnimation = useCallback((
    waveAnim: WaveAnimation,
    duration: number,
    xDuration: number
  ): Animated.CompositeAnimation => {
    return Animated.parallel([
      // Vertical wave movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim.wave, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim.wave, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ),
      // Horizontal wave movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim.moveX, {
            toValue: -width,
            duration: xDuration,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim.moveX, {
            toValue: 0,
            duration: xDuration,
            useNativeDriver: true,
          }),
        ])
      ),
    ]);
  }, []);

  useEffect(() => {
    // Start wave animations with different speeds
    Animated.parallel([
      createWaveAnimation(animations[0], 4000, 8000),
      createWaveAnimation(animations[1], 5000, 10000),
      createWaveAnimation(animations[2], 6000, 12000),
    ]).start();

    return () => {
      animations.forEach(anim => {
        anim.moveX.stopAnimation();
        anim.wave.stopAnimation();
      });
    };
  }, [animations, createWaveAnimation]);

  const createWaveStyle = (waveAnim: WaveAnimation, heightOffset: number) => ({
    transform: [
      {
        translateX: waveAnim.moveX
      },
      {
        translateY: waveAnim.wave.interpolate({
          inputRange: [0, 1],
          outputRange: [height * heightOffset, height * (heightOffset + 0.05)],
        })
      }
    ]
  });

  return (
    <View style={styles.container}>
      {/* First wave layer */}
      <Animated.View style={[styles.wave, createWaveStyle(animations[0], 0.2)]}>
        <LinearGradient
          colors={['transparent', '#0066cc30', '#0066cc50', '#0066cc30', 'transparent']}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </Animated.View>

      {/* Second wave layer */}
      <Animated.View style={[styles.wave, createWaveStyle(animations[1], 0.15)]}>
        <LinearGradient
          colors={['transparent', '#00ccff20', '#00ccff40', '#00ccff20', 'transparent']}
          style={{ flex: 1 }}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 0.8, y: 0.5 }}
        />
      </Animated.View>

      {/* Third wave layer */}
      <Animated.View style={[styles.wave, createWaveStyle(animations[2], 0.1)]}>
        <LinearGradient
          colors={['transparent', '#0088ff15', '#0088ff35', '#0088ff15', 'transparent']}
          style={{ flex: 1 }}
          start={{ x: 0.4, y: 0.5 }}
          end={{ x: 0.6, y: 0.5 }}
        />
      </Animated.View>
    </View>
  );
};
