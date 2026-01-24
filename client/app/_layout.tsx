import "@/app/global.css"
import { Stack } from "expo-router"
import { SessionProvider } from "./context/SessionContext"
import { UserProvider } from "./context/UserContext"
import { ThemeProvider } from "./context/ThemeContext"
import { useFonts, Outfit_700Bold, Outfit_600SemiBold, Outfit_400Regular } from '@expo-google-fonts/outfit'
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { View, ActivityIndicator } from 'react-native'

import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#162926' }}>
        <ActivityIndicator size="large" color="#F2FD7D" />
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.fitnessapp2"
    >
      <ThemeProvider>
        <UserProvider>
          <SessionProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SessionProvider>
        </UserProvider>
      </ThemeProvider>
    </StripeProvider>
  )
}
