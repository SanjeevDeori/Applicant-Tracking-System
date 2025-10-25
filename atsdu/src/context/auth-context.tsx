"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole, AuthContextType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await apiClient.getCurrentUser();
          // Map backend user data to frontend User type
          const userData = response.data || response;
          setUser({
            id: userData._id || userData.id,
            email: userData.email,
            name:
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              userData.email,
            role: userData.role,
            avatar: userData.profileImageUrl,
            createdAt: userData.createdAt,
          });
        }
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiClient.login(email, password);

      // Backend returns { success: true, token, role, isApproved }
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);

        // Fetch user data after successful login
        try {
          const userResponse = await apiClient.getCurrentUser();
          const userData = userResponse.data || userResponse;
          setUser({
            id: userData._id || userData.id,
            email: userData.email,
            name:
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              userData.email,
            role: userData.role,
            avatar: userData.profileImageUrl,
            createdAt: userData.createdAt,
          });
        } catch (err) {
          // If we can't fetch user data, create a basic user object
          setUser({
            id: "",
            email,
            name: email,
            role: response.role || "student",
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error ||
        (err as { message?: string }).message ||
        "Login failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalFields?: import("@/lib/types").SignupAdditionalFields
  ) => {
    try {
      setError(null);
      const response = await apiClient.signup(
        email,
        password,
        name,
        role,
        additionalFields
      );

      // Backend returns { success: true, token, role, isApproved }
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);

        // Fetch user data after successful signup
        try {
          const userResponse = await apiClient.getCurrentUser();
          const userData = userResponse.data || userResponse;
          setUser({
            id: userData._id || userData.id,
            email: userData.email,
            name:
              `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
              name,
            role: userData.role,
            avatar: userData.profileImageUrl,
            createdAt: userData.createdAt,
          });
        } catch (err) {
          // If we can't fetch user data, create a basic user object
          setUser({
            id: "",
            email,
            name,
            role: response.role || role,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error ||
        (err as { message?: string }).message ||
        "Signup failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
