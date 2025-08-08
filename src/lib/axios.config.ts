import axios from "axios";
import { redirect } from "next/navigation";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            redirect('/login');
        }
        // console.log("OSITO GOMINOLA:", error.response?.data);
        // return error.response
        return Promise.reject(error);
    }
);