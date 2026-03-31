import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// Precomputed line lengths (center 60,60 → each endpoint)
const L1 = 57; // → (20,20)
const L2 = 61; // → (100,15)
const L3 = 51; // → (110,70)
const L4 = 52; // → (15,85)
const L5 = 52; // → (45,110)
const L6 = 61; // → (100,105)

// Phase 2 layout (screen center = 0)
// Logo: 120x120  Text SVG: 175x62  Gap: 12
// Combined width: 307px
// Logo center:  -(175/2 + 12/2) = -93.5 ≈ -94
// Text center:  +(120/2 + 12/2) = +66
const LOGO_FINAL_X = -94;
const TEXT_FINAL_X = 66;
const TEXT_START_X = 0; // starts at center (behind logo), slides right

const DRAW = { duration: 380, easing: Easing.out(Easing.cubic) };
const NODE_SPRING = { damping: 14, stiffness: 200 };
const SLIDE_CONFIG = { duration: 350, easing: Easing.out(Easing.cubic) };

interface Props {
  onAnimationComplete?: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: Props) {
  // — Phase 1: logo build-up —
  const centralR = useSharedValue(0);
  const centralOpacity = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  const d1 = useSharedValue(L1);
  const d2 = useSharedValue(L2);
  const d3 = useSharedValue(L3);
  const d4 = useSharedValue(L4);
  const d5 = useSharedValue(L5);
  const d6 = useSharedValue(L6);

  const n1 = useSharedValue(0);
  const n2 = useSharedValue(0);
  const n3 = useSharedValue(0);
  const n4 = useSharedValue(0);
  const n5 = useSharedValue(0);
  const n6 = useSharedValue(0);

  const sparkOpacity = useSharedValue(0);

  // — Phase 2: slide apart —
  const logoX = useSharedValue(0);
  const textX = useSharedValue(TEXT_START_X);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Central node
    centralOpacity.value = withTiming(1, { duration: 300 });
    centralR.value = withSpring(16, { damping: 10, stiffness: 180 });
    ringOpacity.value = withDelay(350, withTiming(0.4, { duration: 300 }));

    // Lines draw outward
    d1.value = withDelay(500, withTiming(0, DRAW));
    d2.value = withDelay(580, withTiming(0, DRAW));
    d3.value = withDelay(640, withTiming(0, DRAW));
    d4.value = withDelay(700, withTiming(0, DRAW));
    d5.value = withDelay(760, withTiming(0, DRAW));
    d6.value = withDelay(820, withTiming(0, DRAW));

    // Outer nodes pop in
    n1.value = withDelay(900, withSpring(1, NODE_SPRING));
    n2.value = withDelay(960, withSpring(1, NODE_SPRING));
    n3.value = withDelay(1020, withSpring(1, NODE_SPRING));
    n4.value = withDelay(1080, withSpring(1, NODE_SPRING));
    n5.value = withDelay(1140, withSpring(1, NODE_SPRING));
    n6.value = withDelay(1200, withSpring(1, NODE_SPRING));

    sparkOpacity.value = withDelay(1350, withTiming(1, { duration: 400 }));

    // Phase 2: logo slides left, text slides in from right
    logoX.value = withDelay(1700, withTiming(LOGO_FINAL_X, SLIDE_CONFIG));
    textX.value = withDelay(1700, withTiming(TEXT_FINAL_X, SLIDE_CONFIG));
    textOpacity.value = withDelay(1750, withTiming(1, { duration: 350 }));

    if (onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 3700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Animated props — logo elements
  const centralProps = useAnimatedProps(() => ({
    r: centralR.value,
    opacity: centralOpacity.value,
  }));
  const ringProps = useAnimatedProps(() => ({ opacity: ringOpacity.value }));

  const line1Props = useAnimatedProps(() => ({ strokeDasharray: `${L1} ${L1}`, strokeDashoffset: d1.value }));
  const line2Props = useAnimatedProps(() => ({ strokeDasharray: `${L2} ${L2}`, strokeDashoffset: d2.value }));
  const line3Props = useAnimatedProps(() => ({ strokeDasharray: `${L3} ${L3}`, strokeDashoffset: d3.value }));
  const line4Props = useAnimatedProps(() => ({ strokeDasharray: `${L4} ${L4}`, strokeDashoffset: d4.value }));
  const line5Props = useAnimatedProps(() => ({ strokeDasharray: `${L5} ${L5}`, strokeDashoffset: d5.value }));
  const line6Props = useAnimatedProps(() => ({ strokeDasharray: `${L6} ${L6}`, strokeDashoffset: d6.value }));

  const node1Props = useAnimatedProps(() => ({ r: 7 * n1.value, opacity: 0.7 * n1.value }));
  const node2Props = useAnimatedProps(() => ({ r: 5.5 * n2.value, opacity: 0.6 * n2.value }));
  const node3Props = useAnimatedProps(() => ({ r: 5 * n3.value, opacity: 0.5 * n3.value }));
  const node4Props = useAnimatedProps(() => ({ r: 5 * n4.value, opacity: 0.5 * n4.value }));
  const node5Props = useAnimatedProps(() => ({ r: 6 * n5.value, opacity: 0.65 * n5.value }));
  const node6Props = useAnimatedProps(() => ({ r: 4.5 * n6.value, opacity: 0.45 * n6.value }));

  const spark1Props = useAnimatedProps(() => ({ opacity: sparkOpacity.value * 0.9 }));
  const spark2Props = useAnimatedProps(() => ({ opacity: sparkOpacity.value * 0.7 }));
  const spark3Props = useAnimatedProps(() => ({ opacity: sparkOpacity.value * 0.7 }));

  // Animated styles — phase 2 slide
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: logoX.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textX.value }],
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>

      {/* Logo — centered, slides left in phase 2 */}
      <Animated.View style={[styles.fill, logoStyle]}>
        <Svg width={120} height={120} viewBox="-10 -10 140 140">
          <Defs>
            <LinearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#4361EE" />
              <Stop offset="100%" stopColor="#7C3AED" />
            </LinearGradient>
            <LinearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#7C3AED" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
            <LinearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#4361EE" />
              <Stop offset="50%" stopColor="#7C3AED" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
          </Defs>
          <G>
            {/* Connection lines */}
            <AnimatedLine x1="60" y1="60" x2="20" y2="20" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round" opacity={0.6} animatedProps={line1Props} />
            <AnimatedLine x1="60" y1="60" x2="100" y2="15" stroke="url(#g2)" strokeWidth="2.5" strokeLinecap="round" opacity={0.5} animatedProps={line2Props} />
            <AnimatedLine x1="60" y1="60" x2="110" y2="70" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" opacity={0.4} animatedProps={line3Props} />
            <AnimatedLine x1="60" y1="60" x2="15" y2="85" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" opacity={0.4} animatedProps={line4Props} />
            <AnimatedLine x1="60" y1="60" x2="45" y2="110" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round" opacity={0.5} animatedProps={line5Props} />
            <AnimatedLine x1="60" y1="60" x2="100" y2="105" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" opacity={0.35} animatedProps={line6Props} />

            {/* Outer nodes */}
            <AnimatedCircle cx="20" cy="20" fill="url(#g1)" animatedProps={node1Props} />
            <AnimatedCircle cx="100" cy="15" fill="url(#g2)" animatedProps={node2Props} />
            <AnimatedCircle cx="110" cy="70" fill="url(#g1)" animatedProps={node3Props} />
            <AnimatedCircle cx="15" cy="85" fill="url(#g2)" animatedProps={node4Props} />
            <AnimatedCircle cx="45" cy="110" fill="url(#g1)" animatedProps={node5Props} />
            <AnimatedCircle cx="100" cy="105" fill="url(#g2)" animatedProps={node6Props} />

            {/* Spark dots */}
            <AnimatedCircle cx="40" cy="40" r={2.5} fill="#fff" animatedProps={spark1Props} />
            <AnimatedCircle cx="80" cy="37" r={2} fill="#fff" animatedProps={spark2Props} />
            <AnimatedCircle cx="52" cy="85" r={2} fill="#fff" animatedProps={spark3Props} />

            {/* Central node */}
            <AnimatedCircle cx="60" cy="60" fill="url(#g3)" animatedProps={centralProps} />
            <AnimatedCircle cx="60" cy="60" r={10} fill="none" stroke="#fff" strokeWidth="1.5" animatedProps={ringProps} />
          </G>
        </Svg>
      </Animated.View>

      {/* "synaps" text — slides in from right */}
      <Animated.View style={[styles.fill, textStyle]}>
        <Svg width={175} height={62} viewBox="0 0 175 62">
          <Defs>
            <LinearGradient id="text-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="175" y2="0">
              <Stop offset="0%" stopColor="#4361EE" />
              <Stop offset="50%" stopColor="#7C3AED" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
          </Defs>
          <SvgText
            x="0"
            y="48"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            fontSize="46"
            fontWeight="400"
            fill="url(#text-grad)"
            letterSpacing="-1"
          >
            synaps
          </SvgText>
        </Svg>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Full-screen fill so translateX shifts from screen center
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
