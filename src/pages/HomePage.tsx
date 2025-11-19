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
} from "lucide-react"
import { useState } from "react";
import { Header } from "../components/Header";

export default function HomePage() {
  const [active, setActive] = useState("salon");

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
    <div className="min-h-screen bg-background">


      <Header/>
     <div className="w-full sticky bg-background top-0 z-50">
      {/* Tabs */}
      <div className="relative flex w-full justify-center border-b border-gray-300">
        <button
          onClick={() => setActive("salon")}
          className="relative w-1/2 py-3 text-center font-semibold flex justify-center items-center gap-2"
        >
          <ScissorsLineDashed />
          Salon
        </button>

        <button
          onClick={() => setActive("artist")}
          className="relative w-1/2 py-3 text-center font-semibold flex justify-center items-center gap-2"
        >
          <User />
          Artist
        </button>

        {/* SUPER SMOOTH SLIDING BAR */}
        <div
          className={`absolute bottom-0 h-1.5 bg-black rounded-full 
            transition-all duration-500 ease-[cubic-bezier(.25,.8,.25,1)]
          `}
          style={{
            width: "25%",           // matches w-1/4 width
            left: active === "salon" ? "12.5%" : "62.5%", // perfect smooth slide
          }}
        ></div>
      </div>

      {/* Animated Content */}
      <div className="p-4">
        <div
          key={active}
          className="p-4 bg-gray-100 rounded-lg shadow
          transition-all duration-500 ease-[cubic-bezier(.25,.8,.25,1)]
          opacity-100 translate-y-0 animate-fadeSlide"
        >
          {active === "salon" ? (
            <>
              <h2 className="text-xl font-bold mb-2">Salon UI</h2>
              <p>This is the Salon section content.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Artist UI</h2>
              <p>This is the Artist section content.</p>
            </>
          )}
        </div>
      </div>

      {/* Inline CSS for fade + slide animation */}
      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlide {
          animation: fadeSlide 0.5s ease-out;
        }
      `}</style>
    </div>


      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
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
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
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
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Our Premium Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover our comprehensive range of beauty services, delivered by expert professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">Meet Our Expert Artists</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Our talented team of beauty professionals is dedicated to making you look and feel your best
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {artists.map((artist, index) => (
              <Card
                key={index}
                className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-300"
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
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
      </section>

    </div>
  )
}
