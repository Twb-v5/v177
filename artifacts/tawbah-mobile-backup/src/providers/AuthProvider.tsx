import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const signIn = async (email: string, _password: string) => {
    const mockUser = { id: "1", email };
    setUser(mockUser);
    try { localStorage.setItem("auth_user", JSON.stringify(mockUser)); } catch {}
  };

  const signUp = async (email: string, _password: string) => {
    const mockUser = { id: "1", email };
    setUser(mockUser);
    try { localStorage.setItem("auth_user", JSON.stringify(mockUser)); } catch {}
  };

  const signOut = async () => {
    setUser(null);
    try { localStorage.removeItem("auth_user"); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
