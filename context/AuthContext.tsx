"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAccessToken, getCurrentUserDetails } from "@/lib/auth"; // Adjust the import paths as necessary
import { BackendUser, User } from "@/types";

interface AuthContextType {
  user: BackendUser | null;
  setUser: (user: BackendUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const currentUser = await getCurrentUserDetails(); // Implement this function to fetch user data
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          setUser(null);
        }
      }
    };

    initializeUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};