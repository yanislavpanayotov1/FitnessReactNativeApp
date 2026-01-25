import { useRouter, useSegments } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SessionContext } from "./context/SessionContext";
import { UserContext } from "./context/UserContext";
import { ThemeContext } from "./context/ThemeContext";
import { useContext, useEffect, useRef } from "react";
import { API_URL } from "./utils/apiConfig";


export default function Index() {
  const router = useRouter()
  const segments = useSegments()
  const { setSessionId } = useContext(SessionContext);
  const { userId, hasPaid, hasCompletedOnboarding } = useContext(UserContext);
  const { isDark } = useContext(ThemeContext);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (userId && !hasNavigated.current) {
      if (hasPaid) {
        hasNavigated.current = true;
        router.replace({ pathname: "/dashboard" });
      } else if (hasCompletedOnboarding) {
        hasNavigated.current = true;
        router.replace({ pathname: "/paywallScreen" });
      }
      // If neither, stay here or go to questionnaire (staying is better so they can click "Get Started")
    }
  }, [userId, hasPaid, hasCompletedOnboarding, segments]);



  const startOnboarding = async () => {
    try {
      const response = await fetch(`${API_URL}/onboarding/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log(data);
      await setSessionId(data.sessionId);
    } catch (error) {
      console.error('Error starting onboarding:', error);
    }
  };

  return (
    <View className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}>
      <View className="flex-row items-center justify-between px-6 pt-14">
        <View className={`rounded-xl px-4 py-2 ${isDark ? 'bg-[#28443f]' : 'bg-white'}`}>
          <Text
            style={{ fontFamily: 'Outfit_700Bold' }}
            className={`text-xl ${isDark ? 'text-[#F2FD7D]' : 'text-gray-800'}`}
          >
            FitAI
          </Text>
        </View>
        <Pressable
          className={`rounded-full p-3 active:opacity-80 ${isDark
            ? 'bg-[#28443f]'
            : 'bg-white shadow-sm'
            }`}
          onPress={() => router.push({ pathname: "/settingsScreen" })}
        >
          <Text className={isDark ? 'text-[#F2FD7D]' : 'text-gray-700'}>⚙️</Text>
        </Pressable>
      </View>

      <View className="flex-1 justify-center px-6">
        <Text
          style={{ fontFamily: 'Outfit_700Bold' }}
          className={`text-5xl leading-tight mb-2 ${isDark ? 'text-[#F2FD7D]' : 'text-gray-900'}`}
        >
          Workouts built{'\n'}by AI.
        </Text>
        <Text
          style={{ fontFamily: 'Outfit_700Bold' }}
          className={`text-5xl leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Get stronger{'\n'}faster.
        </Text>

        <Text
          style={{ fontFamily: 'Outfit_400Regular' }}
          className={`text-base leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Personalized training plans designed specifically for your goals, experience level, and preferences.
        </Text>
      </View>


      <View className="px-6 pb-10">
        <Pressable
          className={`rounded-full py-5 mb-4 active:opacity-80 ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
            }`}
          onPress={() => {
            router.push({ pathname: "/authSelection" })
          }}
        >
          <Text
            style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
            className={`text-center text-lg ${isDark ? 'text-[#28443f]' : 'text-white'}`}
          >
            Get Started
          </Text>
        </Pressable>

        <Pressable
          className={`rounded-full py-5 active:opacity-80 ${isDark
            ? 'bg-transparent border-2 border-gray-600'
            : 'bg-transparent border-2 border-gray-300'
            }`}
          onPress={() => router.push({ pathname: "/loginScreen" })}
        >
          <Text
            style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
            className={`text-center text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}
          >
            Log in
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export const screenOptions = {
  headerShown: false,
};