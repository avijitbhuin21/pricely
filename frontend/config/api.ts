const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://noble-raven-entirely.ngrok-free.app',
    ENDPOINTS: {
        SIGNUP: '/signup',
        SIGNIN: '/login',
    }
};

export default API_CONFIG;