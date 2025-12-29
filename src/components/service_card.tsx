import type React from "react"
import { Card, CardContent } from "../components/ui_components/card"
import { Button } from "../components/ui_components/button"

interface ServiceCardProps {
  title: string
  description: string
  price: string
  duration: string
  icon: React.ReactNode
}

export function ServiceCard({ title, description, price, duration, icon }: ServiceCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-2 md:p-6">
        {/* Mobile: vertical | Desktop: horizontal */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors mx-auto md:mx-0">
            {icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h3 className="font-semibold text-lg mb-2 text-balance">{title}</h3>
            <p className="text-muted-foreground text-sm mb-4 text-pretty">{description}</p>

            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{price}</span> • {duration}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="hover:bg-accent hover:text-accent-foreground bg-transparent w-full md:w-auto"
              >
                Book Now
              </Button>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}
