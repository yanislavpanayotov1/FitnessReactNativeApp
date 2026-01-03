import { Pressable, View } from 'react-native'
import React from 'react'
import { Text } from 'react-native'
import { useRouter } from 'expo-router'

const paywallScreen = () => {
  const router = useRouter()
  return (
    <View className="flex-1 h-screen w-screen">
          <View className="flex-row items-center justify-center">
            <View
              className="flex-1 items-start justify-center w-1/2 h-30 mt-[50px]"
              id="header"
            >
              <Text className="text-2xl font-bold text-left ml-4">
                Paywall
              </Text>
            </View>
            
          </View>
          <View className="flex-1 items-center justify-center mt-4">
              <Text>Unlock unlimited access to all workouts</Text>
            </View>
          <View className="flex-1 items-center justify-center mt-[100px]">
            <Text className="text-2xl text-black font-bold text-left">Subscribe to get access to all workouts</Text>
            <Text className="text-1xl text-black font-medium text-center mt-4">PaywallScreen uses AI to create personalized workouts for you.</Text>
          </View>
          <View className="flex-1 items-center justify-end mb-10">
            <Pressable
              className="p-2 bg-lime-200 rounded-full w-1/2"
              onPress={() => { 
                router.push({ pathname: "/dashboard"})
              }}
            >
              <Text className="text-black text-center font-bold text-xl">
                Buy
              </Text>
            </Pressable>
          </View>
        </View>
  )
}

export default paywallScreen