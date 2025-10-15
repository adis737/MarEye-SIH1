"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"
import { useAuth } from "@/hooks/use-auth"

export function ConditionalNavigation() {
  const pathname = usePathname()
  const { isAuthenticated, loading } = useAuth()
  
  // Don't show navigation on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }
  
  // Don't show navigation on try page
  if (pathname === "/try") {
    return null
  }
  
  // Show navigation for all other pages (including unauthenticated users)
  // This allows visitors to explore the marine security platform features
  return <Navigation />
}
