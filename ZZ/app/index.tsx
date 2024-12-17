import { Text, View } from "react-native";
import { Link } from "expo-router";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-emerald-700 text-8xl font-pbold">ZZ!</Text>
      <Link href="/profile" className="text-blue-800">
        Go to profile
      </Link>
    </View>
  );
}
