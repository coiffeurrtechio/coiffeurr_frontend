
import { useEffect, useState } from "react"
import { Star, MapPin, Clock, Heart, Check, Calendar, Phone, X } from "lucide-react"
import { Button } from "../../components/ui_components/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui_components/card"
import { Badge } from "../../components/ui_components/badge"
import { useParams } from "react-router-dom"
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"
import type { salonSlots } from "../../Interfaces/SaloInterface"

const SalonService: React.FC = () => {
    const [isFavorite, setIsFavorite] = useState(false)
    const { apiRequest, apiCustomerpiPost } = useApi();
    const { id, serviceID } = useParams();
    const [salonservicedata, setsalonservicedata] = useState<any>({});
    const [salonserviceslotsdata, setsalonserviceslotsdata] = useState<salonSlots[]>([]);
    const uniqueSortedDates = [...new Set(salonserviceslotsdata.map((s: salonSlots) => s.date))].sort();
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedslottime, setselectedslottime] = useState<string>("");
    const [isEditModalOpen, setisEditModalOpen] = useState<boolean>(false);

    // const isoString = `${dateStr}T${timeStr}`;

    //   const localDateTime = new Date(isoString);


    useEffect(() => {
        fetchService();
        fetchServiceSlots();
    }, [])

    const serviceData = {
        id: 1,
        name: "Luxury Bridal Hair & Makeup",
        category: "Bridal Services",
        price: 350,
        duration: 180,
        rating: 4.9,
        reviews: 127,
        description:
            "Experience the ultimate bridal transformation with our signature luxury package. Our expert team specializes in creating stunning, long-lasting looks that will make you feel absolutely radiant on your special day.",
        fullDescription:
            "Our Luxury Bridal Hair & Makeup service is designed to make you feel like the most beautiful version of yourself on your wedding day. We offer personalized consultations to understand your vision, style preferences, and any special requirements. Our experienced artists use premium, professional-grade products and techniques to ensure your look is flawless and lasts throughout your entire celebration.",
        images: [
            "/bridal-makeup-and-hair-styling.jpg",
            "/bride-with-elegant-updo-hairstyle.jpg",
            "/bridal-makeup-with-flowers.jpg",
            "/wedding-day-hair-and-makeup.jpg",
        ],
        artist: [{
            id: 1,
            name: "Sarah Mitchell",
            title: "Senior Bridal Stylist",
            experience: 12,
            image: "/professional-makeup-artist.jpg",
            bio: "Award-winning bridal specialist with over 12 years of experience. Sarah has worked with hundreds of brides and is known for her attention to detail and ability to bring visions to life.",
            specialties: ["Bridal Hair", "Bridal Makeup", "Airbrush Makeup", "Hair Extensions"],
            rating: 4.95,
            reviews: 156,
        }],
        includes: [
            "Pre-wedding consultation",
            "Trial session (1 hour)",
            "Professional makeup application",
            "Hair styling and updo",
            "Touch-up kit included",
            "Professional photography-ready finish",
        ],
        location: "Luxury Salon & Spa, Downtown",
        availability: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 5:00 PM", "Sunday: By appointment"],
    }

    const fetchService = async () => {
        try {
            const res = await apiRequest(`/salonServices?salonid=${id}&serviceId=${serviceID}`);
            if (res.error) {
                console.error("API Error:", res.error);
                // setError("Failed to fetch salons");
            } else if (res.data) {
                setsalonservicedata(res?.data);
                console.log("response =", res);

            }

        } catch (error) {
            console.error("err = ", error)
        }
    }

    const fetchServiceSlots = async () => {
        try {
            const res = await apiRequest<salonSlots[]>(`/salonServices/slots?salonid=${id}&serviceId=${serviceID}`);
            if (res.error) {
                console.error("API Error:", res.error);
                // setError("Failed to fetch salons");
            } else if (res.data) {
                setsalonserviceslotsdata(res?.data);
                console.log("response =", res);

            }

        } catch (error) {
            console.error("err = ", error)
        }
    }

    function formatToShortMonthDay(dateString: string) {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }


    function formatTo12Hour(timeString: any) {
        // Split the "HH:MM:SS" string
        const [hourStr, minuteStr] = timeString.split(":");
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12;
        hour = hour === 0 ? 12 : hour; // Convert 0 → 12

        // Include minutes only if non-zero
        const formattedTime = minute === 0 ? `${hour} ${ampm}` : `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;

        return formattedTime;
    }


    const BookAppointment = async (e: any) => {
        e.preventDefault();
        try {
            console.log("selectedDate = ", selectedDate);
            console.log("selectedslottime = ", selectedslottime);

            const isoString = `${selectedDate}T${selectedslottime}`;

            const localDateTime = new Date(isoString);
            console.log("localDateTime=", localDateTime);


            const data = {
                bookedPrice: salonservicedata?.price,
                durationMinutes: salonservicedata?.slotTime,
                appointmentDateTime: localDateTime,
            }
            console.log("data = ", data);



            const res = await apiCustomerpiPost(`/salon/service/appointment?salonid=${id}&serviceId=${serviceID}`, data,)

            if (res.error) {
                console.error("Error while registering:", res.error);
            } else {
                console.log("Salon registered successfully:", res.data);
                setisEditModalOpen(false);
            }

        } catch (error) {

        }
    }


    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">Luxe Salon</div>
                    <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                        <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Gallery Section */}
                {/* <ServiceGallery images={serviceData.images} serviceName={serviceData.name} /> */}

                {/* Service Info and Booking */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    {/* Left Column - Service Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Service Header */}
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-accent uppercase tracking-wide">{serviceData.category}</p>
                                    <h1 className="text-4xl lg:text-5xl font-bold text-foreground mt-2 text-balance">
                                        {serviceData.name}
                                    </h1>
                                </div>
                            </div>

                            {/* Rating and Reviews */}
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-accent text-accent" aria-hidden="true" />
                                    ))}
                                </div>
                                <span className="text-lg font-semibold text-foreground">{serviceData.rating}</span>
                                <span className="text-muted-foreground">({serviceData.reviews} reviews)</span>
                            </div>

                            {/* Quick Info */}
                            <div className="flex flex-wrap gap-6 pt-4 text-sm">
                                <div className="flex items-center gap-2 text-foreground">
                                    <Clock className="w-5 h-5 text-accent" />
                                    <span>{serviceData.duration} minutes</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground">
                                    <MapPin className="w-5 h-5 text-accent" />
                                    <span>{serviceData.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            {salonservicedata?.descriptions && salonservicedata?.descriptions.map((items: any) => (
                                <p className="text-lg text-foreground leading-relaxed">{items}</p>

                            ))}
                        </div>







                        {/* What's Included */}
                        <Card className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-foreground">What's Included</h3>
                            <ul className="space-y-3">
                                {salonservicedata?.includedItems && salonservicedata?.includedItems.map((item: any, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Slots */}
                        <div className="space-y-4">
                            <div>
                                {/* {salonserviceslotsdata && salonserviceslotsdata.map((items) =>(
                                    <div>
                                        {items}
                                    </div>
                                ))} */}
                            </div>

                        </div>



                        {/* Artist Profile */}
                        {/* <ArtistProfile artist={serviceData.artist} /> */}
                        {serviceData.artist && serviceData.artist.map((artist) => (

                            <Card className="p-6 space-y-6">
                                <h3 className="text-2xl font-bold text-foreground">Meet Your Artist</h3>

                                <div className="flex flex-col sm:flex-row gap-6">
                                    {/* Artist Image */}
                                    <div className="flex-shrink-0">
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                            <img src={artist.image || "/placeholder.svg"} alt={artist.name} className="object-cover" />
                                        </div>
                                    </div>

                                    {/* Artist Info */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-foreground">{artist.name}</h4>
                                            <p className="text-accent font-semibold">{artist.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{artist.experience} years of experience</p>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-foreground">{artist.rating}</span>
                                            <span className="text-sm text-muted-foreground">({artist.reviews} reviews)</span>
                                        </div>

                                        {/* Bio */}
                                        <p className="text-sm text-foreground leading-relaxed">{artist.bio}</p>
                                    </div>
                                </div>

                                {/* Specialties */}
                                <div className="space-y-3">
                                    <h5 className="font-semibold text-foreground">Specialties</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {artist.specialties.map((specialty, index) => (
                                            <Badge key={index} variant="secondary" className="bg-secondary text-secondary-foreground">
                                                {specialty}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))
                        }

                        {/* Reviews Section */}
                        {/* <ReviewsSection rating={serviceData.rating} reviews={serviceData.reviews} /> */}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        {/* <BookingSection price={serviceData.price} duration={serviceData.duration} /> */}
                    </div>
                </div>
            </div>



            <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <Button className="flex-1" onClick={() => setisEditModalOpen(true)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book
                    </Button>

                    <Button asChild variant="outline" className="flex-1 bg-transparent">
                        <a>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                        </a>
                    </Button>
                </div>
            </div>






            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] bg-card border-border flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle>Select Slots</CardTitle>
                            <button
                                onClick={() => setisEditModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>

                        {/* Scrollable content */}
                        <CardContent className="overflow-y-auto pr-2">
                            {/* Slot Dates (Horizontal Scroll) */}
                            <div className="flex gap-3 overflow-x-auto p-2 scrollbar-hide snap-x snap-mandatory mb-4">
                                {uniqueSortedDates?.map((item, index) => (
                                    <p
                                        key={index}
                                        onClick={() => {
                                            setSelectedDate(item);
                                            setselectedslottime("");
                                        }}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full cursor-pointer whitespace-nowrap transition-all duration-200
                ${selectedDate === item
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {formatToShortMonthDay(item)}
                                    </p>
                                ))}
                            </div>

                            {/* Slots Grid */}
                            {selectedDate && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-2">
                                    {salonserviceslotsdata
                                        .filter((slot: salonSlots) => slot?.date === selectedDate)
                                        .map((slot: salonSlots, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => setselectedslottime(slot.time)}
                                                className={`p-3 rounded-lg text-sm font-medium transition-all border-2 
                    ${selectedslottime === slot.time
                                                        ? "border-accent bg-accent text-accent-foreground"
                                                        : "border-border bg-background text-foreground hover:border-accent/50 hover:bg-secondary/30"
                                                    }`}
                                            >
                                                <div className="font-semibold">{formatTo12Hour(slot.time)}</div>
                                            </button>
                                        ))}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setisEditModalOpen(false)}
                                    className="flex-1 bg-transparent"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" onClick={BookAppointment}>
                                    Book Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}


        </main>
    )
}
export default SalonService
