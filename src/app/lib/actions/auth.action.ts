'use server'

import { Credentials } from "@/types";
import { apiClient } from "@/lib/axios.config";

export async function login(credentials: Credentials) {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
}