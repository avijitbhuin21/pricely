export interface SignupResponse {
    status: 'success' | 'error';
    message: string;
}

export interface UserData {
    name: string;
    phoneNumber: string;
}

export interface ApiError extends Error {
    code?: string;
    status?: number;
}