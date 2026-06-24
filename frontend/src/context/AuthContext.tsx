import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, ApiError, clearToken, getToken, setToken } from '../lib/api';
import { getAvatarUrl, saveProfile } from '../lib/profileStorage';
import { safeReturnPath } from '../hooks/useAuthReturnTo';
import type { ProfileData } from '../types/profile';

export type AuthUser = {
  id: string;
  displayName: string;
  initials: string;
  email: string;
  avatarUrl?: string | null;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type RegisterResponse = {
  message: string;
  requiresActivation: boolean;
  user: AuthUser;
};

type AuthContextValue = {
  authReady: boolean;
  loggedIn: boolean;
  user: AuthUser | null;
  login: (email: string, password: string, returnTo?: string | null) => Promise<boolean>;
  register: (payload: RegisterPayload, returnTo?: string | null) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileData) => Promise<void>;
};

function enrichUser(user: AuthUser): AuthUser {
  return {
    ...user,
    avatarUrl: getAvatarUrl(user.id),
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setHydrated(true);
      return;
    }
    apiGet<AuthUser>('/api/auth/me')
      .then((authUser) => setUser(enrichUser(authUser)))
      .catch(() => clearToken())
      .finally(() => setHydrated(true));
  }, []);

  const login = useCallback(
    async (email: string, password: string, returnTo?: string | null): Promise<boolean> => {
      try {
        const { token, user: authUser } = await apiPost<AuthResponse>('/api/auth/login', {
          email,
          password,
        });
        setToken(token);
        setUser(enrichUser(authUser));
        navigate(safeReturnPath(returnTo));
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.message) {
          throw error;
        }
        return false;
      }
    },
    [navigate],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      const result = await apiPost<RegisterResponse>('/api/auth/register', {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
      });

      if (result.requiresActivation) {
        navigate('/entrar?pending=1');
        return;
      }
    },
    [navigate],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate('/');
  }, [navigate]);

  const updateProfile = useCallback(async (data: ProfileData) => {
    if (!user) return;
    const { sessionPatch } = await saveProfile(user.id, data);
    setUser((current) =>
      current ? enrichUser({ ...current, ...sessionPatch }) : current,
    );
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authReady: hydrated,
      loggedIn: hydrated && user !== null,
      user: hydrated ? user : null,
      login,
      register,
      logout,
      updateProfile,
    }),
    [hydrated, user, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
