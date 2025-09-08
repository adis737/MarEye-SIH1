import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { GeneSequenceAnalyzer } from "@/components/gene-sequence-analyzer"
import { TrendingUp, BarChart3, Activity, AlertTriangle, Target, Waves, Dna } from "lucide-react"
import Link from "next/link"

export default function PopulationTrendsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      <BubbleCursor />
      <HomeButton />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 left-16 w-28 h-28 bg-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full mb-6 backdrop-blur-md border border-emerald-400/30">
              <TrendingUp className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Population Trends Analysis</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto text-balance">
              Real-time monitoring and predictive modeling of marine biodiversity patterns using advanced statistical
              analysis and machine learning forecasting.
            </p>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: BarChart3, title: "Species Tracked", value: "2,847", change: "+12.3%", color: "emerald" },
              { icon: Activity, title: "Population Health", value: "87.2%", change: "+2.1%", color: "teal" },
              { icon: AlertTriangle, title: "At-Risk Species", value: "143", change: "-5.7%", color: "orange" },
              { icon: Target, title: "Prediction Accuracy", value: "94.6%", change: "+1.8%", color: "cyan" },
            ].map((metric, index) => (
              <GlassmorphismCard key={index} className="p-6 text-center">
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-${metric.color}-500/20 to-${metric.color}-600/20 rounded-lg flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-${metric.color}-400/30`}
                >
                  <metric.icon className={`h-6 w-6 text-${metric.color}-400`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-emerald-100 mb-2">{metric.title}</div>
                <div className={`text-xs ${metric.change.startsWith("+") ? "text-emerald-400" : "text-orange-400"}`}>
                  {metric.change} vs last month
                </div>
              </GlassmorphismCard>
            ))}
          </div>

          {/* Analysis Features */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <GlassmorphismCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Waves className="h-8 w-8 text-teal-400 mr-3" />
                Trend Analysis
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Population Dynamics Modeling",
                    description: "Advanced mathematical models tracking birth rates, mortality, and migration patterns",
                    status: "Active",
                  },
                  {
                    title: "Seasonal Pattern Recognition",
                    description: "AI-powered detection of cyclical behaviors and environmental correlations",
                    status: "Active",
                  },
                  {
                    title: "Habitat Suitability Mapping",
                    description: "Predictive modeling of optimal habitats based on environmental parameters",
                    status: "Active",
                  },
                  {
                    title: "Climate Impact Assessment",
                    description: "Long-term analysis of climate change effects on species distribution",
                    status: "Beta",
                  },
                ].map((feature, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          feature.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                            : "bg-orange-500/20 text-orange-400 border border-orange-400/30"
                        }`}
                      >
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-emerald-100 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>

            <GlassmorphismCard className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Predictive Capabilities</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Short-term Forecasting</h3>
                  <p className="text-emerald-100 text-sm mb-3">1-6 month population predictions with 94.6% accuracy</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{ width: "94.6%" }}></div>
                    </div>
                    <span className="text-emerald-400 text-sm font-semibold">94.6%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-400/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Long-term Modeling</h3>
                  <p className="text-teal-100 text-sm mb-3">5-20 year ecosystem projections and scenario analysis</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-teal-400 h-2 rounded-full" style={{ width: "87.3%" }}></div>
                    </div>
                    <span className="text-teal-400 text-sm font-semibold">87.3%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Risk Assessment</h3>
                  <p className="text-cyan-100 text-sm mb-3">Early warning system for population decline risks</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-cyan-400 h-2 rounded-full" style={{ width: "91.8%" }}></div>
                    </div>
                    <span className="text-cyan-400 text-sm font-semibold">91.8%</span>
                  </div>
                </div>
              </div>
            </GlassmorphismCard>
          </div>

          {/* Monitoring Timeline */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Continuous Monitoring Process</h2>
            <div className="grid md:grid-cols-6 gap-4">
              {[
                { phase: "Data Collection", duration: "24/7", icon: "📡" },
                { phase: "Quality Control", duration: "Real-time", icon: "✅" },
                { phase: "Trend Analysis", duration: "Hourly", icon: "📈" },
                { phase: "Model Updates", duration: "Daily", icon: "🔄" },
                { phase: "Predictions", duration: "Weekly", icon: "🔮" },
                { phase: "Reporting", duration: "Monthly", icon: "📊" },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-emerald-400/30 text-2xl">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-sm">{step.phase}</h3>
                  <p className="text-xs text-emerald-100">{step.duration}</p>
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Gene Analysis Integration */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
              <Dna className="h-8 w-8 text-emerald-400 mr-3" />
              Population Analysis Through Gene Sequencing
            </h2>
            <p className="text-center text-emerald-100 mb-8 max-w-3xl mx-auto">
              Our AI model analyzes gene sequences to identify species and predict population trends. Upload environmental DNA samples to get real-time population insights and biodiversity assessments.
            </p>
            <GeneSequenceAnalyzer />
          </GlassmorphismCard>

          {/* CTA */}
          <div className="text-center">
            <Link href="/solutions/conservation-insights">
              <BubbleButton className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-teal-400/30 px-8 py-4 text-lg">
                Explore Conservation Insights →
              </BubbleButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
