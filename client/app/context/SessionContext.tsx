import { createContext, ReactNode, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionContextType {
    sessionId: number | null;
    setSessionId: (sessionId: number | null) => Promise<void>;
}

export const SessionContext = createContext<SessionContextType>({
    sessionId: null,
    setSessionId: async () => { },
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSessionId();
    }, []);

    const loadSessionId = async () => {
        try {
            const storedSessionId = await AsyncStorage.getItem('sessionId');
            if (storedSessionId) {
                setSessionId(parseInt(storedSessionId, 10));
            }
        } catch (error) {
            console.error('Error loading sessionId:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSessionId = async (newSessionId: number | null) => {
        try {
            if (newSessionId !== null) {
                await AsyncStorage.setItem('sessionId', newSessionId.toString());
            } else {
                await AsyncStorage.removeItem('sessionId');
            }
            setSessionId(newSessionId);
        } catch (error) {
            console.error('Error saving sessionId:', error);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <SessionContext.Provider value={{ sessionId, setSessionId: updateSessionId }}>
            {children}
        </SessionContext.Provider>
    );
};