"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Search, BarChart3, Camera, Microscope, FileImage } from "lucide-react"
import Link from "next/link"
import { useTokenRefresh } from "@/hooks/use-token-refresh"

interface SpeciesAnalysis {
  speciesName: string
  commonName: string
  family: string
  populationEstimate: string
  region: string
  confidence: number
  description: string
  conservationStatus: string
  timestamp: string
  [key: string]: any
}

export function InteractivePredictionSection() {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<SpeciesAnalysis | null>(null)
  const [speciesCount, setSpeciesCount] = useState(250)
  const [newSpeciesCount, setNewSpeciesCount] = useState(12)
  const [recentPredictions, setRecentPredictions] = useState<SpeciesAnalysis[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refreshTokenStatus } = useTokenRefresh()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'text/csv', 'text/plain']
    if (!allowedTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
      alert('Please select a valid file type (JPG, PNG, MP4, CSV, FASTA)')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)

    // If it's an image, create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImage(null)
    }
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handlePredict = async () => {
    if (!selectedFile && !inputValue.trim()) {
      alert('Please upload a file or enter a URL/Data ID')
      return
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      let fileBase64 = null
      let fileName = null
      let fileType = null

      // Convert file to base64 if present
      if (selectedFile) {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
        fileName = selectedFile.name
        fileType = selectedFile.type
      }

      // Call the analysis API
      const response = await fetch('/api/analyze-species', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64,
          fileName,
          fileType,
          inputValue: inputValue.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setAnalysisResult(result.data)
        
        // Update counters
        setSpeciesCount(prev => prev + 1)
        
        // Check if it's a new family (increment new species)
        const isNewFamily = !recentPredictions.some(pred => pred.family === result.data.family)
        if (isNewFamily) {
          setNewSpeciesCount(prev => prev + 1)
        }
        
        // Add to recent predictions
        setRecentPredictions(prev => [result.data, ...prev.slice(0, 2)]) // Keep last 3
        
        // Refresh token status after successful AI analysis
        refreshTokenStatus()
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Prediction error:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="prediction" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Interactive Prediction Tool</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Upload deep-sea footage, environmental data, or gene sequences for real-time AI analysis and species
            identification.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Input Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Species Identification & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Enter Deep-Sea Footage URL or Data ID
                  </label>
                  <Input
                    placeholder="Enter Deep-Sea Footage URL or Data ID"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.mp4,.csv,.txt,.fasta,.fa,.seq"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-4">
                      {selectedImage ? (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden mx-auto">
                          <img
                            src={selectedImage}
                            alt="Selected file preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <FileImage className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm font-medium text-card-foreground mb-2">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={handleChooseFile}
                          className="bg-transparent"
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Change File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Upload image, video, or data file</p>
                      <p className="text-sm text-muted-foreground">Supports: JPG, PNG, MP4, CSV, FASTA</p>
                      <Button 
                        variant="outline" 
                        onClick={handleChooseFile}
                        className="mt-4 bg-transparent"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Analyzing..." : "Predict"}
              </Button>

              <div className="pt-4 border-t border-border">
                <Link href="/species-recognition">
                  <Button variant="outline" className="w-full bg-transparent group">
                    <Camera className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Advanced Species Recognition System
                    <Microscope className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Analysis includes:</p>
                <ul className="space-y-1">
                  <li>• Species Identification → Species Population Trends</li>
                  <li>• Environmental Impact Assessment</li>
                  <li>• Conservation Risk Analysis</li>
                  <li>• Habitat Quality Evaluation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Results Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Analysis Results */}
                {analysisResult ? (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-card-foreground mb-2">
                        {analysisResult.speciesName}
                      </h3>
                      <p className="text-muted-foreground">{analysisResult.commonName}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-card-foreground">Family:</span>
                        <span className="ml-2 text-muted-foreground">{analysisResult.family}</span>
                      </div>
                      <div>
                        <span className="font-medium text-card-foreground">Region:</span>
                        <span className="ml-2 text-muted-foreground">{analysisResult.region}</span>
                      </div>
                      <div>
                        <span className="font-medium text-card-foreground">Population:</span>
                        <span className="ml-2 text-muted-foreground">{analysisResult.populationEstimate}</span>
                      </div>
                      <div>
                        <span className="font-medium text-card-foreground">Conservation:</span>
                        <span className="ml-2 text-muted-foreground">{analysisResult.conservationStatus}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="font-medium text-card-foreground">Description:</span>
                      <p className="text-muted-foreground mt-1">{analysisResult.description}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary/20 rounded-lg p-6 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {isLoading ? "Analyzing..." : "Analysis results will appear here"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dynamic Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{speciesCount}</div>
                    <div className="text-sm text-muted-foreground">Species Identified</div>
                  </div>
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <div className="text-2xl font-bold text-accent">
                      {analysisResult ? `${analysisResult.confidence}%` : '85%'}
                    </div>
                    <div className="text-sm text-muted-foreground">Confidence Level</div>
                  </div>
                  <div className="bg-chart-2/5 rounded-lg p-4 border border-chart-2/20">
                    <div className="text-2xl font-bold text-chart-2">{newSpeciesCount}</div>
                    <div className="text-sm text-muted-foreground">New Species</div>
                  </div>
                  <div className="bg-chart-4/5 rounded-lg p-4 border border-chart-4/20">
                    <div className="text-2xl font-bold text-chart-4">
                      {analysisResult ? 
                        (analysisResult.confidence > 80 ? 'High' : 
                         analysisResult.confidence > 60 ? 'Medium' : 'Low') : 'High'}
                    </div>
                    <div className="text-sm text-muted-foreground">Biodiversity</div>
                  </div>
                </div>

                {/* Recent Predictions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Recent Predictions</h4>
                  <div className="space-y-2">
                    {recentPredictions.length > 0 ? (
                      recentPredictions.map((prediction, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                          <div>
                            <span className="text-sm text-card-foreground font-medium">
                              {prediction.speciesName}
                            </span>
                            <p className="text-xs text-muted-foreground">{prediction.commonName}</p>
                          </div>
                          <span className="text-sm text-primary font-medium">
                            {prediction.confidence}% confidence
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                        <span className="text-sm text-card-foreground">Vampyroteuthis infernalis</span>
                        <span className="text-sm text-primary font-medium">94% confidence</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
