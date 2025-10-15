import { HeroSection } from "@/components/hero-section"
import { BubbleCursor } from "@/components/bubble-cursor"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  // Remove the redirect to /try - let users access the home page directly
  // const authToken = cookies().get("auth_token")?.value
  // if (!authToken) {
  //   redirect("/try")
  // }

  return (
    <div className="min-h-screen relative">
      <BubbleCursor />
      <main>
        {/* Original Hero Section */}
        <HeroSection />
        
        {/* AI-Powered Solutions Section */}
        <section className="py-16 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-lg animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                AI-Powered Solutions
              </h2>
              <p className="text-lg text-cyan-200 max-w-2xl mx-auto leading-relaxed">
                Advanced AI-powered platform combining CNN image processing and object detection for comprehensive marine security operations and analysis.
              </p>
            </div>

            {/* Solutions Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* CNN Card */}
              <div className="group bg-slate-900/40 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 relative overflow-hidden">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="text-center relative z-10">
                  {/* Brain Icon with Animation */}
                  <div className="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                    <svg className="w-7 h-7 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors duration-300">CNN</h3>
                  <p className="text-cyan-200 mb-5 leading-relaxed text-sm">
                    Advanced Convolutional Neural Network for underwater image enhancement and analysis
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:bg-emerald-300 transition-colors duration-300"></span>
                      <span className="text-sm">Image enhancement</span>
                    </div>
                    <div className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:bg-emerald-300 transition-colors duration-300"></span>
                      <span className="text-sm">Video processing</span>
                    </div>
                    <div className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:bg-emerald-300 transition-colors duration-300"></span>
                      <span className="text-sm">Quality improvement</span>
                    </div>
                  </div>
                  
                  <Link href="/cnn-model">
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 text-sm">
                      Explore Solution →
                    </button>
                  </Link>
                </div>
              </div>

              {/* Detection Card */}
              <div className="group bg-slate-900/40 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 relative overflow-hidden">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="text-center relative z-10">
                  {/* Target Icon with Animation */}
                  <div className="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/20">
                    <svg className="w-7 h-7 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-100 transition-colors duration-300">Detection</h3>
                  <p className="text-cyan-200 mb-5 leading-relaxed text-sm">
                    AI-powered object detection system for submarines, mines, and divers
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:bg-emerald-300 transition-colors duration-300"></span>
                      <span className="text-sm">YOLO detection</span>
                    </div>
                    <div className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:bg-emerald-300 transition-colors duration-300"></span>
                      <span className="text-sm">Real-time analysis</span>
                    </div>
                    <div className="flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 group-hover:bg-emerald-300 transition-colors duration-300"></span>
                      <span className="text-sm">Multi-class recognition</span>
                    </div>
                  </div>
                  
                  <Link href="/detection">
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 text-sm">
                      Explore Solution →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}