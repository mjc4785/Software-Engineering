import React, { useRef, useEffect } from "react";
import { View, Animated } from "react-native";
import { Marker, AnimatedRegion } from "react-native-maps";

export default function HeadingPuck({ coordinate, heading = 0 }) {
  if (!coordinate) return null;

  // Smoothly animate marker position
  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  // Smoothly animate heading rotation
  const rotation = useRef(new Animated.Value(heading)).current;

  // Animate position when coordinate changes
  useEffect(() => {
    animatedCoordinate.timing({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      duration: 200,
      useNativeDriver: false, // must be false for coordinates
    }).start();
  }, [coordinate]);

  // Animate heading smoothly
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: heading,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [heading]);

  // Interpolate rotation value
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Marker.Animated
      coordinate={animatedCoordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false} // flicker-free
    >
      <Animated.View
        style={{
          width: 60,
          height: 60,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate: rotateInterpolate }],
        }}
      >
        {/* FORWARD CONE */}
        <View
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeftWidth: 18,
            borderRightWidth: 18,
            borderTopWidth: 45,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "rgba(66, 133, 244, 0.2)",
            transform: [{ translateY: -10 }],
          }}
        />

        {/* SHADOW */}
        <View
          style={{
            position: "absolute",
            top: 32,
            width: 22,
            height: 8,
            backgroundColor: "rgba(0,0,0,0.25)",
            borderRadius: 4,
          }}
        />

        {/* BLUE DOT */}
        <View
          style={{
            width: 18,
            height: 18,
            backgroundColor: "#3A82F7",
            borderRadius: 9,
            borderWidth: 3,
            borderColor: "white",
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
          }}
        />
      </Animated.View>
    </Marker.Animated>
  );
}
