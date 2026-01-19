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
  // Wifi,
  // Car,
  // CreditCard,
  Calendar,
  Heart,
  Share2,
  Mail,
  // Globe,
  CheckCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
// import { CalendarIcon } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"
import type { Salon, SalonService, salonStaffDTOS } from "../../Interfaces/SaloInterface"
import { Loader } from "../../components/ui_components/Loader"
import { BookingLoader } from "../../components/ui_components/BookingLoader"

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import NoServicesAvailable from "../../components/NoServicesAvailable"





export default function SalonDetailPage() {
  const [isFavorite, setIsFavorite] = useState(false)
  const [salon, setsalon] = useState<Salon | null>(null);
  const params = useParams<{ id: string }>();
  const { apiRequest } = useApi();
  const navigate = useNavigate();
  const [FetchSalonByIdAPI, setFetchSalonByIdAPI] = useState(true);


  const handleViewService = (serviceId?: number) => {
    if (serviceId == null) return;
    navigate(`/salon/${salon?.id}/service/${serviceId}`);
  };

  const FetchSalonById = async () => {
    setFetchSalonByIdAPI(true)
    try {
      console.log("id =", params.id);

      let res = await apiRequest<Salon>(`/salon/${params.id}`);

      if (res.error) {
        console.log("error", res.error);
      }

      else {
        setsalon(res.data);
      }

    } catch (error) {
      console.error("error =", error)
    }
    finally {
      setFetchSalonByIdAPI(false)
    }
  }

  useEffect(() => {
    FetchSalonById();
  }, [])





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

      <Loader isVisible={FetchSalonByIdAPI} />

      {/* Header */}
      {!FetchSalonByIdAPI &&


        <>
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
                {/* <img src={"/placeholder.svg"} alt={salon?.salonName} className="w-full h-[500px]" /> */}
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
                        src={salon?.logoUrl || "/placeholder.svg"}
                        alt={`${salon.salonName} logo`}
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
                {salon?.salonServices?.length > 0
                  ? (<Tabs defaultValue="services" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="services">Services</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      <TabsTrigger value="photos">Photos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="services" className="space-y-6">
                      {salon?.salonServices?.map((category: SalonService, index: number) => (
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
                        {salon?.salonStaffDTOS && salon?.salonStaffDTOS.map((member: salonStaffDTOS, index: number) => (
                          <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <img
                                  src={member.staffimage || "/placeholder.svg"}
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
                                        {/* <span className="text-sm font-medium">{member.rating}</span> */}
                                      </div>
                                      <p className="text-xs text-muted-foreground">{member?.staffexperience}</p>
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
                        {/* {salon.reviewsList && salon.reviewsList?.map((review, index) => (
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
                                    className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
                  ))} */}
                      </div>
                    </TabsContent>

                    <TabsContent value="photos" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* {salon?.images && salon.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${salon.name} photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))} */}
                      </div>
                    </TabsContent>
                  </Tabs>)
                  : (<NoServicesAvailable />)
                }


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
                          <p className="text-sm"> {salon.street}, {salon.city}, {salon.state}, {salon.pincode}</p>
                          {/* <p className="text-xs text-muted-foreground">{salon.distance} </p> */}
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
                      {/* {salon.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={`https://${salon.website}`} className="text-sm text-accent-foreground hover:underline">
                        {salon.website}
                      </a>
                    </div>
                  )} */}
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
                      {/* {salon?.hours && salon.hours.map((schedule, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className={schedule.day === "Sunday" ? "text-accent-foreground font-medium" : ""}>
                        {schedule.day}
                      </span>
                      <span className="text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))} */}
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
                      {/* {salon?.amenitiesKeys && salon.amenitiesKeys.map((key, index) => (
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
                  ))} */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

                 </>

      }
    </div>
  )
}
