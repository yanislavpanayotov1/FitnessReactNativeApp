import { View, Text, Pressable, Platform, Alert, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { ThemeContext } from './context/ThemeContext'
import { UserContext } from './context/UserContext'
import { SessionContext } from './context/SessionContext'
import * as AppleAuthentication from 'expo-apple-authentication'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { API_URL } from './utils/apiConfig'


// Configure Google Sign-In (You should move this to a better place later)
GoogleSignin.configure({
    // scopes: ['https://www.googleapis.com/auth/userinfo.email'], // what API you want to access on behalf of the user, default is email and profile
    webClientId: '420827662342-5kcih15bfohb6g4r7v00000r6817r4sj.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
    iosClientId: '420827662342-th2o11i3gk39k4j08eh4rededdfognf2.apps.googleusercontent.com', // [NEW] Required for iOS if no GoogleService-Info.plist
    offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
});

const authSelection = () => {
    const router = useRouter()
    const { isDark } = useContext(ThemeContext)
    const { setUserId, setUserState } = useContext(UserContext)
    const { setSessionId } = useContext(SessionContext)
    const [loading, setLoading] = React.useState(false)

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log('Google User Info:', userInfo);

            // Verify with backend
            const res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: userInfo.data?.idToken }),
            });
            const data = await res.json();

            if (!data.user_id) throw new Error('User ID missing from server response');
            console.log('Server verified user ID:', data.user_id);

            await setUserState(
                data.user_id,
                !!data.has_paid,
                !!data.has_completed_onboarding
            );

            // Priority 1: Missing Onboarding Data
            // Even if paid, we need their answers to generate a workout.
            if (!data.has_completed_onboarding) {
                // Create onboarding session
                const sessionRes = await fetch(`${API_URL}/onboarding/session`, {
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
                // user cancelled the login flow
                console.log('Cancelled');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
                console.log('In Progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                Alert.alert('Error', 'Google Play Services not available');
            } else {
                // some other error happened
                console.error(error);
                Alert.alert('Error', 'Google Sign-In failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            setLoading(true);
            // Verify with backend
            const res = await fetch(`${API_URL}/auth/apple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identityToken: credential.identityToken, user: credential.user, email: credential.email, fullName: credential.fullName }),
            });
            const data = await res.json();

            if (res.ok) {
                setUserId(data.user_id);
                // Create onboarding session
                const sessionRes = await fetch(`${API_URL}/onboarding/session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: data.user_id })
                });
                const sessionData = await sessionRes.json();
                setSessionId(sessionData.sessionId);

                router.replace('/questionnaire');
            } else {
                Alert.alert('Error', data.error || 'Apple Sign-In failed');
            }

        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
            } else {
                Alert.alert('Error', 'Apple Sign-In failed');
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 justify-center px-6 ${isDark ? 'bg-[#162926]' : 'bg-[#F0F4F8]'}`}>
            <View className="mb-10">
                <Text
                    style={{ fontFamily: 'Outfit_700Bold' }}
                    className={`text-4xl text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                    Create your account
                </Text>
                <Text
                    style={{ fontFamily: 'Outfit_400Regular' }}
                    className={`text-center text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                    Save your progress and access your personalized plan across devices.
                </Text>
            </View>

            {/* Google Button */}
            <Pressable
                className={`flex-row items-center justify-center rounded-full py-4 mb-4 border ${isDark ? 'bg-white border-white' : 'bg-white border-gray-300'}`}
                onPress={handleGoogleLogin}
                disabled={loading}
            >
                {/* Using a simple Text icon for now, usually you'd use an SVG or Image */}
                <Text className="text-xl mr-3">G</Text>
                <Text
                    style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                    className="text-gray-900 text-lg"
                >
                    Continue with Google
                </Text>
            </Pressable>

            {/* Apple Button - Only on iOS usually, but we can show it or conditional render */}
            {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                    buttonStyle={isDark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={100} // Rounded like others
                    style={{ width: '100%', height: 56, marginBottom: 16 }}
                    onPress={handleAppleLogin}
                />
            )}

            {/* Email Button */}
            <Pressable
                className={`flex-row items-center justify-center rounded-full py-4 mb-6 ${isDark ? 'bg-[#28443f]' : 'bg-gray-900'}`}
                onPress={() => router.push('/registerScreen')}
                disabled={loading}
            >
                <Text
                    style={{ fontFamily: 'SpaceGrotesk_700Bold' }}
                    className="text-white text-lg"
                >
                    Sign up with Email
                </Text>
            </Pressable>

            <Pressable onPress={() => router.push('/loginScreen')}>
                <Text
                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                    className={`text-center mt-4 ${isDark ? 'text-[#F2FD7D]' : 'text-gray-900'}`}
                >
                    Already have an account? Log in
                </Text>
            </Pressable>

            {loading && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <ActivityIndicator size="large" color="#F2FD7D" />
                </View>
            )}
        </View>
    )
}

export default authSelection
