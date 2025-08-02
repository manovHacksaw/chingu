import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Mail, BarChart3, Bell, Brain, ArrowRight, Play, Star, Github, Twitter, Heart } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-orange-200 to-pink-200 text-orange-800 border-0 rounded-full px-4 py-2">
                ✨ Your AI Finance Buddy
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Meet Chingu — your friendly{" "}
                <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  AI-powered
                </span>{" "}
                finance buddy
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Track expenses, scan bills, get notified — all with a little help from your cute smart assistant.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Chingu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-semibold border-2 border-orange-200 hover:bg-orange-50 bg-transparent"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img
                src="/placeholder.svg?height=600&width=400"
                alt="Chingu mascot with mobile app"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">What can Chingu do for you?</h2>
          <p className="text-xl text-gray-600">Your personal finance assistant with superpowers</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Camera,
              title: "Smart Receipt Scanner",
              description: "Snap and auto-track expenses with OCR & AI.",
              gradient: "from-blue-300 to-cyan-300",
            },
            {
              icon: Mail,
              title: "Email Bill Detection",
              description: "Chingu checks your inbox for bills and updates your expenses.",
              gradient: "from-green-300 to-emerald-300",
            },
            {
              icon: BarChart3,
              title: "Monthly Reports",
              description: "Get clean, shareable visuals of your spending habits.",
              gradient: "from-purple-300 to-pink-300",
            },
            {
              icon: Bell,
              title: "Reminders & Nudges",
              description: "Never miss a bill — Chingu reminds you gently.",
              gradient: "from-orange-300 to-red-300",
            },
            {
              icon: Brain,
              title: "AI Suggestions",
              description: "Save better with smart, personalized insights.",
              gradient: "from-indigo-300 to-purple-300",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-orange-100 to-pink-100 border-0">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">See Chingu in Action</h3>
              <p className="text-gray-600 mb-8">Watch how easy it is: Snap. Track. Done.</p>
              <div className="relative">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Chingu demo video"
                  className="w-full rounded-2xl shadow-lg"
                />
                <Button
                  size="lg"
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white/90 hover:bg-white text-orange-500 hover:text-orange-600 shadow-lg"
                >
                  <Play className="h-8 w-8 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to financial clarity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Upload & Scan",
              description: "Upload a bill or let Chingu scan your email 📩",
              image: "receipt scanning interface with cute mascot",
            },
            {
              step: "2",
              title: "AI Magic",
              description: "AI detects amount, category & saves it 💡",
              image: "AI processing animation with data extraction",
            },
            {
              step: "3",
              title: "Track & Save",
              description: "Chingu reminds, visualizes, and helps you save 📈",
              image: "dashboard with `charts` and savings recommendations",
            },
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-8">
                <img
                  src={`/placeholder.svg?height=300&width=300&query=${step.image}`}
                  alt={step.title}
                  className="w-full max-w-xs mx-auto rounded-2xl shadow-lg"
                />
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Loved by mindful spenders and budget beginners
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Chen",
              role: "Freelance Designer",
              quote: "I don't hate budgeting anymore — Chingu makes it cute!",
              avatar: "happy young woman with design tools",
            },
            {
              name: "Mike Rodriguez",
              role: "Software Developer",
              quote: "Best app for freelancers to track daily expenses with zero effort.",
              avatar: "smiling man with laptop",
            },
            {
              name: "Emma Thompson",
              role: "College Student",
              quote: "Finally, a finance app that doesn't make me feel overwhelmed!",
              avatar: "cheerful college student with books",
            },
          ].map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={`/placeholder.svg?height=50&width=50&query=${testimonial.avatar}`}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-100 to-blue-100 border-0">
            <CardContent className="p-12">
              <div className="mb-8">
                <img
                  src="/placeholder.svg?height=100&width=100"
                  alt="Celebrating Chingu"
                  className="w-24 h-24 mx-auto mb-6"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Chingu is free to use. Forever.</h2>
              <p className="text-xl text-gray-600 mb-8">Start tracking your expenses today with your new AI buddy!</p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
                <Heart className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-500 mt-4">Premium features coming soon — join the waitlist!</p>
            </CardContent>
          </Card>
        </div>
      </section>

      
    </div>
  )
}
