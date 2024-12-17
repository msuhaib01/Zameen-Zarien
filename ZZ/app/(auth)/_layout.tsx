import { View } from "react-native";
import React from "react";
import { Slot } from "expo-router";

const AuthLayout = () => {
  return (
    <View className="flex-1">
      {/* This renders the child route like sign-in.tsx */}
      <Slot />
    </View>
  );
};

export default AuthLayout;
