import { Credentials, User } from "@/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { login } from "@/app/lib/actions/auth.action";
import { redirect } from "next/navigation";

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    login: (credentials: Credentials) => void;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                isLoading: false,
                error: null,
                isAuthenticated: false,
                user: null,
                login: async (credentials: Credentials) => {
                    set({ isLoading: true, error: null, isAuthenticated: false, user: null })
                    try {
                        const response = await login(credentials);
                        localStorage.setItem('token', response.token);
                        set({
                            isLoading: false,
                            error: null,
                            isAuthenticated: true,
                            user: response.user
                        });
                    } catch (error) {
                        set({
                            isLoading: false,
                            user: null,
                            isAuthenticated: false,
                            error: (error as Error)?.message || 'Error de autenticación',
                        })
                    }
                },
                logout: () => {
                    set({ isAuthenticated: false, user: null })
                    localStorage.removeItem('token')
                    redirect('/auth')
                }, 

            }),
            {
                name: 'auth-storage'
            }
        )
    )
)