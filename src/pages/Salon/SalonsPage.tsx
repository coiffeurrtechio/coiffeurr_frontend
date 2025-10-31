import { Button } from "../../components/ui_components/button";
import { Card, CardContent } from "../../components/ui_components/card";
import { Badge } from "../../components/ui_components/badge";
import { MapPin, Clock, Phone, Star, Users, ArrowRight, Filter, Search } from "lucide-react";
import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import type { Salon } from "../../Interfaces/SaloInterface";

// ------------------ INTERFACES ------------------



// ------------------ COMPONENT ------------------

export default function SalonsPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);


  const { apiRequest } = useApi();

  // ------------------ FETCH FUNCTION ------------------

  const FetchAllSalons = async () => {
    try {
      const res = await apiRequest<Salon[]>("/salon");

      console.log("res =", res);

      if (res.error) {
        console.error("API Error:", res.error);
        setError("Failed to fetch salons");
      } else if (res.data) {
        setSalons(res.data);
      }
    } catch (err) {
      console.error("Unexpected error fetching salons:", err);
      setError("Something went wrong while fetching salons");
    }
  };

  useEffect(() => {
    console.log("Fetching salons...");
    FetchAllSalons();
  }, []);

  // ------------------ FILTER LOGIC ------------------

  const salonTypes = ["all", "Unisex", "Women Only", "Men Only"];

  const filteredSalons = salons.filter((salon) => {
    const matchesSearch =
      salon.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.street.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "all" || salon.salonType === selectedType;

    return matchesSearch && matchesType;
  });

  // ------------------ UTIL ------------------

  function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }

  // ------------------ JSX ------------------

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">
              Find Your Perfect Salon
              {error && <div className="text-red-300">error</div>}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover premium salons near you with expert stylists and luxury treatments
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search salons by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  {salonTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Types" : type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              Found {filteredSalons.length} salon{filteredSalons.length !== 1 ? "s" : ""} near you
            </div>
          </div>
        </div>
      </section>

      {/* Salons Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <Card
                key={salon.id}
                className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={salon.image || "/placeholder.svg"}
                    alt={salon.salonName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {salon.salonType}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{salon.rating}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={salon.logoUrl || "/placeholder.svg"}
                        alt={`${salon.salonName} logo`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{salon.salonName}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{salon.rating}</span>
                          <span>({salon.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                    {salon?.description &&
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    salon?.description 
                  </p>
                     }

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {salon.street}, {salon.city}, {salon.state}, {salon.pincode}
                      </span>
                      
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatTime(salon.openingTime)} - {formatTime(salon.closingTime)}
                      </span>
                      <span className="text-xs text-green-600">• Open Now</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{salon.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {salon.salonServices?.slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service.serviceName}
                      </Badge>
                    ))}
                    {(salon.salonServices?.length ?? 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(salon.salonServices?.length ?? 0) - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {salon.priceRange && <div className="text-sm">
                      <span className="text-muted-foreground">Price range: </span>
                      <span className="font-medium">{salon.priceRange}</span>
                    </div>}
                    <Link to={`/salons/${salon.id}`}>
                      <Button size="sm" className="group">
                        View Details
                        <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSalons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No salons found matching your criteria</p>
                <p className="text-sm">Try adjusting your search or filter options</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
