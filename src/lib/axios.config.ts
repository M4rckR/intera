import axios from "axios";
import { redirect } from "next/navigation";
import { BACKEND_CONFIG } from "./config";

export const apiClient = axios.create({
    baseURL: BACKEND_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Client Error:', error);
        if (error.response?.status === 401) {
            // Solo ejecutar en el cliente, no en el servidor
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                redirect('/login');
            }
        }
        return Promise.reject(error);
    }
);