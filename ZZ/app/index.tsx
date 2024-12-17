import { ScrollView, Text, View, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { Stack } from "expo-router";

export default function App() {
  return (
    <>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView className="bg-gray-900 flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
          className="px-6"
        >
          {/* Logo Section */}
          <View className="mb-12">
            <Image
              source={images.zlogo}
              className="w-[300] h-[300px] rounded-full"
              resizeMode="cover"
            />
            <Text className="text-white text-4xl font-extrabold mt-4 text-center">
               Zameen Zarien
            </Text>
          </View>

          <TouchableOpacity
            className="bg-green-600 w-full py-4 rounded-lg shadow-lg mb-4"
            activeOpacity={0.8}
          >
            <Link href="/(auth)/sign-in" className="text-white text-center text-lg font-semibold">
              Log In
            </Link>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-gray-400 text-base">Don't have an account? </Text>
            <Link href="/(auth)/sign-up" className="text-green-400 text-base font-semibold">
              Register now
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
