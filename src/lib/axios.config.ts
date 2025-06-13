import axios from "axios";
import { redirect } from "next/navigation";

export const apiClient = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            redirect('/login');
        }
        return Promise.reject(error);
    }
);