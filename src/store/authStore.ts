import { create } from 'zustand';
import { config } from '../config'; // Adjust the import path as necessary

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const BASE_URL = config.BASE_URL;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  login: () => {
    window.location.href = `${BASE_URL}/login`;
  },

  logout: () => {
    window.location.href = `${BASE_URL}/logout`;
  },

  checkAuth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          isAuthenticated: !!data.user
        });
      } else {
        set({
          user: null,
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      set({
        user: null,
        isAuthenticated: false
      });
    }
  }
}));