import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiGet, apiPost, clearToken, getToken, setToken } from '../lib/api';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  initials: string;
  active: boolean;
  role: string;
};

type AuthContextValue = {
  authReady: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthReady(true);
      return;
    }
    apiGet<AuthUser>('/api/auth/me')
      .then((authUser) => {
        if (authUser.role !== 'admin') {
          clearToken();
          setUser(null);
        } else {
          setUser(authUser);
        }
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setAuthReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: authUser } = await apiPost<{ token: string; user: AuthUser }>(
      '/api/auth/login',
      { email, password },
    );
    if (authUser.role !== 'admin') {
      throw new Error('Esta conta não tem permissão de administrador.');
    }
    setToken(token);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ authReady, user, login, logout }),
    [authReady, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
