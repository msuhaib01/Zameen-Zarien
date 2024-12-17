import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-4">
      {/* Header Section */}
      <Text className="text-4xl font-bold text-white mb-8">Create Account</Text>

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
      <TextInput
        className="w-full h-12 bg-gray-700 rounded-lg text-white p-4 mb-6"
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      {/* Sign Up Button */}
      <TouchableOpacity className="w-full py-3 bg-green-500 rounded-lg items-center mb-8">
        <Text className="text-white text-lg font-semibold">Sign Up</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <View className="flex-row justify-center items-center mt-4">
        <Text className="text-white text-sm">Already have an account? </Text>
        <TouchableOpacity>
          <Text className="text-green-500 text-sm font-bold">Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;
