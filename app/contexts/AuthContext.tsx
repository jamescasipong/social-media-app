"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  avatar: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const fetchUserData = async () => {
        const response = await fetch(
          "https://socmedia-api.vercel.app/api/auth/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Pass the token in the header
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Handle token expiry or other errors
          localStorage.removeItem("authToken");
        }
      };

      fetchUserData();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(
      "https://socmedia-api.vercel.app/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      throw new Error("Incorrect email or password");
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("authToken", userData.token); // Store token in local storage
    return userData;
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const response = await fetch(
      "https://socmedia-api.vercel.app/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      }
    );

    if (!response.ok) {
      throw new Error("Email already in use or another error occurred");
    }

    const newUser = await response.json();
    setUser(newUser);
    localStorage.setItem("authToken", newUser.token); // Store token in local storage
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
