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
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 text-balance">{title}</h3>
            <p className="text-muted-foreground text-sm mb-4 text-pretty">{description}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{price}</span> • {duration}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-accent hover:text-accent-foreground bg-transparent"
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
