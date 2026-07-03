"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_ENDPOINTS } from "../config/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      // ابتدا localStorage را چک کن
      const localToken = localStorage.getItem("token");
      const localUser = localStorage.getItem("user");
      
      console.log("🔍 Checking auth status - token:", localToken ? "exists" : "null", "user:", localUser ? "exists" : "null");
      
      if (localToken && localUser) {
        const parsedUser = JSON.parse(localUser);
        console.log("🔍 Loading user from localStorage:", parsedUser);
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
        if (success) {
          return;
        }
      }

      // اگر localStorage کار نکرد، HttpOnly cookie را چک کن
      const response = await fetch(API_ENDPOINTS.auth.me, {
        method: "GET",
        credentials: "include", // برای HttpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("🔍 Loading user from HttpOnly cookie:", data.data);
          setUser(data.data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
    }
  }, []);

  // بررسی وضعیت احراز هویت
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const loginWithToken = async (token) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.me, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("🔍 Token login successful:", data.data);
          setUser(data.data);
          setToken(token);
          setLoading(false);
          return true;
        }
      }
      console.log("🔍 Token login failed, clearing localStorage");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      return false;
    } catch (error) {
      console.error("Token login failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      return false;
    }
  };

  const login = async (userData, authToken) => {
    console.log("🔍 Login called with:", userData, authToken);
    
    // ابتدا localStorage را به‌روزرسانی کن
    if (authToken) {
      localStorage.setItem("token", authToken);
      setToken(authToken);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    
    // اطمینان حاصل کن که loading false است
    setLoading(false);
    
    console.log("🔍 Login completed - user set, loading false");
  };

  const updateUser = (updatedUserData) => {
    console.log("🔍 Updating user data:", updatedUserData);
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
      console.error("Logout failed:", error);
    } finally {
      console.log("🔍 Logout called, clearing user data");
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
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}