import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { Database, Waves, Microscope, Sofa as Sonar, Dna, Camera } from "lucide-react"

export default function DataCollectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-cyan-900 relative overflow-hidden">
      <BubbleCursor />
      <HomeButton />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full mb-6 backdrop-blur-md border border-cyan-400/30">
              <Database className="h-10 w-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Deep Sea Data Collection</h1>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto text-balance">
              Advanced underwater data acquisition systems for comprehensive marine biodiversity research using
              cutting-edge ROV technology and environmental DNA sampling.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Technologies */}
            <GlassmorphismCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Waves className="h-8 w-8 text-cyan-400 mr-3" />
                Collection Technologies
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Sonar,
                    title: "Advanced Sonar Systems",
                    description:
                      "Multi-beam sonar mapping for habitat characterization and species detection at depths up to 6000m.",
                  },
                  {
                    icon: Camera,
                    title: "4K Underwater Imaging",
                    description:
                      "High-resolution cameras with specialized lighting for species identification and behavioral analysis.",
                  },
                  {
                    icon: Dna,
                    title: "Environmental DNA Sampling",
                    description:
                      "Water sample collection and filtration systems for genetic material analysis and species detection.",
                  },
                ].map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center backdrop-blur-md border border-cyan-400/30">
                      <tech.icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{tech.title}</h3>
                      <p className="text-cyan-100 text-sm">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>

            {/* Capabilities */}
            <GlassmorphismCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Microscope className="h-8 w-8 text-emerald-400 mr-3" />
                Research Capabilities
              </h2>
              <div className="space-y-4">
                {[
                  "Multi-depth water column sampling (0-6000m)",
                  "Real-time species identification and counting",
                  "Habitat mapping and 3D reconstruction",
                  "Environmental parameter monitoring",
                  "Genetic material collection and preservation",
                  "Behavioral observation and documentation",
                  "Pollution and microplastic detection",
                  "Ecosystem health assessment",
                ].map((capability, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-cyan-100">{capability}</span>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </div>

          {/* Process Flow */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Data Collection Workflow</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Mission Planning", desc: "Route optimization and target identification" },
                { step: "2", title: "ROV Deployment", desc: "Underwater vehicle launch and navigation" },
                { step: "3", title: "Data Acquisition", desc: "Multi-sensor data collection and sampling" },
                { step: "4", title: "Quality Control", desc: "Real-time validation and storage" },
              ].map((phase, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-cyan-400/30">
                    <span className="text-2xl font-bold text-cyan-400">{phase.step}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{phase.title}</h3>
                  <p className="text-sm text-cyan-100">{phase.desc}</p>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* CTA */}
          <div className="text-center">
            <BubbleButton className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 px-8 py-4 text-lg">
              Explore Data Processing →
            </BubbleButton>
          </div>
        </div>
      </div>
    </div>
  )
}
