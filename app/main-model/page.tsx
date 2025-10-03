"use client"

import { useState, useRef } from "react"
import { Upload, Download, Sparkles, Settings, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { VideoBackground } from "@/components/video-background"

export default function MainModelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [enhancedUrl, setEnhancedUrl] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [neutralizeCast, setNeutralizeCast] = useState(true)
  const [saturation, setSaturation] = useState([1.0])
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file)
        setError("")
        
        // Create preview URL
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setError("Please select a valid image file (PNG, JPG, JPEG)")
      }
    }
  }

  const handleEnhance = async () => {
    if (!selectedFile) {
      setError("Please select an image first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('neutralize_cast', neutralizeCast ? '1' : '0')
      formData.append('saturation', saturation[0].toString())

      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setEnhancedUrl(result.enhancedImage)
        if (result.isDemo) {
          setError(result.message || "Demo mode: Python model not configured. Showing original image.")
        }
      } else {
        setError(result.error || "Failed to enhance image")
      }
      
    } catch (err) {
      setError("Failed to enhance image. Please try again.")
      console.error("Enhancement error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setEnhancedUrl("")
    setError("")
    setNeutralizeCast(true)
    setSaturation([1.0])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const downloadEnhanced = () => {
    if (enhancedUrl) {
      const link = document.createElement('a')
      link.href = enhancedUrl
      link.download = `enhanced_${selectedFile?.name || 'image.png'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950">
      <VideoBackground />
      
      {/* Header */}
      <div className="relative z-10 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              UDnet Image Enhancement
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Advanced underwater image enhancement using our state-of-the-art deep learning model
            </p>
            <div className="flex items-center justify-center mt-4">
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30">
                <Zap className="w-4 h-4 mr-1" />
                Uncertainty Distribution Network
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload and Controls */}
          <Card className="bg-slate-900/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload & Configure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-cyan-200">Select Image</Label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-8 text-center hover:border-cyan-400/50 transition-colors">
                    <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-cyan-200 mb-2">
                      {selectedFile ? selectedFile.name : "Choose an underwater image"}
                    </p>
                    <p className="text-sm text-cyan-300/70">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label className="text-cyan-200">Original Image</Label>
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-64 object-cover rounded-lg border border-cyan-400/20"
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Enhancement Settings
                </h3>
                
                {/* Neutralize Cast */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="neutralize"
                    checked={neutralizeCast}
                    onCheckedChange={(checked) => setNeutralizeCast(checked as boolean)}
                  />
                  <Label htmlFor="neutralize" className="text-cyan-200">
                    Neutralize color cast
                  </Label>
                </div>

                {/* Saturation */}
                <div className="space-y-2">
                  <Label className="text-cyan-200">
                    Saturation: {saturation[0].toFixed(2)}
                  </Label>
                  <Slider
                    value={saturation}
                    onValueChange={setSaturation}
                    max={2}
                    min={0}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleEnhance}
                  disabled={!selectedFile || isProcessing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhance Image
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <p className="text-blue-200 text-sm">{error}</p>
                  {error.includes("Demo mode") && (
                    <div className="mt-2 text-xs text-blue-300/70">
                      <p>• Interface is fully functional</p>
                      <p>• Shows original image as result</p>
                      <p>• See SETUP.md for Python configuration</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-slate-900/40 backdrop-blur-sm border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Enhanced Result
                </div>
                {enhancedUrl && (
                  <Button
                    onClick={downloadEnhanced}
                    size="sm"
                    variant="outline"
                    className="border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/10"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedUrl ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={enhancedUrl}
                      alt="Enhanced"
                      className="w-full h-64 object-cover rounded-lg border border-cyan-400/20"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                        Enhanced
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-cyan-300 mb-1">Before</p>
                      <img
                        src={previewUrl}
                        alt="Before"
                        className="w-full h-32 object-cover rounded border border-cyan-400/20"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-300 mb-1">After</p>
                      <img
                        src={enhancedUrl}
                        alt="After"
                        className="w-full h-32 object-cover rounded border border-cyan-400/20"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 border-2 border-dashed border-cyan-400/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
                    <p className="text-cyan-300/70">
                      Enhanced image will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="mt-8 bg-slate-900/40 backdrop-blur-sm border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-white">About UDnet Enhancement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-cyan-200">
              <div>
                <h4 className="font-semibold text-white mb-2">Uncertainty Distribution Network</h4>
                <p className="text-sm">
                  Advanced deep learning framework that adapts to uncertainty distribution during 
                  unsupervised reference map generation for robust underwater image enhancement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Key Features</h4>
                <ul className="text-sm space-y-1">
                  <li>• Contrast & saturation adjustment</li>
                  <li>• Gamma correction</li>
                  <li>• Color cast neutralization</li>
                  <li>• Probabilistic enhancement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Technical Details</h4>
                <p className="text-sm">
                  Utilizes U-Net-like conditional variational autoencoder with Probabilistic 
                  Adaptive Instance Normalization for feature uncertainty encoding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
