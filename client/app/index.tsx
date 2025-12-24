import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SessionContext } from "./context/SessionContext";
import { useContext } from "react";

export default function Index() {
  const router = useRouter()
  const { setSessionId } = useContext(SessionContext);

  const startOnboarding = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/onboarding/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log(data);
      setSessionId(data.sessionId);
    } catch (error) {
      console.error('Error starting onboarding:', error);
    }
  };

  return (
    <View className="flex-1 h-screen w-screen">
      <View className="flex-row items-center justify-center">
        <View
          className="flex-1 items-start justify-center w-1/2 h-30 mt-[50px]"
          id="header"
        >
          <Text className="text-2xl font-bold text-left ml-4">
            Ne sum izmislil ime
          </Text>
        </View>
        <View className="flex-1 items-end p-2 justify-center w-1/2 h-30 mt-[50px]">
          <Pressable className="p-2" onPress={() => console.log("In")}>
            <Text className="text-white text-center font-bold">Sign In</Text>
          </Pressable>
        </View>
      </View>
      <View className="flex-1 items-start ml-4 justify-start mt-[100px]">
        <Text className="text-2xl text-black font-bold text-left">Workouts built by AI.</Text>
        <Text className="text-2xl text-black font-bold text-left">Get stronger faster.</Text>
        <Text className="text-1xl text-black font-medium text-left mt-4">Ne sum izmislil ime uses AI to create personalized workouts for you.</Text>
      </View>
      <View className="flex-1 items-center justify-end mb-10">
        <Pressable
          className="p-2 bg-lime-200 rounded-full w-1/2"
          onPress={() => {
            startOnboarding();
            router.push({ pathname: "/questionnaire"})
          }}
        >
          <Text className="text-black text-center font-bold text-xl">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export const screenOptions = {
  headerShown: false,
};