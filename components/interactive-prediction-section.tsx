"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Search, BarChart3, Camera, Microscope } from "lucide-react"
import Link from "next/link"

export function InteractivePredictionSection() {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePredict = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
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
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Upload image, video, or data file</p>
                  <p className="text-sm text-muted-foreground">Supports: JPG, PNG, MP4, CSV, FASTA</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Choose File
                  </Button>
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
                {/* Sample Chart Placeholder */}
                <div className="bg-secondary/20 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Analysis results will appear here</p>
                  </div>
                </div>

                {/* Sample Results */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <div className="text-2xl font-bold text-primary">250</div>
                    <div className="text-sm text-muted-foreground">Species Identified</div>
                  </div>
                  <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
                    <div className="text-2xl font-bold text-accent">85%</div>
                    <div className="text-sm text-muted-foreground">Confidence Level</div>
                  </div>
                  <div className="bg-chart-2/5 rounded-lg p-4 border border-chart-2/20">
                    <div className="text-2xl font-bold text-chart-2">12</div>
                    <div className="text-sm text-muted-foreground">New Species</div>
                  </div>
                  <div className="bg-chart-4/5 rounded-lg p-4 border border-chart-4/20">
                    <div className="text-2xl font-bold text-chart-4">High</div>
                    <div className="text-sm text-muted-foreground">Biodiversity</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Recent Predictions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                      <span className="text-sm text-card-foreground">Vampyroteuthis infernalis</span>
                      <span className="text-sm text-primary font-medium">94% confidence</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg">
                      <span className="text-sm text-card-foreground">Atolla jellyfish</span>
                      <span className="text-sm text-primary font-medium">87% confidence</span>
                    </div>
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
