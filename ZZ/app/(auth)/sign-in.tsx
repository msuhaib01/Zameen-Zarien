import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-4">
      {/* Header Section */}
      <Text className="text-4xl font-bold text-white mb-8">Sign In</Text>

      {/* Input Fields */}
      <TextInput
        className="w-full h-12 bg-gray-700 rounded-lg text-white p-4 mb-6"
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        className="w-full h-12 bg-gray-700 rounded-lg text-white p-4 mb-6"
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      {/* Sign In Button */}
      <TouchableOpacity className="w-full py-3 bg-green-500 rounded-lg items-center mb-8">
        <Text className="text-white text-lg font-semibold">Log In</Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-white text-sm">Forgot your password? </Text>
        <TouchableOpacity>
          <Text className="text-green-500 text-sm font-bold">Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-white text-sm">Don't have an account? </Text>
        <TouchableOpacity>
          <Text className="text-green-500 text-sm font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignIn;
