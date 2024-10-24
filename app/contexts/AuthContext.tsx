"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
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

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser: User | null;
}> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<User> => {
    try {
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
      document.cookie = `authToken=${userData.token}; path=/; max-age=2592000; SameSite=Strict; Secure`;
      router.refresh();
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<User> => {
    try {
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
      document.cookie = `authToken=${newUser.token}; path=/; max-age=2592000; SameSite=Strict; Secure`;
      router.refresh();
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.refresh();
    router.push("/login");
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
