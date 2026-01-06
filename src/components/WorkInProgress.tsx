// WorkInProgress

import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function WorkInProgress() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Animated Construction Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-accent animate-spin" />

            {/* Inner pulsing circle */}
            <div className="absolute inset-2 rounded-full bg-accent/10 animate-pulse" />

            {/* Center icon */}
            <div
              className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce"
              style={{ animationDuration: "2s" }}
            >
              🏗️
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Work in Progress</h1>

          <p className="text-lg text-muted-foreground">
            We're building something amazing for you. This feature is currently under development.
          </p>

          {/* Feature highlights */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Coming soon with enhanced features</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.2s" }} />
              <span>Better experience awaits</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
              <span>Thank you for your patience</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <Link
            to="/salons"
            className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium text-center hover:opacity-90 transition-opacity"
          >
            Explore Salons
          </Link>
        </div>

        {/* Footer message */}
        <p className="text-center text-xs text-muted-foreground mt-6">We're continuously improving your experience</p>
      </div>
    </div>
  )
}
