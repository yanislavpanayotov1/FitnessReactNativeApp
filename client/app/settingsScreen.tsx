import { View, Text, Pressable, ScrollView } from 'react-native'
import React, { useContext } from 'react'
import { useRouter } from 'expo-router'
import { ThemeContext, ThemeMode } from './context/ThemeContext'

const settingsScreen = () => {
    const router = useRouter()
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext)

    const themeOptions: { mode: ThemeMode; label: string; description: string; icon: string }[] = [
        { mode: 'auto', label: 'Auto', description: 'Follow device theme', icon: '🔄' },
        { mode: 'light', label: 'Light', description: 'Always use light mode', icon: '☀️' },
        { mode: 'dark', label: 'Dark', description: 'Always use dark mode', icon: '🌙' },
    ]

    return (
        <View className={isDark ? 'flex-1 bg-[#162926]' : 'flex-1 bg-[#F0F4F8]'}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="px-6 pt-14 pb-6">
                    <Pressable
                        className={`rounded-full px-4 py-2 self-start mb-8 active:opacity-80 ${isDark ? 'bg-[#28443f]' : 'bg-white shadow-sm'
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
                        Settings
                    </Text>
                    <Text
                        style={{ fontFamily: 'Outfit_400Regular' }}
                        className={`text-base leading-6 mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Customize your app experience
                    </Text>

                    <Text
                        style={{ fontFamily: 'Outfit_700Bold' }}
                        className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                        Appearance
                    </Text>

                    {themeOptions.map((option) => (
                        <Pressable
                            key={option.mode}
                            className={`rounded-2xl p-5 mb-3 active:opacity-80 ${themeMode === option.mode
                                ? isDark
                                    ? 'bg-[#F2FD7D]'
                                    : 'bg-gray-900'
                                : isDark
                                    ? 'bg-[#1e3632] border border-[#28443f]'
                                    : 'bg-white border border-gray-200'
                                }`}
                            onPress={() => setThemeMode(option.mode)}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${themeMode === option.mode
                                    ? isDark ? 'bg-[#28443f]' : 'bg-white/20'
                                    : isDark ? 'bg-[#162926]' : 'bg-gray-100'
                                    }`}>
                                    <Text className="text-xl">{option.icon}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text
                                        style={{ fontFamily: 'Outfit_600SemiBold' }}
                                        className={`text-lg ${themeMode === option.mode
                                            ? isDark ? 'text-[#28443f]' : 'text-white'
                                            : isDark ? 'text-white' : 'text-gray-900'
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'Outfit_400Regular' }}
                                        className={`text-sm ${themeMode === option.mode
                                            ? isDark ? 'text-[#28443f]/70' : 'text-gray-300'
                                            : isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                    >
                                        {option.description}
                                    </Text>
                                </View>
                                {themeMode === option.mode && (
                                    <View className={`w-6 h-6 rounded-full items-center justify-center ${isDark ? 'bg-[#28443f]' : 'bg-white/30'
                                        }`}>
                                        <Text className={isDark ? 'text-[#F2FD7D]' : 'text-white'}>✓</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    ))}

                    <View className={`rounded-2xl p-5 mt-4 ${isDark ? 'bg-[#1e3632] border border-[#28443f]' : 'bg-white border border-gray-200'
                        }`}>
                        <Text
                            style={{ fontFamily: 'Outfit_400Regular' }}
                            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                            <Text style={{ fontFamily: 'Outfit_600SemiBold' }}>Current theme: </Text>
                            {themeMode === 'auto'
                                ? `Auto (${isDark ? 'Dark' : 'Light'} mode active)`
                                : themeMode === 'dark'
                                    ? 'Dark mode'
                                    : 'Light mode'}
                        </Text>
                    </View>
                </View>

                {/* Clear Data Section */}
                <View className="px-6 pb-10">
                    <Text
                        style={{ fontFamily: 'Outfit_700Bold' }}
                        className={`text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                        Data Management
                    </Text>
                    <Pressable
                        className={`rounded-2xl p-5 mb-3 active:opacity-80 bg-red-500/10 border border-red-500/20`}
                        onPress={async () => {
                            const { clearAllStorage } = require('./utils/clearStorage');
                            await clearAllStorage();
                            // Force reload context or navigate
                            router.replace('/');
                            alert('Data cleared! Please restart the app if issues persist.');
                        }}
                    >
                        <View className="flex-row items-center">
                            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 bg-red-500/20`}>
                                <Text className="text-xl">🗑️</Text>
                            </View>
                            <View className="flex-1">
                                <Text
                                    style={{ fontFamily: 'Outfit_600SemiBold' }}
                                    className="text-lg text-red-500"
                                >
                                    Reset App Data
                                </Text>
                                <Text
                                    style={{ fontFamily: 'Outfit_400Regular' }}
                                    className="text-sm text-red-400"
                                >
                                    Clear session and sign out
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

export default settingsScreen
