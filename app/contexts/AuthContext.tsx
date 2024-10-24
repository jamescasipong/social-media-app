"use client";

import { createContext, useContext, useState, useEffect } from "react";
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
  authToken: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialUser: User | null;
}> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Try to retrieve the authToken from localStorage as a fallback
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

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
      setAuthToken(userData.token);

      // Set the token in both cookie and localStorage
      document.cookie = `authToken=${userData.token}; path=/; max-age=2592000; SameSite=Strict; Secure`;
      localStorage.setItem("authToken", userData.token);

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

      const userData = await response.json();
      setUser(userData);
      setAuthToken(userData.token);

      // Set the token in both cookie and localStorage
      document.cookie = `authToken=${userData.token}; path=/; max-age=2592000; SameSite=Strict; Secure`;
      localStorage.setItem("authToken", userData.token);

      router.refresh();
      return userData;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    localStorage.removeItem("authToken");
    router.refresh();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, authToken }}>
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

{
  /* <AuthProvider initialUser={user}>{children}</AuthProvider> */
}
