import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { GeneSequenceAnalyzer } from "@/components/gene-sequence-analyzer"
import { Cpu, Brain, Eye, Dna as Dna2, Network, Zap } from "lucide-react"
import Link from "next/link"

export default function AIProcessingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <BubbleCursor />
      <HomeButton />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-full mb-6 backdrop-blur-md border border-purple-400/30">
              <Cpu className="h-10 w-10 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">AI Processing Engine</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto text-balance">
              Advanced machine learning algorithms for real-time species identification, genetic analysis, and ecosystem
              pattern recognition in deep-sea environments.
            </p>
          </div>

          {/* AI Models Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Eye,
                title: "Computer Vision",
                description: "Deep learning models for species identification from underwater imagery",
                accuracy: "94.7%",
                color: "from-cyan-500/20 to-blue-600/20 border-cyan-400/30",
              },
              {
                icon: Dna2,
                title: "Genetic Analysis",
                description: "AI-powered eDNA sequence analysis and species classification",
                accuracy: "97.2%",
                color: "from-emerald-500/20 to-green-600/20 border-emerald-400/30",
              },
              {
                icon: Network,
                title: "Pattern Recognition",
                description: "Neural networks for ecosystem behavior and migration patterns",
                accuracy: "91.8%",
                color: "from-purple-500/20 to-pink-600/20 border-purple-400/30",
              },
            ].map((model, index) => (
              <GlassmorphismCard key={index} className="p-6">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${model.color} rounded-lg flex items-center justify-center mb-4 backdrop-blur-md border`}
                >
                  <model.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{model.title}</h3>
                <p className="text-purple-100 text-sm mb-4">{model.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-200">Accuracy</span>
                  <span className="text-lg font-bold text-emerald-400">{model.accuracy}</span>
                </div>
              </GlassmorphismCard>
            ))}
          </div>

          {/* Processing Pipeline */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
              <Brain className="h-8 w-8 text-purple-400 mr-3" />
              AI Processing Pipeline
            </h2>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { title: "Data Ingestion", desc: "Raw sensor data preprocessing", icon: "📥" },
                { title: "Feature Extraction", desc: "Key characteristic identification", icon: "🔍" },
                { title: "Model Inference", desc: "AI model prediction execution", icon: "🧠" },
                { title: "Confidence Scoring", desc: "Result reliability assessment", icon: "📊" },
                { title: "Output Generation", desc: "Structured result delivery", icon: "📤" },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-purple-400/30 text-2xl">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-purple-100">{step.desc}</p>
                  {index < 4 && (
                    <div className="hidden md:block absolute top-8 left-full w-4 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </GlassmorphismCard>

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <GlassmorphismCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Zap className="h-6 w-6 text-yellow-400 mr-3" />
                Real-time Performance
              </h3>
              <div className="space-y-4">
                {[
                  { metric: "Processing Speed", value: "< 2.3s", desc: "Average analysis time per sample" },
                  { metric: "Throughput", value: "1,200", desc: "Samples processed per hour" },
                  { metric: "Concurrent Models", value: "8", desc: "Parallel AI model execution" },
                  { metric: "Uptime", value: "99.7%", desc: "System availability" },
                ].map((perf, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <div className="font-semibold text-white">{perf.metric}</div>
                      <div className="text-xs text-purple-200">{perf.desc}</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">{perf.value}</div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>

            <GlassmorphismCard className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Model Capabilities</h3>
              <div className="space-y-3">
                {[
                  "Species identification across 2,500+ marine species",
                  "Genetic sequence analysis and phylogenetic classification",
                  "Behavioral pattern recognition and prediction",
                  "Environmental threat assessment and risk scoring",
                  "Population dynamics modeling and forecasting",
                  "Ecosystem health monitoring and alerts",
                ].map((capability, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-purple-100 text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </div>

          {/* Interactive Model Demo */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
              <Dna2 className="h-8 w-8 text-purple-400 mr-3" />
              Try Our AI Model
            </h2>
            <p className="text-center text-purple-100 mb-8 max-w-2xl mx-auto">
              Experience our advanced gene sequence analysis model in action. Upload DNA sequences and get instant species identification with confidence scores.
            </p>
            <GeneSequenceAnalyzer />
          </GlassmorphismCard>

          {/* CTA */}
          <div className="text-center">
            <Link href="/solutions/population-trends">
              <BubbleButton className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-400/30 hover:from-purple-400/30 hover:to-indigo-400/30 px-8 py-4 text-lg">
                View Population Analysis →
              </BubbleButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
