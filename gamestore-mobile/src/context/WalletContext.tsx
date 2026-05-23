import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type WalletContextType = {
  balance: string;
  loading: boolean;
  refresh: () => Promise<void>;
  setBalance: (value: string) => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBalance(data.balance);
    } catch {
      // swallow — keep previous balance
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Refresh whenever the user logs in / changes
  useEffect(() => {
    if (user && token) {
      refresh();
    } else {
      setBalance("0.00");
    }
  }, [user, token, refresh]);

  return (
    <WalletContext.Provider value={{ balance, loading, refresh, setBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
