import type React from "react"
import { cn } from "@/lib/utils"

interface GlassmorphismCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassmorphismCard({ children, className }: GlassmorphismCardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:border-cyan-400/30",
        className,
      )}
    >
      {children}
    </div>
  )
}
