import { createContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
    userId: number | null;
    hasPaid: boolean;
    hasCompletedOnboarding: boolean;
    setUserId: (userId: number | null) => Promise<void>;
    setUserState: (userId: number | null, hasPaid: boolean, hasCompletedOnboarding: boolean) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
    userId: null,
    hasPaid: false,
    hasCompletedOnboarding: false,
    setUserId: async () => { },
    setUserState: async () => { },
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [hasPaid, setHasPaid] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUserState();
    }, []);

    const loadUserState = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedHasPaid = await AsyncStorage.getItem('hasPaid');
            const storedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');

            if (storedUserId) {
                setUserId(parseInt(storedUserId, 10));
            }
            if (storedHasPaid === 'true') setHasPaid(true);
            if (storedOnboarding === 'true') setHasCompletedOnboarding(true);
        } catch (error) {
            console.error('Error loading user state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserId = async (newUserId: number | null) => {
        // Optimistic update
        setUserId(newUserId);
        try {
            if (newUserId !== null && newUserId !== undefined) {
                await AsyncStorage.setItem('userId', newUserId.toString());
            } else {
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('hasPaid');
                await AsyncStorage.removeItem('hasCompletedOnboarding');
                setHasPaid(false);
                setHasCompletedOnboarding(false);
            }
        } catch (error) {
            console.error('Error saving userId:', error);
        }
    };

    const updateUserState = async (newUserId: number | null, paid: boolean, onboarding: boolean) => {
        setUserId(newUserId);
        setHasPaid(paid);
        setHasCompletedOnboarding(onboarding);

        try {
            if (newUserId) {
                await AsyncStorage.setItem('userId', newUserId.toString());
                await AsyncStorage.setItem('hasPaid', paid ? 'true' : 'false');
                await AsyncStorage.setItem('hasCompletedOnboarding', onboarding ? 'true' : 'false');
            } else {
                await updateUserId(null); // Clear all
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (isLoading) {
        return null;
    }

    return (
        <UserContext.Provider value={{ userId, hasPaid, hasCompletedOnboarding, setUserId: updateUserId, setUserState: updateUserState }}>
            {children}
        </UserContext.Provider>
    );
};
