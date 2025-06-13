import { Credentials, User } from "@/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { login } from "@/app/lib/actions/auth.action";

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
                    const response = await login(credentials);
                    console.log(response)
                },
                logout: () => {
                    set({ isAuthenticated: false, user: null })
                },

            }),
            {
                name: 'auth-storage'
            }
        )
    )
)