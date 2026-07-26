"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const loginWithToken = useCallback(async (authToken) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.me, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          setToken(authToken);
          setLoading(false);
          return true;
        }
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      return false;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Token login failed:", error);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      return false;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const localToken = localStorage.getItem("token");
      const localUser = localStorage.getItem("user");

      if (localToken && localUser) {
        const parsedUser = JSON.parse(localUser);
        setUser(parsedUser);
        setToken(localToken);
        setLoading(false);
        fetch(API_ENDPOINTS.auth.me, {
          method: "GET",
          credentials: "include",
          headers: localToken ? { Authorization: `Bearer ${localToken}` } : {},
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.success && data.data) {
              setUser(data.data);
              localStorage.setItem("user", JSON.stringify(data.data));
            }
          })
          .catch(() => {});
        return;
      }

      if (localToken) {
        const success = await loginWithToken(localToken);
        if (success) return;
      }

      const response = await fetch(API_ENDPOINTS.auth.me, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        }
      }
      setLoading(false);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Auth check failed:", error);
      }
      setLoading(false);
    }
  }, [loginWithToken]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (userData, authToken) => {
    if (authToken) {
      localStorage.setItem("token", authToken);
      setToken(authToken);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setLoading(false);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const logout = async () => {
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Logout failed:", error);
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
