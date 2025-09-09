"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { BubbleButton } from "./bubble-button"

export function HomeButton() {
  return (
    <div className="fixed top-20 left-4 z-40">
      <Link href="/">
        <BubbleButton className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30">
          <Home className="h-4 w-4 mr-2" />
          Home
        </BubbleButton>
      </Link>
    </div>
  )
}
