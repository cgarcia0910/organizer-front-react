import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthApi } from '../data-access/auth.api';

export type LoginResult =
  | { status: 'success' }
  | { status: 'invalid-credentials' }
  | { status: 'server-error'; httpStatus: number };

export type Roles = 'CATALOG_ADMIN' | 'CATALOG_EDITOR';
export type AuthUser = {
  email: string;
  roles: Roles[];
  tenant: { id: string; name: string };
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await AuthApi.whoami();
        if (userResponse.ok) {
          setUser(await userResponse.json());
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  async function login(email: string, password: string): Promise<LoginResult> {
    const response = await AuthApi.login(email, password);

    if (response.status === 401) return { status: 'invalid-credentials' };
    if (!response.ok)
      return { status: 'server-error', httpStatus: response.status };

    const userResponse = await AuthApi.whoami();
    if (!userResponse.ok)
      return { status: 'server-error', httpStatus: userResponse.status };

    setUser(await userResponse.json());
    return { status: 'success' };
  }

  async function logout() {
    try {
      await AuthApi.logout();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
