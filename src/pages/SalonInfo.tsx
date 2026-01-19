import { Button } from "../components/ui_components/button"
import { Card, CardContent } from "../components/ui_components/card"
import { ServiceCard } from "../components/service_card"
import {
    Scissors,
    Sparkles,
    Heart,
    Star,
    MapPin,
    Phone,
    ChevronRight,
    Users,
    Award,
    Calendar,
    ScissorsLineDashed,
    User,
    Search,
    Filter,
    Badge,
    Clock,
    ArrowRight,
} from "lucide-react"
import { useState } from "react";


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Salon } from "../Interfaces/SaloInterface";
import { useEffect } from "react";
import { Header } from "../components/Header";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import { Loader } from "../components/ui_components/Loader";
import { Link } from "react-router-dom";


export default function SalonInfo() {
    const [active, setActive] = useState("salon");
const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  // const [error, setError] = useState<string | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [fetchSalonAPI, setfetchSalonAPI] = useState(true);


  const { apiRequest } = useApi();

  // ------------------ FETCH FUNCTION ------------------

  const FetchAllSalons = async () => {
    // setfetchSalonAPI(true);
    try {
      const res = await apiRequest<Salon[]>("/salon");

      console.log("res =", res);

      if (res.error) {
        console.error("API Error:", res.error);
        // setError("Failed to fetch salons");
      } else if (res.data) {
        setSalons(res.data);
      }
    } catch (err) {
      console.error("Unexpected error fetching salons:", err);
      // setError("Something went wrong while fetching salons");
    }
    finally {
      setfetchSalonAPI(false);
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

    const services = [
        {
            title: "Premium Haircut & Styling",
            description: "Expert cuts and styling for all hair types with premium products",
            price: "$85",
            duration: "60 min",
            icon: <Scissors className="w-6 h-6 text-accent-foreground" />,
        },
        {
            title: "Luxury Manicure",
            description: "Complete nail care with gel polish and cuticle treatment",
            price: "$45",
            duration: "45 min",
            icon: <Sparkles className="w-6 h-6 text-accent-foreground" />,
        },
        {
            title: "Signature Pedicure",
            description: "Relaxing foot treatment with massage and premium polish",
            price: "$55",
            duration: "60 min",
            icon: <Heart className="w-6 h-6 text-accent-foreground" />,
        },
        {
            title: "Rejuvenating Facial",
            description: "Deep cleansing facial with personalized skincare treatment",
            price: "$95",
            duration: "75 min",
            icon: <Star className="w-6 h-6 text-accent-foreground" />,
        },
        {
            title: "Hair Coloring",
            description: "Professional color services from highlights to full color",
            price: "$120",
            duration: "120 min",
            icon: <Sparkles className="w-6 h-6 text-accent-foreground" />,
        },
        {
            title: "Bridal Package",
            description: "Complete bridal beauty package for your special day",
            price: "$250",
            duration: "180 min",
            icon: <Heart className="w-6 h-6 text-accent-foreground" />,
        },
    ]

    const artists = [
        {
            name: "Sofia Martinez",
            specialty: "Hair Styling & Color",
            experience: "8 years",
            image: "/professional-female-hairstylist.jpg",
        },
        {
            name: "Emma Chen",
            specialty: "Nail Art & Manicure",
            experience: "6 years",
            image: "/facial_service.jpg",
        },
        {
            name: "Isabella Rodriguez",
            specialty: "Skincare & Facials",
            experience: "10 years",
            image: "/professional-esthetician.jpg",
        },
    ]

    return (

        <>



            <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
                {artists.map((artist, index) => (
                    <Card
                        key={index}
                        className="min-w-[70%] sm:min-w-[50%] md:min-w-[33%] border-0 bg-card/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                        <div className="aspect-square overflow-hidden">
                            <img
                                fetchPriority="high"
                                src={artist.image || "/placeholder.svg"}
                                alt={artist.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        <CardContent className="p-6 text-center">
                            <h3 className="font-semibold text-lg mb-2">{artist.name}</h3>
                            <p className="text-muted-foreground text-sm mb-1">{artist.specialty}</p>
                            <p className="text-xs text-muted-foreground">{artist.experience} experience</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <Loader isVisible={fetchSalonAPI} />


              




                {/* Salons Grid */}
                <section className="py-4">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredSalons.map((salon) => (
                                <Card
                                    key={salon.id}
                                    className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="relative aspect-video overflow-hidden">
                                        <Swiper
                                            // key={salon.id}              // 🔥 THIS FIXES IT
                                            modules={[Pagination, Autoplay]}
                                            navigation
                                            pagination={{ clickable: true }}
                                            autoplay={{ delay: 3000, disableOnInteraction: false }}
                                            loop={salon?.images?.length > 1}
                                        >
                                            {(salon?.images?.length > 0
                                                ? salon.images
                                                : ["/placeholder.svg"]
                                            ).map((img, index) => (
                                                <SwiperSlide key={index}>
                                                    <img
                                                        src={img}
                                                        alt={salon.salonName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>


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

                                    <CardContent className="py-2 px-4">
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

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden" >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
                            Transform your beauty with expert care
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                            Experience premium salon services with our skilled artists. From haircuts to facials, we bring luxury
                            beauty treatments right to your doorstep.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="text-lg px-8">
                                Book Now
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                                View Services
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="mt-16 relative">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                fetchPriority="high"
                                src="/luxury-salon-interior-with-modern-styling-chairs.jpg"
                                alt="Luxury salon interior"
                                className="w-full h-[400px] lg:h-[600px] object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    </div>
                </div>
            </section >

            {/* Stats Section */}
            <section className="py-16 bg-secondary/30" >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4">
                                <Users className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div className="text-3xl font-bold mb-2">10K+</div>
                            <div className="text-sm text-muted-foreground">Happy Clients</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4">
                                <Award className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div className="text-3xl font-bold mb-2">50+</div>
                            <div className="text-sm text-muted-foreground">Expert Artists</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4">
                                <MapPin className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div className="text-3xl font-bold mb-2">25+</div>
                            <div className="text-sm text-muted-foreground">Locations</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-4">
                                <Star className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div className="text-3xl font-bold mb-2">4.9</div>
                            <div className="text-sm text-muted-foreground">Rating</div>
                        </div>
                    </div>
                </div>
            </section >

            {/* CTA Section */}
            <section className="py-20" >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border-0 bg-primary text-primary-foreground overflow-hidden">
                        <CardContent className="p-12 text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Ready to transform your look?</h2>
                            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto text-pretty">
                                Book your appointment today and experience the luxury of professional beauty services
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" variant="secondary" className="text-lg px-8">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Book Appointment
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                                >
                                    <Phone className="mr-2 h-5 w-5" />
                                    Call Us
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section >

        </>
    )
}
