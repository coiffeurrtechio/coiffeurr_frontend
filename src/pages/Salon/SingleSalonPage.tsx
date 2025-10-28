import { Button } from "../../components/ui_components/button"
import { Card, CardContent } from "../../components/ui_components/card"
import { Badge } from "../../components/ui_components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui_components/tabs"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Star,
  Wifi,
  Car,
  CreditCard,
  Calendar,
  Heart,
  Share2,
  Mail,
  Globe,
  CheckCircle,
  Scissors,
  Sparkles,
} from "lucide-react"
import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"
import { useSelector } from "react-redux";



interface SalonService {
  serviceName: string;
  price?: number;
}
interface Salon {
  id: number;
  salonName: string;
  ownerName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: number;
  country: string;
  openingTime: string;
  closingTime: string;
  rating: number;
  reviews: number;
  latitude: string;
  longitude: string;
  salonType: string;
  logoUrl: string;
  image: string;
  priceRange: string;
  salonServices?: SalonService[];
}


export default function SalonDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [salon, setsalon] = useState<Salon>();
  const id = useParams<{ id: int }>();
  const {apiRequest} = useApi();
  const navigate = useNavigate();


  const handleViewService = (serviceId: string) => {
    navigate(`/salon/${salon?.id}/service/${serviceId}`);
  };

  const FetchSalonById = async() =>{
    console.log("id =",id);
    
    let res = await apiRequest<[]>(`/salon/${id.id}`);

      if(res.error){
        console.log("error",res.error);  
      }

      else{
        setsalon(res.data);
      }
  }
  
  useEffect(() => {
    FetchSalonById();
  },[])

  const baseHours = [
  { day: "Monday", hours: "9:00 AM - 8:00 PM" },
  { day: "Tuesday", hours: "9:00 AM - 8:00 PM" },
  { day: "Wednesday", hours: "9:00 AM - 8:00 PM" },
  { day: "Thursday", hours: "9:00 AM - 8:00 PM" },
  { day: "Friday", hours: "9:00 AM - 8:00 PM" },
  { day: "Saturday", hours: "8:00 AM - 7:00 PM" },
  { day: "Sunday", hours: "10:00 AM - 6:00 PM" },
]

const baseServices= [
  {
    category: "Hair Services",
    items: [
      { name: "Haircut & Style", price: "$65", duration: "60 min", description: "Professional cut with styling" },
      {
        name: "Hair Coloring",
        price: "$120",
        duration: "120 min",
        description: "Full color service with consultation",
      },
      { name: "Highlights", price: "$150", duration: "150 min", description: "Partial or full highlights" },
      { name: "Balayage", price: "$180", duration: "180 min", description: "Hand-painted highlights technique" },
      { name: "Hair Treatment", price: "$85", duration: "45 min", description: "Deep conditioning treatment" },
    ],
  },
  {
    category: "Nail Services",
    items: [
      { name: "Classic Manicure", price: "$35", duration: "30 min", description: "Basic nail care and polish" },
      { name: "Gel Manicure", price: "$45", duration: "45 min", description: "Long-lasting gel polish" },
      { name: "Classic Pedicure", price: "$45", duration: "45 min", description: "Foot care and polish" },
      { name: "Spa Pedicure", price: "$65", duration: "60 min", description: "Luxury foot treatment with massage" },
    ],
  },
  {
    category: "Facial Services",
    items: [
      { name: "Classic Facial", price: "$75", duration: "60 min", description: "Deep cleansing facial" },
      { name: "Anti-Aging Facial", price: "$95", duration: "75 min", description: "Rejuvenating treatment" },
      { name: "Hydrating Facial", price: "$85", duration: "60 min", description: "Moisture-boosting treatment" },
    ],
  },
]


const baseReviews = [
  {
    name: "Sarah Johnson",
    rating: 5,
    date: "2 days ago",
    comment:
      "Amazing experience! The team did an incredible job with my balayage. Beautiful space and professional staff.",
    service: "Balayage",
  },
  {
    name: "Michael Chen",
    rating: 5,
    date: "1 week ago",
    comment: "Great haircut and styling. Relaxing atmosphere and good value for the quality.",
    service: "Haircut & Style",
  },
  {
    name: "Emily Davis",
    rating: 4,
    date: "2 weeks ago",
    comment: "Love coming here for my monthly manicure. The gel lasts for weeks!",
    service: "Gel Manicure",
  },
]



  // const salon = {
  //   id: "1",
  //   name: "Coiffure Downtown",
  //   type: "Unisex",
  //   rating: 4.9,
  //   reviews: 324,
  //   address: "123 Main Street, Downtown",
  //   phone: "(555) 123-4567",
  //   email: "info@coiffuredowntown.com",
  //   website: "www.coiffuredowntown.com",
  //   openTime: "9:00 AM",
  //   closeTime: "8:00 PM",
  //   image: "/luxury-salon-interior-with-modern-styling-chairs.jpg",
  //   images: [
  //     "/luxury-salon-interior-with-modern-styling-chairs.jpg",
  //     "/salon-login-bg.jpg",
  //     "/professional-female-hairstylist.jpg",
  //     "/professional-esthetician.jpg",
  //   ],
  //   logo: "/salon-logo.png",
  //   servicesShort: ["Haircut", "Coloring", "Styling", "Manicure", "Pedicure", "Facial"],
  //   amenitiesKeys: ["wifi", "parking", "card", "online"],
  //   description: "Premium salon experience in the heart of downtown with expert stylists and luxury treatments.",
  //   priceRange: "$50-$200",
  //   distance: "0.5 miles",
  //   services: baseServices,
  //   staff: [
  //     {
  //       name: "Sofia Martinez",
  //       role: "Senior Hair Stylist",
  //       experience: "8 years",
  //       specialties: ["Hair Coloring", "Balayage", "Styling"],
  //       image: "/professional-female-hairstylist.jpg",
  //       rating: 4.9,
  //     },
  //     {
  //       name: "Emma Chen",
  //       role: "Nail Technician",
  //       experience: "6 years",
  //       specialties: ["Gel Manicure", "Nail Art", "Spa Pedicure"],
  //       image: "/placeholder-dh3pw.png",
  //       rating: 4.8,
  //     },
  //     {
  //       name: "Isabella Rodriguez",
  //       role: "Esthetician",
  //       experience: "10 years",
  //       specialties: ["Anti-Aging", "Acne Treatment", "Hydrating Facials"],
  //       image: "/professional-esthetician.jpg",
  //       rating: 4.9,
  //     },
  //   ],
  //   hours: baseHours,
  //   reviewsList: baseReviews,
  // }



  const allServices =
    salon?.services?.flatMap((category) => category.items.map((item) => ({ ...item, category: category.category }))) ??
    []
  const featuredArtist = salon?.staff?.[0]

  if (!salon) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link to="/salons" className="text-sm hover:underline">
              ← Back to Salons
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Salon not found</h1>
          <p className="text-muted-foreground">Please select a salon from the list.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/salons"
                className="flex items-center gap-2 text-sm font-medium hover:text-accent-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Salons
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="">
          <div className="w-full">
            <img src={ "/placeholder.svg"} alt={salon.name} className="w-full h-[500px]" />
          </div>
          
        </div>
      </section>


      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={salon.logo || "/placeholder.svg"}
                    alt={`${salon.name} logo`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{salon.salonName}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{salon.salonType}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{salon.rating}</span>
                        <span>({salon.reviews} reviews)</span>
                      </div>
                      <span>{salon.priceRange}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{salon.description}</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-6">
                {salon?.salonServices?.map((category, index) => (
                  <div key={index}>
                    {/* <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"> */}
                      {/* {category.serviceName === "Hair Services" && <Scissors className="h-5 w-5" />}
                      {category.serviceName === "Nail Services" && <Sparkles className="h-5 w-5" />}
                      {category.serviceName === "Facial Services" && <Star className="h-5 w-5" />}
                      {category.serviceName} */}
                    {/* </h3> */}
                    <div className="grid gap-4">
                        <Card className="border-0 bg-card/50 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{category.serviceName}</h4>
                                  <div className="text-right">
                                    <div className="font-semibold text-accent-foreground">{category.price}</div>
                                    <div className="text-xs text-muted-foreground">{category.duration}</div>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{category.description}</p>
                              </div>
                              <Button size="sm" className="ml-4" 
                              onClick={() => handleViewService(category?.serviceID)}
                              >
                                Book Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                    
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="staff" className="space-y-4">
                <div className="grid gap-6">
                  {salon?.salonStaffDTOS && salon?.salonStaffDTOS.map((member, index) => (
                    <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={member.image || "/placeholder.svg"}
                            alt={member.staffname}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>

                                <p className="text-md">{member.staffname}</p>
                                <p className="text-sm text-muted-foreground">{member.description}</p>
                                <p className="text-sm text-muted-foreground">{member.staffexperience} years</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-medium">{member.rating}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{member.experience}</p>
                              </div>
                            </div>
                            {/* <div className="flex flex-wrap gap-1">
                              {member.specialties.map((specialty, specIndex) => (
                                <Badge key={specIndex} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div> */}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="grid gap-4">
                  {salon.reviewsList && salon.reviewsList?.map((review, index) => (
                    <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{review.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>•</span>
                              <span>{review.date}</span>
                              <span>•</span>
                              <span>{review.service}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {salon?.images && salon.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${salon.name} photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button className="w-full" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <a href={`tel:${salon?.phone}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm">{salon.address}</p>
                      <p className="text-xs text-muted-foreground">{salon.distance} away</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{salon.phone}</p>
                  </div>
                  {salon.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{salon.email}</p>
                    </div>
                  )}
                  {salon.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={`https://${salon.website}`} className="text-sm text-accent-foreground hover:underline">
                        {salon.website}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Opening Hours
                </h3>
                <div className="space-y-2">
                  {salon?.hours && salon.hours.map((schedule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className={schedule.day === "Sunday" ? "text-accent-foreground font-medium" : ""}>
                        {schedule.day}
                      </span>
                      <span className="text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Open Now</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {salon?.amenitiesKeys && salon.amenitiesKeys.map((key, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {key === "wifi" && <Wifi className="h-4 w-4" />}
                      {key === "parking" && <Car className="h-4 w-4" />}
                      {key === "card" && <CreditCard className="h-4 w-4" />}
                      {key === "online" && <CalendarIcon className="h-4 w-4" />}
                      <span>
                        {key === "wifi" && "Free WiFi"}
                        {key === "parking" && "Free Parking"}
                        {key === "card" && "Card Payment"}
                        {key === "online" && "Online Booking"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button className="flex-1">
            <Calendar className="mr-2 h-4 w-4" />
            Book
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <a href={`tel:${salon.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
