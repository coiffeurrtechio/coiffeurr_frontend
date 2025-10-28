import { useEffect, useState } from "react"
import {
  Camera,
  Edit3,
  Calendar,
  Heart,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  Gift,
  Settings,
  LogOut,
} from "lucide-react"
import { Button } from "../components/ui_components/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui_components/card"
import { Badge } from "../components/ui_components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui_components/avatar"
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/Storage/slice/authSlice"
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI"


export default function Profile() {
  const [activeTab, setActiveTab] = useState("overview")
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ hook for navigation
  const { apiRequest } = useApi()
  const [bookingdata, setbookingdata] = useState([])

  const userDetails = useSelector((state: any) => state.auth.user);

  console.log("userdetails =", userDetails);

  // Dummy user data
  const user = {
    name: userDetails.username,
    email: userDetails.email,
    phone: userDetails.phone,
    userType: userDetails.role,
    joinDate: "March 2023",
    profileImage: "/professional-woman-smiling.png",
    location: "New York, NY",
    loyaltyPoints: 1250,
    totalBookings: 24,
    favoriteServices: ["Hair Cut & Style", "Facial Treatment", "Manicure"],
    preferredArtist: "Emma Rodriguez",
  }


  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };


  const recentBookings = [
    {
      id: 1,
      service: "Hair Cut & Style",
      artist: "Emma Rodriguez",
      date: "Dec 15, 2024",
      time: "2:00 PM",
      status: "Completed",
      rating: 5,
      price: "$85",
    },
    {
      id: 2,
      service: "Facial Treatment",
      artist: "Maria Santos",
      date: "Nov 28, 2024",
      time: "11:00 AM",
      status: "Completed",
      rating: 5,
      price: "$120",
    },
    {
      id: 3,
      service: "Manicure & Pedicure",
      artist: "Lisa Chen",
      date: "Nov 10, 2024",
      time: "3:30 PM",
      status: "Completed",
      rating: 4,
      price: "$65",
    },
  ]

  const upcomingBookings = [
    {
      id: 4,
      service: "Hair Color & Highlights",
      artist: "Emma Rodriguez",
      date: "Jan 5, 2025",
      time: "1:00 PM",
      status: "Confirmed",
      price: "$180",
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "rewards", label: "Rewards", icon: Gift },
  ]

  useEffect(() =>{
    fetchappointmentbookings();
  },[])

  const fetchappointmentbookings = async () => {
    try {
      const res = await apiRequest("/salon/appointments");
      if (res.error) {
        console.error("API Error:", res.error);
        // setError("Failed to fetch salons");
      } else if (res.data) {
        setbookingdata(res?.data);
        console.log("response =", res);

      }

    } catch (error) {
      console.error("err = ", error)
    }
  }

  function extractDateAndTime(isoString) {
  const dateObj = new Date(isoString);

  // Extract date parts
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  // Extract time parts
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  // Return formatted date and time
  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes}:${seconds}`
  };
}


  return (
    <div className="min-h-screen bg-background">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-accent/20">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
                        {user.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="icon" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
                  <Badge variant="secondary" className="mt-2">
                    {user.userType}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Member since {user.joinDate}</p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                </div>

                <Button className="w-full mt-6">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className=" w-full mt-6" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <Button className=" w-full mt-6" onClick={() => navigate("/salonRegistration")}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Create a Salon
                </Button>
                {userDetails.role === "salon_owner" && <Button className=" w-full mt-6" onClick={() => navigate("/dashboard")}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent-foreground">{user.totalBookings}</div>
                  <div className="text-sm text-muted-foreground">Total Visits</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent-foreground">{user.loyaltyPoints}</div>
                  <div className="text-sm text-muted-foreground">Reward Points</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={activeTab === tab.id ? "" : "hover:bg-accent"}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="bg-card border-border shadow-lg">
                  <CardHeader>
                    <CardTitle>Account Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Preferred Artist</h4>
                        <p className="text-muted-foreground">{user.preferredArtist}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Favorite Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.favoriteServices.map((service, index) => (
                            <Badge key={index} variant="outline">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Appointments */}
                {upcomingBookings.length > 0 && (
                  <Card className="bg-card border-border shadow-lg">
                    <CardHeader>
                      <CardTitle>Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                          <div>
                            <h4 className="font-medium">{booking.service}</h4>
                            <p className="text-sm text-muted-foreground">with {booking.artist}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {booking.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.time}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">{booking.status}</Badge>
                            <p className="text-lg font-semibold mt-1">{booking.price}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookingdata.length >= 1 && bookingdata.map((booking, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{booking.serviceName}</h4>
                          {/* <p className="text-sm text-muted-foreground">with {booking.artist}</p> */}
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {extractDateAndTime(booking?.appointmentDate).date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {extractDateAndTime(booking?.appointmentDate).time}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < booking.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div> */}
                          <Badge variant="outline" className="mb-1">
                            {booking.status}
                          </Badge>
                          <p className="text-lg font-semibold">{booking.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "favorites" && (
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle>Favorite Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.favoriteServices.map((service, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{service}</h4>
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Frequently booked</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "rewards" && (
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle>Loyalty Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-accent-foreground mb-2">{user.loyaltyPoints}</div>
                    <p className="text-muted-foreground">Available Points</p>
                    <div className="w-full bg-accent/20 rounded-full h-2 mt-4">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">250 points until next reward</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium">Free Service (1500 points)</h4>
                      <p className="text-sm text-muted-foreground">Get any service up to $100 value</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium">20% Discount (800 points)</h4>
                      <p className="text-sm text-muted-foreground">Valid on any service</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <h4 className="font-medium">Priority Booking (500 points)</h4>
                      <p className="text-sm text-muted-foreground">Skip the waiting list for 30 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
