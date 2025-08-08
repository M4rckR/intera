'use server'

import { Credentials } from "@/types";
import { apiClient } from "@/lib/axios.config";
import axios from "axios";

export async function login(credentials: Credentials) {
    try {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(`Login failed: ${error.response?.data?.message || error.message}`);
        }
        throw new Error('Login failed: Unknown error');
    }
}