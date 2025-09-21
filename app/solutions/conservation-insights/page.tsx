import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { Shield, Leaf, Globe, Users, Lightbulb, Heart } from "lucide-react"

export default function ConservationInsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      <BubbleCursor />
      <HomeButton />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-24 left-12 w-40 h-40 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-24 right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full mb-6 backdrop-blur-md border border-green-400/30">
              <Shield className="h-10 w-10 text-green-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Conservation Insights</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto text-balance">
              AI-driven recommendations and actionable strategies for marine ecosystem preservation, combining
              scientific research with practical conservation solutions.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mb-16">
            <a 
              href="http://localhost:3002" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <BubbleButton className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 hover:from-green-400/30 hover:to-emerald-400/30 px-8 py-4 text-lg">
                Start Conservation Project →
              </BubbleButton>
            </a>
          </div>

          {/* Impact Metrics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Globe,
                title: "Protected Areas",
                value: "2.4M km²",
                desc: "Ocean area under enhanced protection",
                color: "green",
              },
              {
                icon: Heart,
                title: "Species Saved",
                value: "847",
                desc: "Species moved from at-risk status",
                color: "emerald",
              },
              { icon: Users, title: "Communities", value: "156", desc: "Local communities engaged", color: "teal" },
            ].map((impact, index) => (
              <GlassmorphismCard key={index} className="p-8 text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-${impact.color}-500/20 to-${impact.color}-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-${impact.color}-400/30`}
                >
                  <impact.icon className={`h-8 w-8 text-${impact.color}-400`} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{impact.value}</div>
                <div className="text-lg text-green-100 mb-2">{impact.title}</div>
                <div className="text-sm text-green-200">{impact.desc}</div>
              </GlassmorphismCard>
            ))}
          </div>

          {/* Conservation Strategies */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <GlassmorphismCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Leaf className="h-8 w-8 text-emerald-400 mr-3" />
                AI-Powered Strategies
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Habitat Restoration Planning",
                    description:
                      "Optimal site selection and restoration timeline recommendations based on ecosystem modeling",
                    priority: "High",
                    impact: "95%",
                  },
                  {
                    title: "Marine Protected Area Design",
                    description: "Data-driven boundaries and regulations for maximum biodiversity protection",
                    priority: "High",
                    impact: "87%",
                  },
                  {
                    title: "Fishing Quota Optimization",
                    description: "Sustainable catch limits that balance conservation with economic needs",
                    priority: "Medium",
                    impact: "78%",
                  },
                  {
                    title: "Pollution Mitigation",
                    description: "Targeted interventions for reducing marine pollution impact on ecosystems",
                    priority: "High",
                    impact: "92%",
                  },
                ].map((strategy, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{strategy.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            strategy.priority === "High"
                              ? "bg-red-500/20 text-red-400 border border-red-400/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                          }`}
                        >
                          {strategy.priority}
                        </span>
                        <span className="text-emerald-400 font-semibold text-sm">{strategy.impact}</span>
                      </div>
                    </div>
                    <p className="text-green-100 text-sm">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>

            <GlassmorphismCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Lightbulb className="h-8 w-8 text-yellow-400 mr-3" />
                Action Recommendations
              </h2>
              <div className="space-y-4">
                {[
                  {
                    category: "Immediate Actions",
                    actions: [
                      "Establish emergency protection zones for critically endangered species",
                      "Implement real-time fishing vessel monitoring in sensitive areas",
                      "Deploy pollution cleanup operations in high-impact zones",
                    ],
                    timeframe: "0-3 months",
                  },
                  {
                    category: "Short-term Goals",
                    actions: [
                      "Expand marine protected area network by 15%",
                      "Launch community-based conservation programs",
                      "Implement AI-guided restoration projects",
                    ],
                    timeframe: "3-12 months",
                  },
                  {
                    category: "Long-term Vision",
                    actions: [
                      "Achieve 30% ocean protection by 2030",
                      "Establish sustainable blue economy frameworks",
                      "Create global marine biodiversity monitoring network",
                    ],
                    timeframe: "1-10 years",
                  },
                ].map((phase, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{phase.category}</h3>
                      <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                        {phase.timeframe}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {phase.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start space-x-2 text-sm text-green-100">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </div>

          {/* Success Stories */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Conservation Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Coral Reef Recovery",
                  location: "Great Barrier Reef",
                  improvement: "+23%",
                  description: "AI-guided restoration increased coral coverage by 23% in targeted areas",
                },
                {
                  title: "Fish Population Rebound",
                  location: "North Atlantic",
                  improvement: "+45%",
                  description: "Sustainable fishing quotas led to 45% increase in key species populations",
                },
                {
                  title: "Plastic Pollution Reduction",
                  location: "Pacific Gyre",
                  improvement: "-67%",
                  description: "Targeted cleanup operations reduced microplastic levels by 67%",
                },
              ].map((story, index) => (
                <div key={index} className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">{story.improvement}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{story.title}</h3>
                  <div className="text-sm text-green-300 mb-3">{story.location}</div>
                  <p className="text-sm text-green-100">{story.description}</p>
                </div>
              ))}
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </div>
  )
}
