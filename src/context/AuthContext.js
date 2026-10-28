import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, registerAuthHandlers } from '../services/api';
import {
  clearStoredSession,
  getStoredSession,
  getTokenExpiry,
  saveSession,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(getStoredSession);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setPermissionDenied(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await authAPI.login({ username, password });
    const { token, username: loggedInUser } = response.data;

    saveSession(token, loggedInUser);
    setSession({ token, username: loggedInUser });
  }, []);

  // Log out automatically when the token expires
  useEffect(() => {
    if (!session) return undefined;

    const expiry = getTokenExpiry(session.token);
    if (!expiry) return undefined;

    const timeout = setTimeout(logout, expiry - Date.now());
    return () => clearTimeout(timeout);
  }, [session, logout]);

  useEffect(() => {
    registerAuthHandlers({
      onUnauthorized: logout,
      onForbidden: () => setPermissionDenied(true),
    });
  }, [logout]);

  const value = useMemo(
    () => ({
      user: session?.username ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
      permissionDenied,
      dismissPermissionDenied: () => setPermissionDenied(false),
    }),
    [session, login, logout, permissionDenied]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
