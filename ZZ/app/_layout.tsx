import { Stack } from "expo-router";
import { Slot } from "expo-router";
import { Text, View } from "react-native";
import "../global.css";

// export default function RootLayout() {
//   return (
//     <View>
//       <Text>Header</Text>
//       <Slot />
//       <Text>Footer</Text>
//     </View>
//   );
// }

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index"></Stack.Screen>
    </Stack>
  );
}
