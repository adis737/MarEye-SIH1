"use client"

import { useState } from "react"
import Link from "next/link"
import { BubbleButton } from "@/components/bubble-button"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/solutions/data-collection", label: "Data Collection" },
    { href: "/solutions/ai-processing", label: "AI Processing" },
    { href: "/solutions/population-trends", label: "Population Trends" },
    { href: "/solutions/conservation-insights", label: "Conservation" },
    { href: "/species-recognition", label: "Species Recognition" },
    { href: "/water-quality", label: "Water Quality" },
    { href: "/dashboard", label: "Dashboard" },
  ]

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact")
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-slate-900/80 via-blue-900/80 to-cyan-900/80 border-b border-cyan-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center backdrop-blur-md border border-cyan-400/30">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-white">AI-driven Biodiversity</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-cyan-100 hover:text-white px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <BubbleButton
              onClick={scrollToContact}
              className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30"
            >
              Contact
            </BubbleButton>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <BubbleButton variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </BubbleButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-xl bg-slate-900/90 border-t border-cyan-400/20 rounded-b-2xl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-cyan-100 hover:text-white block px-3 py-2 text-base font-medium transition-colors hover:bg-white/10 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2">
                <BubbleButton
                  onClick={() => {
                    scrollToContact()
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30"
                >
                  Contact
                </BubbleButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
