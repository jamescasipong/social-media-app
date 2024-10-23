'use client'

import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  username: string
  email: string
  avatar: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (username: string, email: string, password: string) => Promise<User>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {

    const token = localStorage.getItem("authToken")
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(
            "https://socmedia-api.vercel.app/api/auth/profile",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            localStorage.removeItem("authToken")
            router.push('/login')
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          localStorage.removeItem("authToken")
          router.push('/login')
        } finally {
          setLoading(false)
        }
      }

      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [router])

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
      )

      if (!response.ok) {
        throw new Error("Incorrect email or password")
      }

      const userData = await response.json()
      setUser(userData)
      localStorage.setItem("authToken", userData.token)
      return userData
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

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
      )

      if (!response.ok) {
        throw new Error("Email already in use or another error occurred")
      }

      const newUser = await response.json()
      setUser(newUser)
      localStorage.setItem("authToken", newUser.token)
      return newUser
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("authToken")
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}