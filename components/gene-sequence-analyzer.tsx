"use client"

import { useState, useRef } from "react"
import { GlassmorphismCard } from "@/components/glassmorphism-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dna, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  BarChart3,
  Sparkles,
  Upload,
  Copy,
  Download
} from "lucide-react"
import { toast } from "sonner"

interface PredictionResult {
  sequence_id: string
  sequence_length: number
  predicted_species: string
  confidence: number
  probability_distribution: number[]
  sequence_preview: string
}

interface AnalysisResponse {
  success: boolean
  predictions?: PredictionResult[]
  model_info?: any
  total_sequences?: number
  error?: string
  message?: string
}

export function GeneSequenceAnalyzer() {
  const [sequences, setSequences] = useState<string[]>([])
  const [sequenceType, setSequenceType] = useState("COI")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResponse | null>(null)
  const [currentSequence, setCurrentSequence] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddSequence = () => {
    if (currentSequence.trim()) {
      const cleanSequence = currentSequence.trim().toUpperCase().replace(/[^ATGC]/g, '')
      if (cleanSequence.length > 0) {
        setSequences(prev => [...prev, cleanSequence])
        setCurrentSequence("")
        toast.success("Sequence added successfully")
      } else {
        toast.error("Please enter a valid DNA sequence (A, T, G, C only)")
      }
    }
  }

  const handleRemoveSequence = (index: number) => {
    setSequences(prev => prev.filter((_, i) => i !== index))
    toast.success("Sequence removed")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const lines = content.split('\n').filter(line => line.trim())
        const validSequences = lines
          .map(line => line.trim().toUpperCase().replace(/[^ATGC]/g, ''))
          .filter(seq => seq.length > 0)
        
        if (validSequences.length > 0) {
          setSequences(prev => [...prev, ...validSequences])
          toast.success(`Added ${validSequences.length} sequences from file`)
        } else {
          toast.error("No valid DNA sequences found in file")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleAnalyze = async () => {
    if (sequences.length === 0) {
      toast.error("Please add at least one sequence to analyze")
      return
    }

    setIsAnalyzing(true)
    setResults(null)

    try {
      const response = await fetch('/api/ml/gene-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequences,
          sequenceType,
        }),
      })

      const data: AnalysisResponse = await response.json()
      setResults(data)

      if (data.success) {
        toast.success(`Analysis complete! Processed ${data.total_sequences} sequences`)
      } else {
        toast.error(data.message || "Analysis failed")
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("Failed to connect to analysis service")
      setResults({
        success: false,
        error: "Connection failed",
        message: "Could not connect to the analysis service. Please ensure the model server is running."
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const downloadResults = () => {
    if (!results?.predictions) return

    const csvContent = [
      "Sequence ID,Species,Confidence,Sequence Length,Sequence Preview",
      ...results.predictions.map(pred => 
        `"${pred.sequence_id}","${pred.predicted_species}",${pred.confidence.toFixed(4)},${pred.sequence_length},"${pred.sequence_preview}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gene_analysis_results_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Results downloaded")
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <GlassmorphismCard className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-lg flex items-center justify-center mr-4 backdrop-blur-md border border-emerald-400/30">
            <Dna className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gene Sequence Analyzer</h2>
            <p className="text-emerald-100">Upload DNA sequences for species identification</p>
          </div>
        </div>

        {/* Sequence Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Sequence Type</label>
          <select
            value={sequenceType}
            onChange={(e) => setSequenceType(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="COI">COI (Cytochrome c oxidase subunit I)</option>
            <option value="16S">16S rRNA</option>
            <option value="18S">18S rRNA</option>
            <option value="ITS">ITS (Internal Transcribed Spacer)</option>
            <option value="General">General DNA Sequence</option>
          </select>
        </div>

        {/* Sequence Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Add DNA Sequence</label>
          <div className="flex gap-3">
            <Textarea
              value={currentSequence}
              onChange={(e) => setCurrentSequence(e.target.value)}
              placeholder="Enter DNA sequence (A, T, G, C only)..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
              rows={3}
            />
            <Button
              onClick={handleAddSequence}
              disabled={!currentSequence.trim()}
              className="bg-emerald-500/20 border-emerald-400/30 hover:bg-emerald-400/30 text-emerald-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">Or Upload File</label>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.fasta,.fa,.seq"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <span className="text-sm text-emerald-200 self-center">
              Supports .txt, .fasta, .fa, .seq files
            </span>
          </div>
        </div>

        {/* Sequence List */}
        {sequences.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Sequences to Analyze ({sequences.length})</h3>
              <Button
                onClick={() => setSequences([])}
                variant="outline"
                size="sm"
                className="bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-400/30"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sequences.map((seq, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <div className="text-sm text-white font-mono">
                      {seq.length > 60 ? `${seq.substring(0, 60)}...` : seq}
                    </div>
                    <div className="text-xs text-emerald-200">Length: {seq.length} bp</div>
                  </div>
                  <Button
                    onClick={() => handleRemoveSequence(index)}
                    variant="outline"
                    size="sm"
                    className="bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-400/30 ml-3"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={sequences.length === 0 || isAnalyzing}
          className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400/30 hover:from-emerald-400/30 hover:to-teal-400/30 text-emerald-400 py-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Sequences...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Analyze Sequences
            </>
          )}
        </Button>
      </GlassmorphismCard>

      {/* Results Section */}
      {results && (
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mr-4 backdrop-blur-md border border-blue-400/30">
                {results.success ? (
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                <p className="text-blue-100">
                  {results.success ? `${results.total_sequences} sequences analyzed` : "Analysis failed"}
                </p>
              </div>
            </div>
            {results.success && results.predictions && (
              <Button
                onClick={downloadResults}
                variant="outline"
                className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-400/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            )}
          </div>

          {results.success && results.predictions ? (
            <div className="space-y-4">
              {results.predictions.map((prediction, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-emerald-500/20 border-emerald-400/30 text-emerald-400">
                        {prediction.sequence_id}
                      </Badge>
                      <span className="text-sm text-white/70">Length: {prediction.sequence_length} bp</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-white/70">Confidence:</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-2">Predicted Species</h3>
                    <div className="text-xl font-bold text-emerald-400 mb-2">
                      {prediction.predicted_species}
                    </div>
                    <Progress 
                      value={prediction.confidence * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-white mb-2">Sequence Preview</h4>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-2 bg-black/20 rounded text-emerald-300 text-sm font-mono">
                        {prediction.sequence_preview}
                      </code>
                      <Button
                        onClick={() => copyToClipboard(prediction.sequence_preview)}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert className="bg-red-500/10 border-red-400/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {results.message || results.error || "Analysis failed"}
              </AlertDescription>
            </Alert>
          )}
        </GlassmorphismCard>
      )}
    </div>
  )
}