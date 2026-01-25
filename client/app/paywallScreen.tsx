import { View, Text, ScrollView, Pressable, Alert, useColorScheme, Animated } from 'react-native'
import React, { useState, useContext, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { SessionContext } from './context/SessionContext'
import { UserContext } from './context/UserContext'
import { ThemeContext } from './context/ThemeContext'
import { GradientOverlay } from './components/GradientOverlay'
import { useStripe } from '@stripe/stripe-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './utils/apiConfig';


const paywallScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('annual')
  const { sessionId } = useContext(SessionContext)
  const { userId, setUserId, setUserState } = useContext(UserContext)
  const { isDark } = useContext(ThemeContext)
  const [isLoading, setIsLoading] = useState(false)

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isLoading]);

  /* ... inside component ... */
  // Removed duplicate useStripe call

  const handleSubscribe = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // 1. Create Payment Intent on backend
      const response = await fetch(`${API_URL}/payments/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPlan === 'annual' ? 5900 : 999, // Amount in cents
          currency: 'usd',
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) {
        console.error('Backend payment error', backendError);
        Alert.alert('Error', 'Failed to initialize payment');
        return;
      }

      // 2. Initialize Payment Sheet
      const { error: stripeError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'FitAI Pro',
        returnURL: 'fitnessapp2://stripe-redirect', // Important for deep linking back
      });

      if (stripeError) {
        console.error('Stripe Init Error:', stripeError);
        Alert.alert('Error', 'Payment initialization failed');
        return;
      }

      // 3. Present Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert('Payment cancelled', paymentError.message);
      } else {
        // Trigger AI Workout Generation BEFORE navigating
        // The /dashboard/:id endpoint will generate if missing
        console.log('Payment successful. Generating workout for user:', userId);

        // Mark as paid on server
        try {
          await fetch(`${API_URL}/users/mark-paid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
        } catch (err: any) {
          console.error('Failed to mark user as paid on server:', err);
        }

        // Update local state immediately so index.tsx knows we paid
        if (userId) {
          await setUserState(userId, true, true);
        }

        try {
          await fetch(`${API_URL}/dashboard/${userId}`);
        } catch (genError) {
          console.error('Generation trigger failed (non-fatal):', genError);
        }

        // Update context if possible, but I need to access setUserState from context
        // I will add setUserState to destructuring at top of component

        if (userId) {
          await setUserState(userId, true, true);
        }

        Alert.alert('Success', 'Welcome to FitAI Pro!');
        router.replace({ pathname: "/dashboard" });
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-14 pb-6">
          <Pressable
            onPress={async () => {
              await setUserState(null, false, false);
              router.replace('/');
            }}
            className="absolute top-14 right-6 z-50 bg-red-500/20 px-3 py-1 rounded"
          >
            <Text className="text-red-500 font-bold text-xs">RESET TRACE</Text>
          </Pressable>
          <Text
            style={{ fontFamily: 'Outfit_700Bold' }}
            className={`text-5xl leading-tight mb-3 ${isDark ? 'text-[#F2FD7D]' : 'text-gray-900'}`}
          >
            Unlock your{'\n'}full potential
          </Text>
          <Text
            style={{ fontFamily: 'Outfit_400Regular' }}
            className={`text-base leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Get unlimited access to AI-powered workouts and personalized training plans.
          </Text>
        </View>

        <View className="px-6 mb-6">
          <View className={`rounded-3xl p-6 ${isDark
            ? 'bg-[#1e3632] border border-[#28443f]'
            : 'bg-white border border-gray-200 shadow-sm'
            }`}>

            {/* Timeline Item 1: Today */}
            <View className="flex-row relative z-10">
              {/* Timeline Line/Marker */}
              <View className="mr-4 items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center z-20 ${isDark ? 'bg-[#28443f]' : 'bg-[#e0e7ff]'
                  }`}>
                  <Ionicons name="lock-closed" size={16} color={isDark ? '#F2FD7D' : '#4f46e5'} />
                </View>
                {/* Connection Line */}
                <LinearGradient
                  colors={isDark ? ['#F2FD7D', '#F2FD7D'] : ['#4f46e5', '#4f46e5']}
                  className="w-1 absolute top-8 bottom-[-24] rounded-full opacity-50"
                />
              </View>

              <View className="flex-1 pb-8">
                <Text style={{ fontFamily: 'Outfit_700Bold' }} className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Today
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Get instant access and see see your personalized AI workout plan.
                </Text>
              </View>
            </View>

            {/* Timeline Item 2: Day 5 */}
            <View className="flex-row relative z-10">
              <View className="mr-4 items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center z-20 ${isDark ? 'bg-[#28443f]' : 'bg-[#e0e7ff]'
                  }`}>
                  <Ionicons name="notifications" size={16} color={isDark ? '#F2FD7D' : '#4f46e5'} />
                </View>
                {/* Connection Line */}
                <LinearGradient
                  colors={isDark ? ['#F2FD7D', '#ffffff'] : ['#4f46e5', '#a5b4fc']}
                  className="w-1 absolute top-8 bottom-[-24] rounded-full opacity-50"
                />
              </View>

              <View className="flex-1 pb-8">
                <Text style={{ fontFamily: 'Outfit_700Bold' }} className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Day 5
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  We'll remind you with a notification that your trial is ending soon.
                </Text>
              </View>
            </View>

            {/* Timeline Item 3: Day 7 */}
            <View className="flex-row relative z-10">
              <View className="mr-4 items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center z-20 ${isDark ? 'bg-[#28443f]' : 'bg-[#e0e7ff]'
                  }`}>
                  <Ionicons name="star" size={16} color={isDark ? '#F2FD7D' : '#4f46e5'} />
                </View>
              </View>

              <View className="flex-1">
                <Text style={{ fontFamily: 'Outfit_700Bold' }} className={`text-lg mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Day 7
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className={`text-sm leading-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Your subscription starts. Cancel before that to avoid payment.
                </Text>
              </View>
            </View>

          </View>
        </View>

        <View className="px-6 mb-6">
          <Text
            style={{ fontFamily: 'Outfit_700Bold' }}
            className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Choose Your Plan
          </Text>

          <Pressable
            className={`rounded-2xl p-5 mb-3 ${selectedPlan === 'annual'
              ? isDark
                ? 'bg-[#F2FD7D] border-2 border-[#F2FD7D]'
                : 'bg-gray-900 border-2 border-gray-900'
              : isDark
                ? 'bg-[#1e3632] border-2 border-[#28443f]'
                : 'bg-white border-2 border-gray-200'
              }`}
            onPress={() => setSelectedPlan('annual')}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <View className={`rounded-full px-3 py-1 self-start mb-2 ${selectedPlan === 'annual'
                  ? isDark ? 'bg-[#28443f]' : 'bg-green-500'
                  : 'bg-green-500/20'
                  }`}>
                  <Text
                    style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                    className={`text-xs ${selectedPlan === 'annual'
                      ? isDark ? 'text-[#F2FD7D]' : 'text-white'
                      : 'text-green-500'
                      }`}
                  >
                    SAVE 40%
                  </Text>
                </View>
                <Text
                  style={{ fontFamily: 'Outfit_700Bold' }}
                  className={`text-lg ${selectedPlan === 'annual'
                    ? isDark ? 'text-[#28443f]' : 'text-white'
                    : isDark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  Annual Plan
                </Text>
              </View>
              <View className="items-end">
                <Text
                  style={{ fontFamily: 'Outfit_700Bold' }}
                  className={`text-2xl ${selectedPlan === 'annual'
                    ? isDark ? 'text-[#28443f]' : 'text-white'
                    : isDark ? 'text-[#F2FD7D]' : 'text-gray-900'
                    }`}
                >
                  $59
                </Text>
                <Text
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  className={`text-sm ${selectedPlan === 'annual'
                    ? isDark ? 'text-[#28443f]/70' : 'text-gray-300'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                >
                  per year
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            className={`rounded-2xl p-5 ${selectedPlan === 'monthly'
              ? isDark
                ? 'bg-[#F2FD7D] border-2 border-[#F2FD7D]'
                : 'bg-gray-900 border-2 border-gray-900'
              : isDark
                ? 'bg-[#1e3632] border-2 border-[#28443f]'
                : 'bg-white border-2 border-gray-200'
              }`}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View className="flex-row justify-between items-center">
              <Text
                style={{ fontFamily: 'Outfit_700Bold' }}
                className={`text-lg ${selectedPlan === 'monthly'
                  ? isDark ? 'text-[#28443f]' : 'text-white'
                  : isDark ? 'text-white' : 'text-gray-900'
                  }`}
              >
                Monthly Plan
              </Text>
              <View className="items-end">
                <Text
                  style={{ fontFamily: 'Outfit_700Bold' }}
                  className={`text-2xl ${selectedPlan === 'monthly'
                    ? isDark ? 'text-[#28443f]' : 'text-white'
                    : isDark ? 'text-[#F2FD7D]' : 'text-gray-900'
                    }`}
                >
                  $9.99
                </Text>
                <Text
                  style={{ fontFamily: 'Outfit_400Regular' }}
                  className={`text-sm ${selectedPlan === 'monthly'
                    ? isDark ? 'text-[#28443f]/70' : 'text-gray-300'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                >
                  per month
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        <View className="h-32" />
      </ScrollView>

      <GradientOverlay isDark={isDark} position="bottom" height={180} />

      <View className={`absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-20 ${isDark ? 'bg-[#162926]' : 'bg-[#F0F4F8]'
        }`}>
        <Pressable
          className={`rounded-full py-5 mb-3 active:opacity-80 ${isLoading
            ? isDark ? 'bg-[#F2FD7D]/50' : 'bg-gray-400'
            : isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
            }`}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          <Text
            style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
            className={`text-center text-lg ${isDark ? 'text-[#28443f]' : 'text-white'}`}
          >
            {isLoading ? 'Creating Your Plan...' : 'Start Free Trial'}
          </Text>
        </Pressable>
        <Text
          style={{ fontFamily: 'Outfit_400Regular' }}
          className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
        >
          7-day free trial • Cancel anytime
        </Text>
      </View>

      {isLoading && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center">
          <View className={`rounded-3xl p-8 items-center ${isDark ? 'bg-[#28443f]' : 'bg-white'
            }`}>
            <Animated.Text
              style={{
                fontSize: 64,
                marginBottom: 16,
                transform: [{ scale: scaleAnim }]
              }}
            >
              💪
            </Animated.Text>
            <Text
              style={{ fontFamily: 'Outfit_700Bold' }}
              className={`text-xl mb-2 ${isDark ? 'text-[#F2FD7D]' : 'text-gray-900'}`}
            >
              Generating Your Workout
            </Text>
            <Text
              style={{ fontFamily: 'Outfit_400Regular' }}
              className={`text-sm text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Our AI is creating a personalized plan just for you...
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default paywallScreen