import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useOnboardingJourney } from "../../onboarding/hooks/useOnboardingJourney";
import type { OnboardingStackParamList } from "../../navigation/types";

export type GestureDemoScreenProps = NativeStackScreenProps<OnboardingStackParamList, "OnboardingGestures">;

const GestureDemoScreen = ({ navigation }: GestureDemoScreenProps) => {
  const { goToNext } = useOnboardingJourney();

  // Animation values for gesture demonstrations
  const swipeLeftProgress = useSharedValue(0);
  const swipeRightProgress = useSharedValue(0);
  const swipeDownProgress = useSharedValue(0);
  const swipeUpProgress = useSharedValue(0);
  const rotateProgress = useSharedValue(0);

  useEffect(() => {
    // Stagger the animations for a professional sequential demo
    const duration = 1200;
    const delayBetween = 400;

    // Left swipe animation
    swipeLeftProgress.value = withDelay(
      0,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );

    // Right swipe animation
    swipeRightProgress.value = withDelay(
      delayBetween * 1,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );

    // Down swipe animation
    swipeDownProgress.value = withDelay(
      delayBetween * 2,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );

    // Up swipe animation (rotation)
    swipeUpProgress.value = withDelay(
      delayBetween * 3,
      withRepeat(
        withSequence(
          withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );

    // Rotation indicator
    rotateProgress.value = withDelay(
      delayBetween * 3,
      withRepeat(
        withSequence(
          withTiming(360, { duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [
    swipeLeftProgress,
    swipeRightProgress,
    swipeDownProgress,
    swipeUpProgress,
    rotateProgress,
  ]);

  // Animated styles
  const leftSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeLeftProgress.value * -60 }],
    opacity: 0.3 + swipeLeftProgress.value * 0.7,
  }));

  const rightSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeRightProgress.value * 60 }],
    opacity: 0.3 + swipeRightProgress.value * 0.7,
  }));

  const downSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: swipeDownProgress.value * 60 }],
    opacity: 0.3 + swipeDownProgress.value * 0.7,
  }));

  const upSwipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: swipeUpProgress.value * -60 }],
    opacity: 0.3 + swipeUpProgress.value * 0.7,
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateProgress.value}deg` }],
    opacity: 0.3 + (swipeUpProgress.value * 0.7),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Master the Controls</Text>
        <Text style={styles.subtitle}>
          Learn these simple gestures to become a T3TR15 champion
        </Text>
      </View>

      <View style={styles.demoArea}>
        {/* Swipe Left Demo */}
        <View style={styles.gestureCard}>
          <View style={styles.gestureIcon}>
            <Animated.View style={leftSwipeStyle}>
              <MaterialCommunityIcons name="chevron-left" size={48} color="#00FF00" />
            </Animated.View>
          </View>
          <View style={styles.gestureInfo}>
            <Text style={styles.gestureName}>Swipe Left</Text>
            <Text style={styles.gestureDescription}>Move piece left</Text>
          </View>
        </View>

        {/* Swipe Right Demo */}
        <View style={styles.gestureCard}>
          <View style={styles.gestureIcon}>
            <Animated.View style={rightSwipeStyle}>
              <MaterialCommunityIcons name="chevron-right" size={48} color="#00FF00" />
            </Animated.View>
          </View>
          <View style={styles.gestureInfo}>
            <Text style={styles.gestureName}>Swipe Right</Text>
            <Text style={styles.gestureDescription}>Move piece right</Text>
          </View>
        </View>

        {/* Swipe Down Demo */}
        <View style={styles.gestureCard}>
          <View style={styles.gestureIcon}>
            <Animated.View style={downSwipeStyle}>
              <MaterialCommunityIcons name="chevron-down" size={48} color="#00FF00" />
            </Animated.View>
          </View>
          <View style={styles.gestureInfo}>
            <Text style={styles.gestureName}>Swipe Down</Text>
            <Text style={styles.gestureDescription}>Soft drop piece</Text>
          </View>
        </View>

        {/* Swipe Up Demo (Rotation) */}
        <View style={[styles.gestureCard, styles.highlightedCard]}>
          <View style={styles.gestureIcon}>
            <Animated.View style={upSwipeStyle}>
              <MaterialCommunityIcons name="chevron-up" size={48} color="#00FF00" />
            </Animated.View>
            <Animated.View style={[styles.rotateIcon, rotateStyle]}>
              <MaterialCommunityIcons name="rotate-right" size={32} color="#00FF00" />
            </Animated.View>
          </View>
          <View style={styles.gestureInfo}>
            <Text style={styles.gestureName}>Swipe Up</Text>
            <Text style={styles.gestureDescription}>Rotate piece clockwise</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Pro Tip:</Text> Combine quick swipes for advanced moves!
          </Text>
        </View>

        <Pressable
          style={styles.continueButton}
          onPress={() => {
            goToNext();
            navigation.replace("OnboardingTutorial");
          }}
        >
          <Text style={styles.continueButtonText}>Got It!</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#00FF00",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "#00FF00",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#00AA00",
    textAlign: "center",
    lineHeight: 24,
  },
  demoArea: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  gestureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 50, 0, 0.2)",
    borderWidth: 2,
    borderColor: "#00AA00",
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  highlightedCard: {
    borderColor: "#00FF00",
    backgroundColor: "rgba(0, 100, 0, 0.15)",
    shadowColor: "#00FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  gestureIcon: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(0, 20, 0, 0.5)",
    borderWidth: 1,
    borderColor: "#00AA00",
  },
  rotateIcon: {
    position: "absolute",
  },
  gestureInfo: {
    flex: 1,
    gap: 4,
  },
  gestureName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00FF00",
  },
  gestureDescription: {
    fontSize: 15,
    color: "#00AA00",
  },
  footer: {
    gap: 20,
    marginTop: 20,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 50, 0, 0.15)",
    borderWidth: 1,
    borderColor: "#00AA00",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#00AA00",
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: "700",
    color: "#00FF00",
  },
  continueButton: {
    backgroundColor: "#00FF00",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#00FF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  continueButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default GestureDemoScreen;
