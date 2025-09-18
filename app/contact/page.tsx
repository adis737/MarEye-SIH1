import { ContactSection } from "@/components/contact-section"
import { BubbleCursor } from "@/components/bubble-cursor"
import { HomeButton } from "@/components/home-button"

export default function ContactPage() {
  return (
    <div className="min-h-screen relative">
      <BubbleCursor />
      <HomeButton />
      <main>
        <ContactSection />
      </main>
    </div>
  )
}
