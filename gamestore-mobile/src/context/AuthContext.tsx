import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const STORAGE_KEY = "gamestore.auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { user: User; token: string };
          if (parsed?.user && parsed?.token) {
            setUser(parsed.user);
            setToken(parsed.token);
          }
        }
      } catch (e) {
        console.warn("[Auth] Failed to restore session", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Login failed. Please try again.");
    }

    if (data.user?.role !== "user") {
      throw new Error(
        "This app is for customers only. Publisher and admin accounts must use the web app."
      );
    }

    setUser(data.user);
    setToken(data.token);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: data.user, token: data.token })
      );
    } catch (e) {
      console.warn("[Auth] Failed to persist session", e);
    }
  }

  async function register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Registration failed. Please try again.");
    }

    setUser(data.user);
    setToken(data.token);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: data.user, token: data.token })
      );
    } catch (e) {
      console.warn("[Auth] Failed to persist session", e);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch((e) =>
      console.warn("[Auth] Failed to clear session", e)
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
