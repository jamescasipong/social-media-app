"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

type User = {
  id: string;
  username: string;
  password: string;
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
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock implementation with error handling

    const users = await JSON.parse(localStorage.getItem("accounts") || "[]");
    const find = users.filter((user: User) => user.email === email);

    if (find.length === 0) {
      throw new Error("User not found");
    }
    const user = find[0];
    if (user.email === email && user.password === password) {
      const mockUser: User = {
        id: user.id,
        password: user.password,
        username: user.username,
        email: user.email,
        avatar: "/placeholder-avatar.jpg",
      };
      setUser(user);
      localStorage.setItem("authToken", "mock-jwt-token");
      localStorage.setItem("user", JSON.stringify(user));
      return mockUser;
    } else {
      throw new Error("Incorrect email or password");
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

    const findAccount = accounts.filter(
      (account: User) => account.email === email
    );
    if (findAccount.length > 0) {
      alert("Email already in use");
      throw new Error("Email already in use");
    }
    const newAccount = {
      id: (accounts.length + 1).toString(),
      username,
      email,
      password,
      avatar: "/placeholder-avatar.jpg",
    };
    accounts.push(newAccount);
    // Mock implementation

    setUser(accounts[0]);

    localStorage.setItem("authToken", "mock-jwt-token");
    localStorage.setItem("user", JSON.stringify(accounts));
    localStorage.setItem("accounts", JSON.stringify(accounts));
    console.log(accounts);
    return accounts;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
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
