import { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextType {
    token: string | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
    children: ReactNode
}


export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(() => {
    try {
        const savedToken = localStorage.getItem('token');
        return savedToken;
    } catch {
        return null;
    }
  });

  function login(email: string, password: string) {
    localStorage.setItem('token', 'aaa');
    setToken('aaa')
    return true;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null)
  }
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}