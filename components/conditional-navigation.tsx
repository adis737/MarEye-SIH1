"use client"

import { usePathname } from "next/navigation"
import { Navigation } from "./navigation"

export function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Only show navigation on homepage
  if (pathname === "/") {
    return <Navigation />
  }
  
  // Hide navigation on all other pages
  return null
}
