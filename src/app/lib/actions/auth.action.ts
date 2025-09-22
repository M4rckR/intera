'use server'

import { Credentials } from "@/types";
import { apiClient } from "@/lib/axios.config";
import axios from "axios";

export async function login(credentials: Credentials) {
    try {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message;
            
            // Mensajes específicos según el tipo de error
            if (status === 401) {
                throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
            } else if (status === 403) {
                throw new Error('Acceso denegado. Tu cuenta puede estar desactivada.');
            } else if (status === 404) {
                throw new Error('Usuario no encontrado. Verifica tu nombre de usuario.');
            } else if (status === 429) {
                throw new Error('Demasiados intentos de login. Espera unos minutos antes de intentar nuevamente.');
            } else if (status && status >= 500) {
                throw new Error('Error del servidor. Intenta nuevamente en unos minutos.');
            } else if (serverMessage) {
                throw new Error(serverMessage);
            } else {
                throw new Error('Error de conexión. Verifica tu conexión a internet.');
            }
        }
        throw new Error('Error inesperado. Intenta nuevamente.');
    }
}