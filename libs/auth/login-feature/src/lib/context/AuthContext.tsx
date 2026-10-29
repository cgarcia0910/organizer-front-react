import { createContext, ReactNode, useContext, useState } from 'react';
import { AuthApi } from '../data-access/auth.api';
import z from 'zod';

export type LoginResult =
  | { status: 'success' }
  | { status: 'invalid-credentials' }
  | { status: 'server-error'; httpStatus: number };

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const tokenSchema = z.object({
  accessToken: z.string().min(1)
})

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      const savedToken = localStorage.getItem('token');
      return savedToken;
    } catch {
      return null;
    }
  });

  async function login(email: string, password: string): Promise<LoginResult> {
    const response = await AuthApi.login(email, password);

    if (response.status === 401) return { status: 'invalid-credentials' };
    if (!response.ok) {
      return { status: 'server-error', httpStatus: response.status };
    }
    const result = tokenSchema.safeParse(await response.json())

    if(!result) return { status: 'server-error', httpStatus: 200};
    
    const token = result.data?.accessToken;
    localStorage.setItem('token', token as string);
    setToken(token as string);
    return { status: 'success' };
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
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
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }

  return context;
}
