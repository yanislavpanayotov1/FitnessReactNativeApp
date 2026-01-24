import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useContext } from 'react'
import { useRouter } from 'expo-router'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { UserContext } from './context/UserContext'
import { SessionContext } from './context/SessionContext'
import { ThemeContext } from './context/ThemeContext'

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '420827662342-5kcih15bfohb6g4r7v00000r6817r4sj.apps.googleusercontent.com',
    iosClientId: '420827662342-th2o11i3gk39k4j08eh4rededdfognf2.apps.googleusercontent.com',
    offlineAccess: true,
});

const loginScreen = () => {
    const router = useRouter()
    const { setUserState } = useContext(UserContext)
    const { setSessionId } = useContext(SessionContext)
    const { isDark } = useContext(ThemeContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // Verify with backend
            const res = await fetch('http://127.0.0.1:3001/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: userInfo.data?.idToken }),
            });
            const data = await res.json();

            if (!data.user_id) throw new Error('User ID missing from server response');

            await setUserState(
                data.user_id,
                !!data.has_paid,
                !!data.has_completed_onboarding
            );

            // Priority 1: Missing Onboarding Data
            if (!data.has_completed_onboarding) {
                // Create onboarding session
                const sessionRes = await fetch('http://127.0.0.1:3001/onboarding/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: data.user_id })
                });
                const sessionData = await sessionRes.json();
                setSessionId(sessionData.sessionId);

                router.replace('/questionnaire');
                return;
            }

            // Priority 2: Paid Status
            if (data.has_paid) {
                router.replace('/dashboard');
                return;
            }

            // Priority 3: Paywall
            router.replace('/paywallScreen');

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('Cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('In Progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available');
            } else {
                console.error(error);
                Alert.alert('Error', 'Google Sign-In failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('http://127.0.0.1:3001/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                if (!data.id) throw new Error('User ID missing from server response');

                await setUserState(
                    data.id,
                    !!data.has_paid,
                    !!data.has_completed_onboarding
                );

                console.log(`User logged in with ID: ${data.id}, Paid: ${data.has_paid}`);

                if (data.has_paid) {
                    router.replace({ pathname: "/dashboard" })
                } else if (data.has_completed_onboarding) {
                    router.replace({ pathname: "/paywallScreen" })
                } else {
                    router.replace({ pathname: "/questionnaire" })
                }
            } else {
                setError(data.error || 'Login failed. Please try again.')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-14 pb-6">
                    <Pressable
                        className={`rounded-full px-4 py-2 self-start mb-8 active:opacity-80 ${isDark
                            ? 'bg-[#28443f]'
                            : 'bg-white shadow-sm'
                            }`}
                        onPress={() => router.back()}
                    >
                        <Text
                            style={{ fontFamily: 'SpaceGrotesk_500Medium' }}
                            className={isDark ? 'text-[#F2FD7D]' : 'text-gray-700'}
                        >
                            ← Back
                        </Text>
                    </Pressable>

                    <Text
                        style={{ fontFamily: 'Outfit_700Bold' }}
                        className={`text-5xl leading-tight mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                        Welcome{'\n'}back
                    </Text>
                    <Text
                        style={{ fontFamily: 'Outfit_400Regular' }}
                        className={`text-base leading-6 mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Log in to access your personalized workout plan.
                    </Text>

                    <View className="mb-5">
                        <Text
                            style={{ fontFamily: 'Outfit_600SemiBold' }}
                            className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                            Email
                        </Text>
                        <TextInput
                            style={{ fontFamily: 'Outfit_400Regular' }}
                            className={`rounded-2xl px-4 py-4 text-base ${isDark
                                ? 'bg-[#1e3632] border border-[#28443f] text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                            placeholder="your.email@example.com"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            textContentType="none"
                            spellCheck={false}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    <View className="mb-6">
                        <Text
                            style={{ fontFamily: 'Outfit_600SemiBold' }}
                            className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                            Password
                        </Text>
                        <TextInput
                            style={{ fontFamily: 'Outfit_400Regular' }}
                            className={`rounded-2xl px-4 py-4 text-base ${isDark
                                ? 'bg-[#1e3632] border border-[#28443f] text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                            placeholder="Enter your password"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                            textContentType="oneTimeCode"
                            spellCheck={false}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    {error && (
                        <View className={`rounded-2xl p-4 mb-4 ${isDark ? 'bg-red-900/30 border border-red-500/50' : 'bg-red-50 border border-red-200'
                            }`}>
                            <Text
                                style={{ fontFamily: 'Outfit_600SemiBold' }}
                                className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}
                            >
                                ⚠️ {error}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View className="px-6 pb-10">
                {/* Google Button */}
                <Pressable
                    className={`flex-row items-center justify-center rounded-full py-4 mb-4 border ${isDark ? 'bg-white border-white' : 'bg-white border-gray-300'}`}
                    onPress={handleGoogleLogin}
                    disabled={isLoading}
                >
                    <Text className="text-xl mr-3">G</Text>
                    <Text
                        style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                        className="text-gray-900 text-lg"
                    >
                        Sign in with Google
                    </Text>
                </Pressable>

                <View className="flex-row items-center justify-center mb-6">
                    <View className={`h-[1px] flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    <Text className={`mx-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>OR</Text>
                    <View className={`h-[1px] flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </View>

                <Pressable
                    className={`rounded-full py-5 mb-4 active:opacity-80 ${isLoading
                        ? isDark ? 'bg-[#F2FD7D]/50' : 'bg-gray-400'
                        : isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'
                        }`}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View className="flex-row items-center justify-center">
                            <ActivityIndicator color={isDark ? '#28443f' : '#fff'} />
                            <Text
                                style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                                className={`text-lg ml-2 ${isDark ? 'text-[#28443f]' : 'text-white'}`}
                            >
                                Signing In...
                            </Text>
                        </View>
                    ) : (
                        <Text
                            style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                            className={`text-center text-lg ${isDark ? 'text-[#28443f]' : 'text-white'}`}
                        >
                            Sign In
                        </Text>
                    )}
                </Pressable>

                <View className="flex-row items-center justify-center">
                    <Text
                        style={{ fontFamily: 'Outfit_400Regular' }}
                        className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                        Don't have an account?{' '}
                    </Text>
                    <Pressable onPress={() => router.replace({ pathname: "/authSelection" })}>
                        <Text
                            style={{ fontFamily: 'Outfit_700Bold' }}
                            className={`text-sm ${isDark ? 'text-[#F2FD7D]' : 'text-gray-900'}`}
                        >
                            Create Account
                        </Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default loginScreen
