import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  StatusBar, 
  Platform,
  Easing 
} from 'react-native';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

const AnimatedSplashScreen = ({ onAnimationComplete }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Start animation sequence when component mounts
    const animations = [
      // Step 1: Hold the logo for a moment
      Animated.delay(400),
      
      // Step 2: Zoom out the logo and fade out the background
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 3.0, // Scale up to create zoom out effect
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 700,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 800,
          delay: 100,
          useNativeDriver: true,
        })
      ])
    ];

    // Run the animation sequence
    Animated.sequence(animations).start(() => {
      // Call callback when animation completes
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent={false} />
      <Animated.View style={[
        styles.container, 
        { opacity: backgroundOpacity }
      ]}>
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale }
            ]
          }
        ]}>
          <Image 
            source={require('../assets/logo-placeholder.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
    elevation: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -75, // Half of width
    marginTop: -75,  // Half of height
    width: 150,
    height: 150,
    borderRadius: 75, // Make the container circular
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60, // Make the logo circular
  }
});

export default AnimatedSplashScreen; 