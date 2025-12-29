import "@/app/global.css"
import { LinearGradient } from "expo-linear-gradient"
import { Stack } from "expo-router"
import { SessionProvider } from "./context/SessionContext"

export default function RootLayout() {
  return (
    <SessionProvider>
    <LinearGradient
      style={{ flex: 1 }}
      colors={[
        "rgba(42, 123, 155, 1)",
        "rgba(87, 199, 133, 1)",
        "rgba(237, 221, 83, 1)",
      ]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
    >
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
    </LinearGradient>
    </SessionProvider>
  )
}
