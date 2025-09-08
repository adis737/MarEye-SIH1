import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Github, ExternalLink } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Contact & Collaboration</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Join our research network or get in touch to learn more about our AI-driven deep sea biodiversity platform
            and conservation initiatives.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">First Name</label>
                  <Input placeholder="John" className="bg-input border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Last Name</label>
                  <Input placeholder="Doe" className="bg-input border-border" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Email</label>
                <Input type="email" placeholder="john.doe@university.edu" className="bg-input border-border" />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Institution/Organization</label>
                <Input placeholder="Marine Research Institute" className="bg-input border-border" />
              </div>

              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">Message</label>
                <Textarea
                  placeholder="Tell us about your research interests or collaboration ideas..."
                  className="bg-input border-border min-h-[120px]"
                />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Send Message</Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Research Center</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-card-foreground">
                      Centre for Marine Living Resources and Ecology
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ministry of Earth Sciences
                      <br />
                      Kochi, Kerala, India
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-card-foreground">research@cmlre.gov.in</div>
                    <div className="text-sm text-muted-foreground">General inquiries</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-card-foreground">+91-484-2390814</div>
                    <div className="text-sm text-muted-foreground">Research collaboration</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Research Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    Open Source Code Repository
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </Button>

                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Research Publications
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </Button>

                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="#" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    API Documentation
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">Join Our Research Network</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Collaborate with marine researchers worldwide and contribute to deep sea biodiversity conservation.
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply for Access</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
