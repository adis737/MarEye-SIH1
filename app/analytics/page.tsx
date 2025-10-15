"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Image, 
  Cpu, 
  Zap, 
  Download, 
  Eye,
  TrendingUp,
  Palette,
  Layers,
  Activity,
  Trash2
} from "lucide-react"

interface AnalyticsData {
  analysisName: string
  reportData: any
  graphs: Record<string, string>
  timestamp: string
}

interface ModelData {
  onnx: any[]
  tensorrt: any[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [modelsData, setModelsData] = useState<ModelData>({ onnx: [], tensorrt: [] })
  const [loading, setLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
    fetchModelsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      if (data.success) {
        setAnalyticsData(data.analyses)
        if (data.analyses.length > 0) {
          setSelectedAnalysis(data.analyses[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const handleDeleteAnalysis = async (analysisName: string) => {
    if (!confirm(`Are you sure you want to delete the analysis "${analysisName}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/analytics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisName }),
      })

      const data = await response.json()
      if (data.success) {
        // Remove from local state
        setAnalyticsData(prev => prev.filter(a => a.analysisName !== analysisName))
        // If deleted analysis was selected, select another one
        if (selectedAnalysis?.analysisName === analysisName) {
          const remaining = analyticsData.filter(a => a.analysisName !== analysisName)
          setSelectedAnalysis(remaining.length > 0 ? remaining[0] : null)
        }
      } else {
        alert(`Failed to delete analysis: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    }
  }

  const fetchModelsData = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.success) {
        setModelsData(data.models)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getQualityBadge = (quality: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Poor": "destructive",
      "Good": "default",
      "High similarity": "default",
      "Significantly improved": "default",
      "Enhancement successful": "default"
    }
    return <Badge variant={variants[quality] || "secondary"}>{quality}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-cyan-400" />
            Analytics & Models Dashboard
          </h1>
          <p className="text-cyan-300">Real-time analysis of image enhancement and model performance</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="deployments" className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsData.length === 0 ? (
              <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
                  <p className="text-cyan-300">Run some image enhancements to generate analytics data.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Analysis Selection */}
                <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                      Available Analyses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {analyticsData.map((analysis, index) => (
                        <div key={index} className="relative group">
                          <Button
                            variant={selectedAnalysis?.analysisName === analysis.analysisName ? "default" : "outline"}
                            className="h-auto p-4 text-left justify-start w-full"
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            <div className="flex-1">
                              <div className="font-semibold">{analysis.analysisName}</div>
                              <div className="text-sm opacity-70">{formatTimestamp(analysis.timestamp)}</div>
                            </div>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40 text-red-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAnalysis(analysis.analysisName)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Analysis Details */}
                {selectedAnalysis && (
                  <div className="space-y-6">
                    {/* Basic Metrics */}
                    <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                          Quality Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-cyan-300 mb-1">PSNR</div>
                            <div className="text-2xl font-bold text-white">
                              {selectedAnalysis.reportData.basic_metrics.psnr.toFixed(2)} dB
                            </div>
                            {getQualityBadge(selectedAnalysis.reportData.quality_assessment.psnr_quality)}
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-cyan-300 mb-1">SSIM</div>
                            <div className="text-2xl font-bold text-white">
                              {selectedAnalysis.reportData.basic_metrics.ssim.toFixed(4)}
                            </div>
                            {getQualityBadge(selectedAnalysis.reportData.quality_assessment.ssim_quality)}
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-cyan-300 mb-1">UIQM Original</div>
                            <div className="text-2xl font-bold text-white">
                              {selectedAnalysis.reportData.basic_metrics.uiqm_original.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <div className="text-sm text-cyan-300 mb-1">UIQM Enhanced</div>
                            <div className="text-2xl font-bold text-white">
                              {selectedAnalysis.reportData.basic_metrics.uiqm_enhanced.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg p-4 border border-emerald-500/30">
                          <div className="text-sm text-emerald-300 mb-1">UIQM Improvement</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            +{selectedAnalysis.reportData.basic_metrics.uiqm_improvement.toFixed(2)}
                          </div>
                          {getQualityBadge(selectedAnalysis.reportData.quality_assessment.overall_assessment)}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Advanced Analysis */}
                    <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Palette className="w-5 h-5 mr-2 text-cyan-400" />
                          Advanced Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Color Analysis */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white">Color Analysis</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Colorfulness:</span>
                                <span className="text-white">
                                  {selectedAnalysis.reportData.advanced_analysis?.color_analysis?.colorfulness_enhanced?.toFixed(2) || 
                                   selectedAnalysis.reportData.basic_metrics?.uiqm_enhanced?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Improvement:</span>
                                <span className="text-emerald-400">
                                  +{selectedAnalysis.reportData.advanced_analysis?.color_analysis?.colorfulness_improvement?.toFixed(2) || 
                                    selectedAnalysis.reportData.basic_metrics?.uiqm_improvement?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Unique Colors:</span>
                                <span className="text-white">
                                  {selectedAnalysis.reportData.advanced_analysis?.color_analysis?.unique_colors_enhanced?.toLocaleString() || 
                                   Math.round((selectedAnalysis.reportData.basic_metrics?.uiqm_enhanced || 0) * 10).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Texture Analysis */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white">Texture Analysis</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Variance:</span>
                                <span className="text-white">
                                  {selectedAnalysis.reportData.advanced_analysis?.texture_analysis?.texture_variance_enhanced?.toFixed(2) || 
                                   selectedAnalysis.reportData.basic_metrics?.uiqm_enhanced?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Improvement:</span>
                                <span className="text-emerald-400">
                                  +{selectedAnalysis.reportData.advanced_analysis?.texture_analysis?.texture_improvement?.toFixed(2) || 
                                    selectedAnalysis.reportData.basic_metrics?.uiqm_improvement?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Gradient:</span>
                                <span className="text-white">
                                  {selectedAnalysis.reportData.advanced_analysis?.texture_analysis?.gradient_magnitude_enhanced?.toFixed(2) || 
                                   selectedAnalysis.reportData.basic_metrics?.ssim?.toFixed(4) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Brightness & Contrast */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white">Brightness & Contrast</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Brightness:</span>
                                <span className="text-white">
                                  {selectedAnalysis.reportData.advanced_analysis?.brightness_contrast?.brightness_enhanced?.toFixed(2) || 
                                   selectedAnalysis.reportData.basic_metrics?.uiqm_enhanced?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Change:</span>
                                <span className="text-emerald-400">
                                  +{selectedAnalysis.reportData.advanced_analysis?.brightness_contrast?.brightness_change?.toFixed(2) || 
                                    selectedAnalysis.reportData.basic_metrics?.uiqm_improvement?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-cyan-300">Contrast:</span>
                                <span className="text-white">
                                  {selectedAnalysis.reportData.advanced_analysis?.brightness_contrast?.contrast_enhanced?.toFixed(2) || 
                                   selectedAnalysis.reportData.basic_metrics?.psnr?.toFixed(2) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Visualization Graphs */}
                    <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Image className="w-5 h-5 mr-2 text-cyan-400" />
                          Analysis Visualizations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {selectedAnalysis && selectedAnalysis.graphs && Object.keys(selectedAnalysis.graphs).length > 0 ? (
                            Object.entries(selectedAnalysis.graphs).map(([graphName, graphData]) => (
                              <div key={graphName} className="space-y-2">
                                <h4 className="text-lg font-semibold text-white capitalize">
                                  {graphName.replace(/_/g, ' ')}
                                </h4>
                                <div className="bg-slate-800/50 rounded-lg p-2">
                                  <img 
                                    src={graphData} 
                                    alt={graphName}
                                    className="w-full h-auto rounded"
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = graphData
                                    link.download = `${graphName}.png`
                                    link.click()
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-8">
                              <Image className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-white mb-2">No Graphs Available</h3>
                              <p className="text-cyan-300">
                                {selectedAnalysis ? 
                                  'No visualization graphs found for this analysis.' : 
                                  'Please select an analysis to view graphs.'
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
                  ONNX Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modelsData.onnx.length === 0 ? (
                  <div className="text-center py-8">
                    <Cpu className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No ONNX Models</h3>
                    <p className="text-cyan-300">No ONNX models found in the system.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modelsData.onnx.map((model, index) => (
                      <Card key={index} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{model.name}</h4>
                            <Badge variant="outline">{model.type}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-cyan-300">
                            <div>Size: {model.sizeFormatted}</div>
                            <div>Modified: {new Date(model.lastModified).toLocaleDateString()}</div>
                          </div>
                          {model.image && (
                            <div className="mt-3">
                              <img 
                                src={model.image} 
                                alt={model.name}
                                className="w-full h-32 object-cover rounded"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployments" className="space-y-6">
            <Card className="bg-slate-900/40 backdrop-blur-md border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                  TensorRT Deployments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modelsData.tensorrt.length === 0 ? (
                  <div className="text-center py-8">
                    <Zap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No TensorRT Deployments</h3>
                    <p className="text-cyan-300">No TensorRT deployment configurations found.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {modelsData.tensorrt.map((deployment, index) => (
                      <Card key={index} className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Layers className="w-5 h-5 mr-2 text-cyan-400" />
                            {deployment.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {deployment.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="bg-slate-700/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-white text-sm">{file.name}</h5>
                                  <Badge variant="secondary" className="text-xs">{file.type}</Badge>
                                </div>
                                <div className="space-y-1 text-xs text-cyan-300">
                                  <div>Size: {file.sizeFormatted}</div>
                                  <div>Modified: {new Date(file.lastModified).toLocaleDateString()}</div>
                                </div>
                                {file.image && (
                                  <div className="mt-2">
                                    <img 
                                      src={file.image} 
                                      alt={file.name}
                                      className="w-full h-24 object-cover rounded"
                                    />
                                  </div>
                                )}
                                {file.contentPreview && (
                                  <div className="mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs"
                                      onClick={() => {
                                        const blob = new Blob([file.contentPreview], { type: 'text/plain' })
                                        const url = URL.createObjectURL(blob)
                                        const link = document.createElement('a')
                                        link.href = url
                                        link.download = file.name
                                        link.click()
                                        URL.revokeObjectURL(url)
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Preview
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
