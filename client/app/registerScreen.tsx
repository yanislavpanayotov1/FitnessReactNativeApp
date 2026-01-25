import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native'
import React, { useState, useContext } from 'react'
import { useRouter } from 'expo-router'
import { ThemeContext } from './context/ThemeContext'
import { UserContext } from './context/UserContext'
import { SessionContext } from './context/SessionContext'
import { API_URL } from './utils/apiConfig'


const registerScreen = () => {
    const router = useRouter()
    const { isDark } = useContext(ThemeContext)
    const { setUserId } = useContext(UserContext)
    const { setSessionId } = useContext(SessionContext)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // First register the user
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    fullName: name,
                    // We might not have a session ID yet if coming straight here, 
                    // or we might want to create one.
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setUserId(data.user_id);

                // Start a session for the questionnaire
                const sessionRes = await fetch(`${API_URL}/onboarding/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: data.user_id })
                });
                const sessionData = await sessionRes.json();
                setSessionId(sessionData.sessionId);

                router.replace('/questionnaire');
            } else {
                Alert.alert('Registration Failed', data.error || 'Please try again');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${isDark ? 'bg-[#162926]' : 'bg-[#F0F4F8]'}`}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View className="mb-8">
                    <Text
                        style={{ fontFamily: 'Outfit_700Bold' }}
                        className={`text-4xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                        Sign Up
                    </Text>
                    <Text
                        style={{ fontFamily: 'Outfit_400Regular' }}
                        className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Create an account to start your journey
                    </Text>
                </View>

                <View className="space-y-4 mb-6">
                    <View>
                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</Text>
                        <TextInput
                            className={`p-4 rounded-xl ${isDark ? 'bg-[#1e3632] text-white border border-[#28443f]' : 'bg-white text-gray-900 border border-gray-200'}`}
                            placeholder="John Doe"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View>
                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</Text>
                        <TextInput
                            className={`p-4 rounded-xl ${isDark ? 'bg-[#1e3632] text-white border border-[#28443f]' : 'bg-white text-gray-900 border border-gray-200'}`}
                            placeholder="john@example.com"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View>
                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</Text>
                        <TextInput
                            className={`p-4 rounded-xl ${isDark ? 'bg-[#1e3632] text-white border border-[#28443f]' : 'bg-white text-gray-900 border border-gray-200'}`}
                            placeholder="••••••••"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <View>
                        <Text className={`mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</Text>
                        <TextInput
                            className={`p-4 rounded-xl ${isDark ? 'bg-[#1e3632] text-white border border-[#28443f]' : 'bg-white text-gray-900 border border-gray-200'}`}
                            placeholder="••••••••"
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                </View>

                <Pressable
                    className={`rounded-full py-5 mb-4 active:opacity-80 ${isDark ? 'bg-[#F2FD7D]' : 'bg-gray-900'}`}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={isDark ? '#28443f' : 'white'} />
                    ) : (
                        <Text
                            style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                            className={`text-center text-lg ${isDark ? 'text-[#28443f]' : 'text-white'}`}
                        >
                            Create Account
                        </Text>
                    )}
                </Pressable>

                <Pressable onPress={() => router.back()} className="mt-4">
                    <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Back to Sign In
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default registerScreen
