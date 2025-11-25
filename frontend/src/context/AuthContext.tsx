import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { auth, googleProvider } from "../lib/firebase";
import { apiFetch } from "../api/client";
import type { UserProfile } from "../types";
import { USE_MOCK_DATA, MOCK_USER } from "../mockData";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  profile: UserProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  profile: null,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

// Mock user object that mimics Firebase User
const createMockFirebaseUser = (): User => ({
  uid: MOCK_USER.id,
  email: MOCK_USER.email || null,
  displayName: MOCK_USER.name,
  photoURL: MOCK_USER.avatar_url || null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "mock-refresh-token",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "mock-token",
  getIdTokenResult: async () => ({
    token: "mock-token",
    claims: {},
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: "google.com",
    signInSecondFactor: null,
    authTime: new Date().toISOString(),
  }),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: "google.com",
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(
    async (idToken: string | null = token) => {
      if (!idToken) return;
      
      if (USE_MOCK_DATA) {
        setProfile(MOCK_USER);
        return;
      }
      
      const data = await apiFetch<UserProfile>("/users/me", { token: idToken });
      setProfile(data);
    },
    [token],
  );

  useEffect(() => {
    // Mock mode - auto login
    if (USE_MOCK_DATA) {
      const mockUser = createMockFirebaseUser();
      setUser(mockUser);
      setToken("mock-token");
      setProfile(MOCK_USER);
      setLoading(false);
      return;
    }

    // Real Firebase auth
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        await fetchProfile(idToken);
      } else {
        setToken(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [fetchProfile]);

  const login = async () => {
    if (USE_MOCK_DATA) {
      const mockUser = createMockFirebaseUser();
      setUser(mockUser);
      setToken("mock-token");
      setProfile(MOCK_USER);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (USE_MOCK_DATA) {
      setUser(null);
      setToken(null);
      setProfile(null);
      return;
    }
    await signOut(auth);
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      profile,
      login,
      logout,
      refreshProfile: fetchProfile,
    }),
    [user, token, loading, profile, fetchProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
