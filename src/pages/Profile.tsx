import { useEffect, useState } from "react"
import {
  Camera,
  Edit3,
  Calendar,
  Heart,
  MapPin,
  Phone,
  Mail,
  Clock,
  Gift,
  Settings,
  LogOut,
  MessageCircleQuestionMark,
  BookOpen,
  LayoutDashboard,
  ArrowLeft,
} from "lucide-react"
import { Button } from "../components/ui_components/button"
import { Badge } from "../components/ui_components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui_components/avatar"
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/Storage/slice/authSlice"
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI"
import type { BookingResponse } from "../Interfaces/BookingInterface"
import { logoutUser } from "../API/APIs"


export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ hook for navigation
  const { apiRequest } = useApi()
  const [bookingdata, setbookingdata] = useState<BookingResponse[]>([])

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
    loyaltyPoints: 1250,
    totalBookings: 24,
    favoriteServices: ["Hair Cut & Style", "Facial Treatment", "Manicure"],
    preferredArtist: "Emma Rodriguez",
  }


  const handleLogout = () => {
    // dispatch(logout());
    dispatch(logoutUser());
    navigate("/login");
  };




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
    // { id: "rewards", label: "Rewards", icon: Gift },
  ]



  function extractDateAndTime(isoString: string) {
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


  const your_information = [
    // {
    //   title: "Address Book",
    //   icon: BookOpen,
    //   onClick: () => { },
    // },
    userDetails.role !== "salon_owner" && {
      title: "create salon",
      icon: BookOpen,
      onClick: () => navigate("/salonRegistration"),
    },
    userDetails.role === "salon_owner" && {
      title: "Go to Dashboard",
      icon: LayoutDashboard,
      onClick: () => navigate("/dashboard"),
    },
  ].filter(Boolean);


  const other_information = [
    {
      tittle: "Logout",
      icon: LogOut,
      onclick: handleLogout,
    },
    // {
    //   tittle: "Address Book",
    //   icon: BookOpen,
    //   onclick: () => { },
    // },
  ]
  return (
    <div className="min-h-screen">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">

            <div className="relative text-center">

              {/* Back Button */}
              <button
                onClick={() => navigate("/")}
                className="absolute left-0 top-0 p-2 rounded-full 
             bg-muted/60 backdrop-blur-sm 
             hover:bg-muted transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>


              <div className="relative inline-block mt-4">
                <Avatar className="w-24 h-24 mx-auto border-4 border-accent/20">
                  <AvatarImage
                    src={user.profileImage || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xl font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <Badge variant="secondary" className="mt-2">
                {user.userType}
              </Badge>
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
             
            </div>



            <div className="mt-4 grid grid-cols-3 sm:grid-cols-3 gap-2">

              <div className="bg-card text-card-foreground rounded-xl border p-3 shadow-sm flex items-center justify-center">
                <div className="flex flex-col items-center text-center" onClick={() => {navigate("/Bookings")}}>
                  <Calendar className="h-6 w-6 text-primary" />
                  <div className="text-sm font-bold text-muted-foreground mt-2">
                    Your Bookings
                  </div>
                </div>
              </div>
              {/* <div className="bg-card text-card-foreground rounded-xl border p-3 shadow-sm flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <Gift className="h-6 w-6 text-primary" />
                  <div className="text-sm font-bold text-muted-foreground mt-2">
                    Rewards
                  </div>
                </div>
              </div> */}
              <div className="bg-card text-card-foreground rounded-xl border p-3 shadow-sm flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <MessageCircleQuestionMark className="h-6 w-6 text-primary" />
                  <div className="text-sm font-bold text-muted-foreground mt-2">
                    Need Helps?
                  </div>
                </div>
              </div>




            </div>



            {/* your information  */}
            <div className="mt-4">
              {/* Section Header */}
              <div className="bg-card px-3 rounded-xl">

                <div className=" text-card-foreground border-b border-border py-3">
                  <h2 className="text-md font-bold">
                    Your Information
                  </h2>
                </div>

                {/* Information List */}
                <div className="text-card-foreground rounded-b-xl overflow-hidden">
                  {your_information.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={index}
                        onClick={item.onClick}
                        className="py-3 cursor-pointer hover:bg-muted/40 transition border-b"
                      >
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </div>


                      </div>
                    );
                  })}

                </div>


              </div>

            </div>

            {/* other information  */}
            <div className="mt-4">
              {/* Section Header */}
              <div className="bg-card px-3 rounded-xl">

                <div className=" text-card-foreground border-b border-border py-3">
                  <h2 className="text-md font-bold">
                    Other Information
                  </h2>
                </div>

                {/* Information List */}
                <div className="text-card-foreground rounded-b-xl overflow-hidden">
                  {other_information.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={index}
                        className=" py-3 cursor-pointer border-b border-border"
                        onClick={item?.onclick}
                      >

                        {/* Row */}
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {item.tittle}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>


              </div>

            </div>
          </div>


          <div className="mt-2 py-2 flex flex-col items-center">
            <span className="text-[21px] text-muted-foreground">
              Mr & Mrs Coiffeurr
            </span>
            <span className="text-[19px] text-muted-foreground opacity-60">
              © {new Date().getFullYear()}
            </span>
          </div>




        </div>
      </div>
    </div >
  )
}
