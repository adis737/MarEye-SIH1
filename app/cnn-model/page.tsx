"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Play, 
  Download, 
  Image as ImageIcon, 
  Video, 
  Brain, 
  Zap, 
  Target,
  BarChart3,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from "lucide-react"

interface ProcessingResult {
  type?: "image" | "video"
  originalImage?: string
  enhancedImage?: string
  originalVideo?: string
  enhancedVideo?: string
  enhancedVideoDownload?: string
  metrics: {
    psnr: number
    ssim: number
    uiqm_original: number
    uiqm_enhanced: number
    uiqm_improvement: number
  }
  processingTime: number
  videoInfo?: {
    framesProcessed: number
    fps: number
    duration: number
    codecUsed?: string
    enhancementMethod?: string
  }
  videoError?: boolean
}

export default function CNNModelPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [activeTab, setActiveTab] = useState("image")
  const [isVideoProcessing, setIsVideoProcessing] = useState(false)
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add event listener to prevent page refresh and handle errors
  useEffect(() => {
    // Override the default error handling to prevent page refresh
    const originalError = window.onerror
    const originalUnhandledRejection = window.onunhandledrejection
    
    window.onerror = (message, source, lineno, colno, error) => {
      console.warn("Global error caught:", message, source, lineno, colno, error)
      
      // Prevent Next.js manifest errors from causing page refresh
      if (message && (
        message.toString().includes('Unexpected end of JSON input') ||
        message.toString().includes('loadManifest') ||
        message.toString().includes('getNextFontManifest')
      )) {
        console.warn("Next.js manifest error prevented from causing page refresh")
        return true // Prevent default error handling
      }
      
      // Prevent any errors during video processing from causing page refresh
      if (isVideoProcessing) {
        console.warn("Error during video processing prevented from causing page refresh")
        return true // Prevent default error handling
      }
      
      // Call original error handler for other errors
      if (originalError) {
        return originalError(message, source, lineno, colno, error)
      }
      return false
    }
    
    window.onunhandledrejection = (event) => {
      console.warn("Unhandled promise rejection caught:", event.reason)
      
      // Prevent Next.js manifest promise rejections from causing page refresh
      if (event.reason && event.reason.message && 
          event.reason.message.includes('Unexpected end of JSON input')) {
        console.warn("Next.js manifest promise rejection prevented from causing page refresh")
        event.preventDefault()
        return
      }
      
      // Call original handler for other rejections
      if (originalUnhandledRejection) {
        originalUnhandledRejection(event)
      }
    }
    
    return () => {
      window.onerror = originalError
      window.onunhandledrejection = originalUnhandledRejection
    }
  }, [isVideoProcessing])

  // Restore results from localStorage on page load
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('cnn-processing-results')
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults)
        setResults(parsedResults)
        console.log("Restored results from localStorage:", parsedResults.length, "results")
      }
    } catch (error) {
      console.warn("Failed to restore results from localStorage:", error)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const processImage = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProcessingProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "image")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 500)

      // Call the API
      const response = await fetch("/api/cnn/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProcessingProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Processing failed")
      }

      const result = await response.json()

      if (result.success) {
        const processingResult: ProcessingResult = {
          type: "image",
          originalImage: URL.createObjectURL(selectedFile),
          enhancedImage: result.enhancedImage,
          metrics: result.metrics,
          processingTime: result.processingTime
        }

        setResults(prev => [processingResult, ...prev])
      } else {
        throw new Error("Processing failed")
      }
        } catch (error) {
          console.error("Processing error:", error)
          
          // Show more specific error messages
          let errorMessage = "Unknown error"
          if (error instanceof Error) {
        if (error.message.includes("Could not open input video")) {
          errorMessage = "Could not open the video file. Please check the file format."
        } else if (error.message.includes("Could not create output video")) {
          errorMessage = "Video codec issue. Please try a different video format."
        } else if (error.message.includes("Failed to load CNN model")) {
          errorMessage = "CNN model loading failed. Please try again."
        } else if (error.message.includes("Required file not found")) {
          errorMessage = "Required files missing. Please contact support."
        } else if (error.message.includes("encoding issue")) {
          errorMessage = "Video processing failed due to encoding issue. Please try again."
        } else if (error.message.includes("codec not supported")) {
          errorMessage = "Video codec not supported. The system is trying alternative codecs."
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network connection issue. Please check your connection."
        } else if (error.message.includes("timed out")) {
          errorMessage = "Video processing timed out. Please try with a shorter video."
        } else {
          errorMessage = error.message
        }
          }
          
          alert(`Error: ${errorMessage}`)
        } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }


  const processVideo = async () => {
    if (!selectedFile) {
      console.error("No file selected for video processing")
      alert("Please select a video file first")
      return
    }

    console.log("Starting video processing:")
    console.log("- Selected file:", selectedFile.name)
    console.log("- File size:", selectedFile.size)
    console.log("- File type:", selectedFile.type)

    setIsProcessing(true)
    setIsVideoProcessing(true)
    setProcessingProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "video")
      
      console.log("FormData created with file and type")

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 5
        })
      }, 1000)

      // Call the API with timeout handling
      console.log("Sending request to /api/cnn/process")
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
      
      let response
      try {
        response = await fetch("/api/cnn/process", {
          method: "POST",
          body: formData,
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        clearInterval(progressInterval)
        setProcessingProgress(100)

        console.log("API Response received:")
        console.log("- Status:", response.status)
        console.log("- OK:", response.ok)
        console.log("- Headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.error || "Video processing failed")
        }
      } catch (error) {
        clearTimeout(timeoutId)
        clearInterval(progressInterval)
        setProcessingProgress(0)
        
        if (error.name === 'AbortError') {
          console.error("Request timed out after 2 minutes")
          throw new Error("Video processing timed out. Please try with a shorter video.")
        } else {
          console.error("Network error:", error)
          throw new Error(`Network error: ${error.message}`)
        }
      }

      const result = await response.json()
      console.log("API Response result:", result)
      console.log("Result keys:", Object.keys(result))
      console.log("Result success:", result.success)
      console.log("Result type:", result.type)
      console.log("Enhanced video length:", result.enhancedVideo ? result.enhancedVideo.length : "No enhanced video")

      if (result.success) {
        // Convert base64 download data to blob URL for better playback
        let enhancedVideoUrl = result.enhancedVideo
        
        if (result.enhancedVideoDownload && result.enhancedVideoDownload.startsWith('data:')) {
          try {
            // Extract base64 data
            const base64Data = result.enhancedVideoDownload.split(',')[1]
            const mimeType = result.enhancedVideoDownload.split(':')[1].split(';')[0]
            
            // Convert to blob
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: mimeType })
            
            // Create blob URL
            enhancedVideoUrl = URL.createObjectURL(blob)
            console.log("Created blob URL for enhanced video:", enhancedVideoUrl)
          } catch (error) {
            console.warn("Failed to create blob URL, using API URL:", error)
          }
        }
        
        const processingResult: ProcessingResult = {
          type: "video",
          originalVideo: URL.createObjectURL(selectedFile),
          enhancedVideo: enhancedVideoUrl,
          enhancedVideoDownload: result.enhancedVideoDownload,
          metrics: result.metrics,
          processingTime: result.processingTime,
          videoInfo: result.videoInfo
        }
        
        console.log("Processing result created:", processingResult)
        console.log("Enhanced video URL:", processingResult.enhancedVideo)

        // Use a more stable state update to prevent page refresh
        setResults(prev => {
          const newResults = [processingResult, ...prev]
          // Store in localStorage to survive page refreshes
          try {
            localStorage.setItem('cnn-processing-results', JSON.stringify(newResults))
          } catch (error) {
            console.warn("Failed to save results to localStorage:", error)
          }
          return newResults
        })
        
        // Clear selected file to prevent re-processing
        setSelectedFile(null)
      } else {
        throw new Error("Video processing failed")
      }
    } catch (error) {
      console.error("Video processing error:", error)
      
      // Show more specific error messages
      let errorMessage = "Unknown error"
      if (error instanceof Error) {
        if (error.message.includes("Could not open input video")) {
          errorMessage = "Could not open the video file. Please check the file format."
        } else if (error.message.includes("Could not create output video")) {
          errorMessage = "Video codec issue. Please try a different video format."
        } else if (error.message.includes("Failed to load CNN model")) {
          errorMessage = "CNN model loading failed. Please try again."
        } else if (error.message.includes("Required file not found")) {
          errorMessage = "Required files missing. Please contact support."
        } else if (error.message.includes("encoding issue")) {
          errorMessage = "Video processing failed due to encoding issue. Please try again."
        } else if (error.message.includes("codec not supported")) {
          errorMessage = "Video codec not supported. The system is trying alternative codecs."
        } else if (error.message.includes("Network error")) {
          errorMessage = "Network connection issue. Please check your connection."
        } else if (error.message.includes("timed out")) {
          errorMessage = "Video processing timed out. Please try with a shorter video."
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
      setIsVideoProcessing(false)
      setProcessingProgress(0)
    }
  }

  const handleDeleteResult = (index: number) => {
    setResults(prev => {
      // Revoke blob URLs to free memory
      const resultToDelete = prev[index]
      if (resultToDelete?.enhancedVideo?.startsWith('blob:')) {
        URL.revokeObjectURL(resultToDelete.enhancedVideo)
      }
      if (resultToDelete?.originalVideo?.startsWith('blob:')) {
        URL.revokeObjectURL(resultToDelete.originalVideo)
      }
      
      const newResults = prev.filter((_, i) => i !== index)
      try {
        localStorage.setItem('cnn-processing-results', JSON.stringify(newResults))
      } catch (error) {
        console.warn("Failed to update localStorage:", error)
      }
      return newResults
    })
    // Also remove from video errors set
    setVideoErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const handleVideoError = (index: number) => {
    setVideoErrors(prev => new Set(prev).add(index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 relative">
      
      {/* Header Section */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-2xl flex items-center justify-center mr-4">
                <Brain className="w-8 h-8 text-cyan-300" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                CNN Model
              </h1>
            </div>
            <p className="text-xl text-cyan-200 max-w-3xl mx-auto leading-relaxed">
              Advanced Convolutional Neural Network for underwater image enhancement and video processing. 
              Transform murky underwater footage into crystal-clear imagery for marine security operations.
            </p>
          </div>

          {/* Model Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">2.5 FPS</div>
                <div className="text-sm text-cyan-300">Processing Speed</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">512×512</div>
                <div className="text-sm text-cyan-300">Input Resolution</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">7.7MB</div>
                <div className="text-sm text-cyan-300">Model Size</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">U-Net</div>
                <div className="text-sm text-cyan-300">Architecture</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Processing Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/40 backdrop-blur-md border border-cyan-500/30">
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Image Enhancement</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Video Processing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="mt-6">
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    <span>Image Enhancement</span>
                  </CardTitle>
                  <CardDescription className="text-cyan-300">
                    Upload an underwater image to enhance its clarity, color, and overall quality using our CNN model.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload an image or drag and drop</p>
                    <p className="text-sm text-cyan-300 mb-4">Supports JPG, PNG, BMP formats</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                    >
                      Choose File
                    </Button>
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-white">Selected: {selectedFile.name}</p>
                        <p className="text-xs text-cyan-300">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>

                  {/* Processing Controls */}
                  <div className="flex justify-center">
                    <Button
                      onClick={processImage}
                      disabled={!selectedFile || isProcessing}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Enhance Image
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-cyan-300">
                        <span>Processing...</span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video" className="mt-6">
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <span>Video Processing</span>
                  </CardTitle>
                  <CardDescription className="text-cyan-300">
                    Upload an underwater video to enhance all frames using our CNN model with comprehensive analytics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-cyan-500/30 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Video className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <p className="text-white mb-2">Click to upload a video or drag and drop</p>
                    <p className="text-sm text-cyan-300 mb-4">Supports MP4, AVI, MOV, MKV formats</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                    >
                      Choose Video
                    </Button>
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-sm text-white">Selected: {selectedFile.name}</p>
                        <p className="text-xs text-cyan-300">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>

                  {/* Processing Controls */}
                  <div className="flex justify-center">
                    <Button
                      onClick={processVideo}
                      disabled={!selectedFile || isProcessing}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Process Video
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Processing Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-cyan-300">
                        <span>Processing video frames...</span>
                        <span>{Math.round(processingProgress)}%</span>
                      </div>
                      <Progress value={processingProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
                <span>Processing Results</span>
              </h2>
              
              <div className="space-y-6">
                {results.map((result, index) => (
                  <Card key={index} className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Images/Videos */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Original</h3>
                            {result.type === "video" ? (
                              <video 
                                src={result.originalVideo} 
                                controls
                                className="w-full h-48 object-cover rounded-lg border border-cyan-500/30"
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img 
                                src={result.originalImage} 
                                alt="Original" 
                                className="w-full h-48 object-cover rounded-lg border border-cyan-500/30"
                              />
                            )}
                          </div>
         <div>
           <h3 className="text-lg font-semibold text-white mb-2">Enhanced</h3>
           {result.type === "video" ? (
             <div>
               <div className="relative">
                 {result.enhancedVideo ? (
                   videoErrors.has(index) ? (
                     <div className="w-full h-48 bg-gray-800 rounded-lg border border-red-500/30 flex items-center justify-center text-red-400">
                       <div className="text-center">
                         <p className="text-sm">Video playback failed</p>
                         <p className="text-xs mt-1">Codec: {result.videoInfo?.codecUsed || 'Unknown'}</p>
                         {result.metrics?.uiqm_improvement < 0 ? (
                           <p className="text-xs mt-1 text-yellow-400">⚠ Model may be degrading quality</p>
                         ) : (
                           <p className="text-xs mt-1 text-green-400">✓ Enhancement successful!</p>
                         )}
                         <p className="text-xs mt-1">Use download button below</p>
                       </div>
                     </div>
                   ) : (
                     <video 
                       key={`video-${index}`}
                       controls
                       preload="auto"
                       playsInline
                       className="w-full h-48 object-cover rounded-lg border border-emerald-500/30"
                       onError={(e) => {
                         const videoElement = e.currentTarget
                         const error = videoElement.error
                         console.error("Video error:", {
                           code: error?.code,
                           message: error?.message,
                           src: result.enhancedVideo,
                           codec: result.videoInfo?.codecUsed
                         })
                         handleVideoError(index)
                       }}
                       onLoadedMetadata={() => {
                         console.log("Video metadata loaded successfully")
                         console.log("Codec:", result.videoInfo?.codecUsed)
                       }}
                       onCanPlay={() => console.log("Video can play")}
                       onLoadStart={() => console.log("Video load started")}
                     >
                       <source src={result.enhancedVideo} type="video/mp4" />
                       <source src={result.enhancedVideo} type="video/mp4; codecs=avc1" />
                       Your browser does not support the video tag or the video codec.
                     </video>
                   )
                 ) : (
                   <div className="w-full h-48 bg-gray-800 rounded-lg border border-red-500/30 flex items-center justify-center text-red-400">
                     <div className="text-center">
                       <p className="text-sm">Enhanced video not available</p>
                       <p className="text-xs mt-1">Please try processing again</p>
                     </div>
                   </div>
                 )}
               </div>
               <div className="text-xs text-gray-400 mt-1">
                 Video URL length: {result.enhancedVideo ? result.enhancedVideo.length : "No URL"}
                 {result.videoInfo?.codecUsed && (
                   <div>Codec: {result.videoInfo.codecUsed}</div>
                 )}
               </div>
               <div className="mt-2">
                 <a 
                   href={result.enhancedVideo} 
                   download={`enhanced_${result.originalFileName || 'video.mp4'}`}
                   className="inline-block px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                 >
                   Download Enhanced Video
                 </a>
               </div>
             </div>
           ) : (
             <img 
               src={result.enhancedImage} 
               alt="Enhanced" 
               className="w-full h-48 object-cover rounded-lg border border-emerald-500/30"
             />
           )}
         </div>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Quality Metrics</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-sm text-cyan-300 mb-1">PSNR</div>
                              <div className="text-2xl font-bold text-white">{(result.metrics.psnr || 0).toFixed(2)} dB</div>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {(result.metrics.psnr || 0) > 20 ? "Good" : "Low"}
                              </Badge>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-sm text-cyan-300 mb-1">SSIM</div>
                              <div className="text-2xl font-bold text-white">{(result.metrics.ssim || 0).toFixed(4)}</div>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {(result.metrics.ssim || 0) > 0.8 ? "High" : "Moderate"}
                              </Badge>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-sm text-cyan-300 mb-1">UIQM Original</div>
                              <div className="text-2xl font-bold text-white">{(result.metrics.uiqm_original || 0).toFixed(2)}</div>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <div className="text-sm text-cyan-300 mb-1">UIQM Enhanced</div>
                              <div className="text-2xl font-bold text-white">{(result.metrics.uiqm_enhanced || 0).toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg p-4 border border-emerald-500/30">
                            <div className="text-sm text-emerald-300 mb-1">UIQM Improvement</div>
                            <div className="text-2xl font-bold text-emerald-400">
                              {(result.metrics.uiqm_improvement || 0) >= 0 ? '+' : ''}{(result.metrics.uiqm_improvement || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-emerald-300 mt-1">
                              {(result.metrics.uiqm_improvement || 0) > 0 ? "Enhancement successful" : "Enhancement failed"}
                            </div>
                          </div>

                          {/* Video Info */}
                          {result.type === "video" && result.videoInfo && (
                            <div className="bg-slate-800/50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-cyan-300 mb-2">Video Information</h4>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <div className="text-slate-400">Frames</div>
                                  <div className="text-white font-semibold">{result.videoInfo.framesProcessed}</div>
                                </div>
                                <div>
                                  <div className="text-slate-400">FPS</div>
                                  <div className="text-white font-semibold">{result.videoInfo.fps}</div>
                                </div>
                                <div>
                                  <div className="text-slate-400">Duration</div>
                                  <div className="text-white font-semibold">{result.videoInfo.duration.toFixed(1)}s</div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                            <div className="text-sm text-cyan-300">
                              Processing time: {(result.processingTime || 0).toFixed(3)}s
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  if (result.type === 'video') {
                                    // Use the download URL with base64 data
                                    link.href = result.enhancedVideoDownload || result.enhancedVideo || ''
                                    link.download = `enhanced_video_${Date.now()}.mp4`
                                  } else {
                                    link.href = result.enhancedImage || ''
                                    link.download = `enhanced_image_${Date.now()}.png`
                                  }
                                  link.click()
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-400/50 text-red-300 hover:bg-red-400/10"
                                onClick={() => handleDeleteResult(index)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Model Information */}
          <div className="mt-12">
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Model Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Architecture Details</h4>
                    <ul className="space-y-2 text-cyan-300">
                      <li>• <strong className="text-white">Model:</strong> Truncated U-Net</li>
                      <li>• <strong className="text-white">Input Size:</strong> 512×512 pixels</li>
                      <li>• <strong className="text-white">Channels:</strong> 3 (RGB)</li>
                      <li>• <strong className="text-white">Loss Function:</strong> MS-SSIM + L1</li>
                      <li>• <strong className="text-white">Training Data:</strong> EUVP dataset (5885 images)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Performance Metrics</h4>
                    <ul className="space-y-2 text-cyan-300">
                      <li>• <strong className="text-white">CPU Inference:</strong> ~400ms per image</li>
                      <li>• <strong className="text-white">ONNX Runtime:</strong> ~440ms per image</li>
                      <li>• <strong className="text-white">Model Size:</strong> 7.7MB (ONNX)</li>
                      <li>• <strong className="text-white">Memory Usage:</strong> ~200MB</li>
                      <li>• <strong className="text-white">Edge Ready:</strong> Jetson, NUC, Raspberry Pi</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
