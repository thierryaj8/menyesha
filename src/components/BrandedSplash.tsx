import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

/**
 * Branded startup splash: dark screen → logo reveal → wordmark → tagline → fade out.
 * Mounted once at the root; it unmounts itself after the intro plays, so it never
 * reappears during navigation or re-renders.
 */
export function BrandedSplash() {
  const { width } = useWindowDimensions();
  const [done, setDone] = useState(false);

  const [overlayOpacity] = useState(() => new Animated.Value(1));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [logoScale] = useState(() => new Animated.Value(0.92));
  const [glowOpacity] = useState(() => new Animated.Value(0));
  const [wordmarkOpacity] = useState(() => new Animated.Value(0));
  const [wordmarkY] = useState(() => new Animated.Value(10));
  const [taglineOpacity] = useState(() => new Animated.Value(0));
  const [taglineY] = useState(() => new Animated.Value(10));

  useEffect(() => {
    Animated.parallel([
      // Logo: fade in + gentle scale + soft glow reveal
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // Wordmark fades in just after the logo starts appearing
      Animated.sequence([
        Animated.delay(550),
        Animated.parallel([
          Animated.timing(wordmarkOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wordmarkY, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Tagline follows the wordmark
      Animated.sequence([
        Animated.delay(950),
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(taglineY, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Hold the composed mark, then fade the whole splash out
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) setDone(true);
    });
  }, [glowOpacity, logoOpacity, logoScale, overlayOpacity, taglineOpacity, taglineY, wordmarkOpacity, wordmarkY]);

  if (done) return null;

  const logoSize = Math.min(width * 0.4, 190);
  const stageSize = Math.max(logoSize * 2.4, 420);

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayOpacity }]}
      pointerEvents={done ? 'none' : 'auto'}
    >
      <StatusBar style="light" />

      <View style={styles.center}>
        {/* Square stage that centers the logo, glow, and radial lift */}
        <View style={{ width: stageSize, height: stageSize, alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.radialOuter, { top: (stageSize - 420) / 2, left: (stageSize - 420) / 2 }]} pointerEvents="none" />
          <View style={[styles.radialMid, { top: (stageSize - 300) / 2, left: (stageSize - 300) / 2 }]} pointerEvents="none" />
          <View style={[styles.radialInner, { top: (stageSize - 190) / 2, left: (stageSize - 190) / 2 }]} pointerEvents="none" />

          {/* Soft blue glow behind the logo */}
          <Animated.View
            style={[
              styles.glow,
              {
                width: logoSize * 1.7,
                height: logoSize * 1.7,
                borderRadius: logoSize,
                top: (stageSize - logoSize * 1.7) / 2,
                left: (stageSize - logoSize * 1.7) / 2,
              },
              { opacity: glowOpacity },
            ]}
            pointerEvents="none"
          />

          <Animated.Image
          source={require('../../assets/android-icon-foreground.png')}
          resizeMode="contain"
          style={{
            width: logoSize,
            height: logoSize,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
          accessibilityLabel="MENYESHA logo"
        />
        </View>

        <Animated.Text
          style={[
            styles.wordmark,
            { opacity: wordmarkOpacity, transform: [{ translateY: wordmarkY }] },
          ]}
        >
          MENYESHA
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
          ]}
        >
          Report. Protect. Connect.
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B1424',
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(79, 156, 249, 0.14)',
  },
  radialOuter: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(30, 58, 110, 0.16)',
  },
  radialMid: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(36, 72, 130, 0.14)',
  },
  radialInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(44, 88, 150, 0.12)',
  },
  wordmark: {
    marginTop: 26,
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 26,
    letterSpacing: 6,
    color: '#F8FAFC',
    textAlign: 'center',
  },
  tagline: {
    marginTop: 10,
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    letterSpacing: 2.4,
    color: '#8FA3BF',
    textAlign: 'center',
  },
});
