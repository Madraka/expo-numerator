import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundRoute() {
  return (
    <View style={{ flex: 1, gap: 12, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Page not found</Text>
      <Link href="/">Back to overview</Link>
    </View>
  );
}
