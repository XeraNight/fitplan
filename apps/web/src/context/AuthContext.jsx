import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi.js";
import { setOnUnauthorized } from "../api/client.js";
import { clearToken, getToken, setToken } from "../api/tokenStorage.js";

// The only global state: who is signed in.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const login = useCallback(async (credential) => {
    const { token, user: signedIn } = await authApi.loginWithGoogle(credential);
    setToken(token);
    setUser(signedIn);
  }, []);

  useEffect(() => {
    setOnUnauthorized(logout);
    if (!getToken()) return;
    // restore the user from a token saved by an earlier visit
    authApi
      .getMe()
      .then(({ user: restored }) => setUser(restored))
      .catch(logout)
      .finally(() => setReady(true));
  }, [logout]);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
