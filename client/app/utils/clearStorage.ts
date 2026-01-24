import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
    try {
        await AsyncStorage.multiRemove(['userId', 'sessionId']);
        console.log('Storage cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
};

export const clearUserId = async () => {
    try {
        await AsyncStorage.removeItem('userId');
        console.log('UserId cleared');
        return true;
    } catch (error) {
        console.error('Error clearing userId:', error);
        return false;
    }
};

export const clearSessionId = async () => {
    try {
        await AsyncStorage.removeItem('sessionId');
        console.log('SessionId cleared');
        return true;
    } catch (error) {
        console.error('Error clearing sessionId:', error);
        return false;
    }
};

export const getStorageData = async () => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        const sessionId = await AsyncStorage.getItem('sessionId');
        console.log('Current storage:', { userId, sessionId });
        return { userId, sessionId };
    } catch (error) {
        console.error('Error reading storage:', error);
        return null;
    }
};

export default { clearAllStorage, clearUserId, clearSessionId, getStorageData };
