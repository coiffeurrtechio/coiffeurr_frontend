import { Scissors, CalendarX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui_components/button";

export default function NoServicesAvailable() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-md">
        
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <CalendarX className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-semibold mb-2">
          No Services Available
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6">
          This salon hasn’t added any services yet.  
          Please check back later or explore other salons near you.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link to="/salons">
            <Button variant="outline">
              Browse Salons
            </Button>
          </Link>

          <Link to="/">
            <Button>
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
