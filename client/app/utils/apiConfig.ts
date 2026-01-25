export const getApiUrl = () => {
    if (__DEV__) {
        // For iOS Simulator, use localhost. 
        // For Android Emulator, use 10.0.2.2.
        // For physical device in dev, use your computer's LAN IP (e.g., http://192.168.1.5:3001)
        return 'http://127.0.0.1:3001';
    }
    // Replace this with your actual Render URL after deployment
    return 'https://fitnessreactnativeapp.onrender.com';
};

export const API_URL = getApiUrl();
