"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fish, Microscope, Waves, Anchor, Compass, Camera } from "lucide-react"

const researchTopics = [
  {
    id: 1,
    title: "Bioluminescent Organisms",
    description: "Discover how deep-sea creatures create their own light through chemical reactions.",
    icon: Fish,
    category: "Marine Biology",
    depth: "1000-4000m",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Hydrothermal Vents",
    description: "Explore unique ecosystems thriving around underwater volcanic activity.",
    icon: Microscope,
    category: "Geology",
    depth: "2000-6000m",
    color: "bg-orange-500",
  },
  {
    id: 3,
    title: "Deep Ocean Currents",
    description: "Understanding the circulation patterns that drive global climate systems.",
    icon: Waves,
    category: "Oceanography",
    depth: "1000-11000m",
    color: "bg-cyan-500",
  },
  {
    id: 4,
    title: "Abyssal Plains",
    description: "Investigating life in the vast, flat regions of the deep ocean floor.",
    icon: Anchor,
    category: "Marine Ecology",
    depth: "3000-6000m",
    color: "bg-purple-500",
  },
  {
    id: 5,
    title: "Deep Sea Mining",
    description: "Studying the environmental impact of extracting minerals from the ocean floor.",
    icon: Compass,
    category: "Environmental Science",
    depth: "4000-6000m",
    color: "bg-amber-500",
  },
  {
    id: 6,
    title: "ROV Technology",
    description: "Advanced robotics enabling exploration of previously unreachable depths.",
    icon: Camera,
    category: "Technology",
    depth: "0-11000m",
    color: "bg-green-500",
  },
]

export function ResearchHighlights() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-balance mb-2">Research Highlights</h2>
        <p className="text-muted-foreground text-balance">Explore cutting-edge research topics in deep sea science</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {researchTopics.map((topic) => {
          const IconComponent = topic.icon
          return (
            <Card
              key={topic.id}
              className="group hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm border-border/50 hover:border-accent/50 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-2 rounded-lg ${topic.color} text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {topic.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-accent transition-colors duration-300">
                  {topic.title}
                </CardTitle>
                <CardDescription className="text-sm">{topic.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    Depth: {topic.depth}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Ask AI about this topic →</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Start Your Deep Sea Journey</h3>
          <p className="text-muted-foreground mb-4">
            Use the voice interface above to ask questions about any of these research areas. Our AI expert will provide
            detailed explanations and answer your curiosities about the deep ocean.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">Marine Biology</Badge>
            <Badge variant="outline">Ocean Exploration</Badge>
            <Badge variant="outline">Underwater Ecosystems</Badge>
            <Badge variant="outline">Deep Sea Technology</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
