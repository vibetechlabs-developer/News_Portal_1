import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  getCurrentUser,
  login as apiLogin,
  setAuthTokenProvider,
  type AuthUser,
} from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  isReporter: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "news_portal_auth";

interface StoredAuthState {
  access: string;
  refresh: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state from localStorage on first mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoading(false);
        return;
      }
      const parsed: StoredAuthState = JSON.parse(raw);
      if (parsed.access) {
        setAccessToken(parsed.access);
        setRefreshToken(parsed.refresh);
        // Fetch current user profile
        getCurrentUser(parsed.access)
          .then((me) => {
            setUser(me);
          })
          .catch(() => {
            // If token invalid, clear storage
            window.localStorage.removeItem(STORAGE_KEY);
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  const persistTokens = useCallback((tokens: StoredAuthState | null) => {
    if (!tokens) {
      window.localStorage.removeItem(STORAGE_KEY);
      setAccessToken(null);
      setRefreshToken(null);
      // Clear API client token provider when logging out / clearing state
      setAuthTokenProvider(() => null);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    setAccessToken(tokens.access);
    setRefreshToken(tokens.refresh);
    // Keep the shared API client in sync with the current access token
    setAuthTokenProvider(() => tokens.access);
  }, []);

  // Ensure the API client knows about an already-loaded access token
  useEffect(() => {
    if (accessToken) {
      setAuthTokenProvider(() => accessToken);
    }
  }, [accessToken]);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      try {
        const tokens = await apiLogin({ username, password });
        persistTokens(tokens);
        const me = await getCurrentUser(tokens.access);
        setUser(me);
      } finally {
        setIsLoading(false);
      }
    },
    [persistTokens]
  );

  const logout = useCallback(() => {
    persistTokens(null);
    setUser(null);
  }, [persistTokens]);

  const value: AuthContextValue = useMemo(() => {
    const role = user?.role ?? null;
    return {
      user,
      accessToken,
      isLoading,
      isAuthenticated: !!user && !!accessToken,
      isSuperAdmin: role === "SUPER_ADMIN",
      isEditor: role === "EDITOR" || role === "SUPER_ADMIN",
      isReporter: role === "REPORTER" || role === "EDITOR" || role === "SUPER_ADMIN",
      login,
      logout,
    };
  }, [user, accessToken, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

