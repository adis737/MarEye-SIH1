"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("useAuth - Checking authentication...")
        
        // First check if user data exists in localStorage
        const stored = localStorage.getItem("profile")
        console.log("useAuth - localStorage profile:", stored ? "exists" : "not found")
        
        if (stored) {
          const userData = JSON.parse(stored)
          console.log("useAuth - Found user in localStorage:", userData)
          setUser(userData)
          setLoading(false)
          return
        }

        // If no localStorage data, check authentication via API
        console.log("useAuth - Checking API authentication...")
        const response = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include'
        })

        console.log("useAuth - API response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("useAuth - API response data:", data)
          if (data.success && data.user) {
            console.log("useAuth - User authenticated via API:", data.user)
            setUser(data.user)
            // Store user data in localStorage for future use
            localStorage.setItem("profile", JSON.stringify(data.user))
          } else {
            console.log("useAuth - API returned no user data")
            setUser(null)
          }
        } else {
          console.log("useAuth - API authentication failed")
          setUser(null)
        }
      } catch (error) {
        console.error("useAuth - Error checking auth:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for storage changes (e.g., when user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "profile") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      localStorage.removeItem("profile")
      localStorage.removeItem("user")
      setUser(null)
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  }
}
