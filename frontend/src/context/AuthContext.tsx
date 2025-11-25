import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { auth, googleProvider } from "../lib/firebase";
import { apiFetch } from "../api/client";
import type { UserProfile } from "../types";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(
    async (idToken: string | null = token) => {
      if (!idToken) return;
      const data = await apiFetch<UserProfile>("/users/me", { token: idToken });
      setProfile(data);
    },
    [token],
  );

  useEffect(() => {
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
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
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


