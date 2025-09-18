"use client"

import { HomeButton } from "@/components/home-button"
import { BubbleCursor } from "@/components/bubble-cursor"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { BubbleButton } from "@/components/bubble-button"
import { Bookmark, Upload, FileText, Mail, Shield, Send, User, MessageSquare, Phone, MapPin, Search, Microscope, BarChart3, Camera, Zap, Brain, Waves, Leaf } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type WatchItem = {
  _id: string
  itemType: "gene_sequence" | "image_recognition"
  title?: string | null
  summary?: string | null
  score?: number | null
  createdAt?: string
}

type AITool = {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  route: string
  category: "analysis" | "recognition" | "monitoring" | "research"
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTools, setSelectedTools] = useState<AITool[]>([])
  const { toast } = useToast()

  // AI Tools available for research
  const aiTools: AITool[] = [
    {
      id: "species-recognition",
      name: "Species Recognition",
      description: "Identify marine species from images using advanced AI",
      icon: Search,
      route: "/species-recognition",
      category: "recognition"
    },
    {
      id: "gene-analysis",
      name: "Gene Sequence Analysis",
      description: "Analyze DNA sequences for species identification",
      icon: Microscope,
      route: "/solutions/gene-analysis",
      category: "analysis"
    },
    {
      id: "water-quality",
      name: "Water Quality Monitoring",
      description: "Monitor and analyze water quality parameters",
      icon: Waves,
      route: "/water-quality",
      category: "monitoring"
    },
    {
      id: "ai-processing",
      name: "AI Processing Tools",
      description: "Advanced AI tools for data processing and analysis",
      icon: Brain,
      route: "/solutions/ai-processing",
      category: "analysis"
    },
    {
      id: "population-trends",
      name: "Population Trends",
      description: "Track and analyze species population trends",
      icon: BarChart3,
      route: "/solutions/population-trends",
      category: "research"
    },
    {
      id: "conservation-insights",
      name: "Conservation Insights",
      description: "Get insights for marine conservation strategies",
      icon: Leaf,
      route: "/solutions/conservation-insights",
      category: "research"
    }
  ]

  // Data submission form state
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    institution: ""
  })
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist')
      if (response.ok) {
        const data = await response.json()
        setWatchlist(data.watchlist || [])
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleDataSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', credentials.name)
      formData.append('email', credentials.email)
      formData.append('institution', credentials.institution)
      formData.append('description', description)
      if (selectedFile) {
        formData.append('file', selectedFile)
      }

      const response = await fetch('/api/admin-message', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your data submission has been sent to the admin team for review.",
        })
        // Reset form
        setCredentials({ name: "", email: "", institution: "" })
        setDescription("")
        setSelectedFile(null)
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToolSelect = (tool: AITool) => {
    setSelectedTools(prev => {
      const isSelected = prev.some(t => t.id === tool.id)
      if (isSelected) {
        return prev.filter(t => t.id !== tool.id)
      } else {
        return [...prev, tool]
      }
    })
  }

  const handleDataSubmissionWithTool = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTools.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one AI tool for your data analysis.",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Convert file to base64 for email attachment
      let fileBase64 = null
      if (selectedFile) {
        fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          institution: credentials.institution,
          description: description,
          selectedTools: selectedTools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description
          })),
          fileName: selectedFile?.name || null,
          fileSize: selectedFile?.size || null,
          fileType: selectedFile?.type || null,
          fileBase64: fileBase64
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Your data submission has been sent for analysis using ${selectedTools.length} AI tool(s).`,
        })
        // Reset form
        setCredentials({ name: "", email: "", institution: "" })
        setDescription("")
        setSelectedFile(null)
        setSelectedTools([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

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
              <Bookmark className="h-10 w-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">Research Watchlist</h1>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto text-balance">
              Track your research interests, submit new data for review, and collaborate with our marine biodiversity research team.
            </p>
          </div>

          {/* AI Tools Section */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
              <Zap className="h-8 w-8 text-cyan-400" />
              Available AI Tools
            </h2>
            <p className="text-cyan-100 text-center mb-8 max-w-2xl mx-auto">
              Select the AI tool you want to use for analyzing your data. Each tool is specialized for different types of marine research.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiTools.map((tool) => {
                const IconComponent = tool.icon
                const isSelected = selectedTools.some(t => t.id === tool.id)
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-400/20"
                        : "border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${
                        isSelected ? "bg-cyan-500/20" : "bg-white/10"
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          isSelected ? "text-cyan-400" : "text-white"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          isSelected ? "text-cyan-300" : "text-white"
                        }`}>
                          {tool.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tool.category === "recognition" ? "bg-blue-500/20 text-blue-300" :
                          tool.category === "analysis" ? "bg-green-500/20 text-green-300" :
                          tool.category === "monitoring" ? "bg-purple-500/20 text-purple-300" :
                          "bg-orange-500/20 text-orange-300"
                        }`}>
                          {tool.category}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-cyan-200 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                )
              })}
            </div>
            
            {selectedTools.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  Selected AI Tools ({selectedTools.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTools.map((tool) => {
                    const IconComponent = tool.icon
                    return (
                      <div key={tool.id} className="flex items-center gap-2 bg-cyan-500/20 px-3 py-2 rounded-lg">
                        <IconComponent className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-300 text-sm font-medium">{tool.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </GlassmorphismCard>

          {/* Data Submission Section */}
          <GlassmorphismCard className="p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
              <Upload className="h-8 w-8 text-emerald-400" />
              Submit New Data
            </h2>
            <p className="text-cyan-100 text-center mb-8 max-w-2xl mx-auto">
              Contribute to our marine biodiversity database by submitting your research data, images, or documents for review by our expert team.
            </p>

            <form onSubmit={handleDataSubmissionWithTool} className="max-w-4xl mx-auto space-y-6">
              {/* Credentials Verification */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  Verify Your Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Full Name *</label>
                    <Input
                      value={credentials.name}
                      onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                      placeholder="Dr. Jane Smith"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Email Address *</label>
                    <Input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      placeholder="jane.smith@university.edu"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-cyan-100 mb-2 block">Institution/Organization *</label>
                    <Input
                      value={credentials.institution}
                      onChange={(e) => setCredentials({...credentials, institution: e.target.value})}
                      placeholder="Marine Research Institute"
                      className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-cyan-100 mb-2 block">Data Description *</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide a detailed explanation of the data you want to add, including its source, collection method, and relevance to marine biodiversity research..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-cyan-200 min-h-[120px]"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-cyan-100 mb-2 block">Attach Supporting Files (Optional)</label>
                <div 
                  className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-cyan-400/50 transition-colors cursor-pointer"
                  onClick={handleFileClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xlsx,.txt,.fasta,.fa,.seq"
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <span className="text-cyan-100 hover:text-cyan-300">Click to upload files</span>
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-cyan-500/10 rounded-lg">
                      <p className="text-cyan-200 text-sm font-medium">Selected: {selectedFile.name}</p>
                      <p className="text-cyan-200/70 text-xs">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                  <p className="text-cyan-200/70 text-xs mt-2">PDF, DOC, images, or data files (max 10MB)</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || selectedTools.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-cyan-400/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : selectedTools.length > 0 ? `Submit Data for ${selectedTools.length} AI Tool${selectedTools.length > 1 ? 's' : ''} Analysis` : "Please Select at Least One AI Tool"}
              </Button>
            </form>
          </GlassmorphismCard>

        </div>
      </div>
    </div>
  )
}