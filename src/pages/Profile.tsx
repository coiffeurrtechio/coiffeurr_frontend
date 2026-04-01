import React, { useEffect, useState } from "react";
import {
  Camera, ArrowLeft, Mail, Phone, Calendar,
  MessageCircleQuestion, LayoutDashboard, LogOut,
  ChevronRight, Award, Scissors,
  Heart
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/APIs";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userapiRequest } = usersalonApi();

  const [loading, setLoading] = useState(true);
  // Initializing with null or empty strings helps prevent ".charAt(0)" errors
  const userdata = JSON.parse(localStorage.getItem("authState") || "{}");
  // Accessing nested properties safely
  const [user, setUser] = useState<any>(userdata?.user?.user);
  const [usercontactdetails, setusercontactdetails] = useState<any>(null);


  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const GetUserData = async () => {
    setLoading(true);
    try {
      const data = JSON.parse(localStorage.getItem("authState") || "{}");
      // Accessing nested properties safely
      const id = data?.user?.user?.id || data?.user?.id;

      if (!id) {

        console.error("No User ID found");
        handleLogout();
        return;
      }

      const res = await userapiRequest<any>(`/users/${id}/pii`);
      if (res.data) {
        setusercontactdetails(res.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = () => {
    navigate("/wishlist");
  }

  useEffect(() => {
    GetUserData();
  }, []);

  // 1. Loading State: Prevent rendering undefined values
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Error State: Handle case where user fetch fails
  if (!user) {
    return <div className="p-10 text-center">User not found. Please log in again.</div>;
  }

  const menuSections = [
    {
      title: "Your Information",
      items: [
        {
          label: "My Bookings",
          icon: Calendar,
          onClick: () => navigate("/bookings"),
          color: "text-blue-600",
        },
        // Only show dashboard if user is OWNER
        user.role === "OWNER" && {
          label: "Go to Dashboard",
          icon: LayoutDashboard,
          onClick: () => navigate("/dashboard"),
          color: "text-orange-600",
        },
        { label: "Wishlist", icon: Heart, onClick: handleWishlist, color: "text-red-500" },

      ].filter(Boolean)
    },
    {
      title: "Support & Legal",
      items: [
        // { label: "Help & Support", icon: MessageCircleQuestion, onClick: () => { } },
        // { label: "Terms & Conditions", icon: Award, onClick: () => { } },
        { label: "Logout", icon: LogOut, onClick: handleLogout, color: "text-red-500" },
      ]
    },
  ];

  return (

    <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">

      {/* Header Section - Height scales up on tablet/desktop */}
      <div className="h-32 sm:h-40 md:h-48 bg-[#1E4D8C] relative transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full h-full relative">
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-4 sm:left-8 p-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {/* Main Profile Container */}
      <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6">

        {/* Profile Header Card */}
        <div className="relative -mt-16 sm:-mt-20 bg-white rounded-[2rem] shadow-sm p-6 sm:p-8 text-center border border-gray-100">
          <div className="relative inline-block">
            {/* Avatar sizing scales with screen size */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-md">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-3xl sm:text-4xl font-black">
                  {user.username?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 p-2.5 bg-[#1E4D8C] hover:bg-[#153a6b] text-white rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="mt-4 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{user.name}</h2>
          <span className="inline-block mt-2 px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full">
            {user.role?.replace("_", " ") || "Member"}
          </span>
        </div>

        {/* Contact Quick Info */}
        <div className="mt-6 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm sm:text-base">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Mail size={16} className="text-gray-400" />
            </div>
            <span className="text-gray-600 font-medium truncate">{usercontactdetails.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm sm:text-base">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Phone size={16} className="text-gray-400" />
            </div>
            <span className="text-gray-600 font-medium">{usercontactdetails.phone || "No phone added"}</span>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8 mt-8">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <p className="px-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                {section.title}
              </p>
              <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {section.items.map((item: any, i) => (
                  <button
                    key={i}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 active:bg-gray-100 transition-all border-b last:border-0 border-gray-50 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl bg-gray-50 transition-colors group-hover:bg-white ${item.color || 'text-gray-600'}`}>
                        <item.icon size={20} />
                      </div>
                      <span className={`text-sm sm:text-base font-bold ${item.color || 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Brand Footer */}
        <div className="mt-16 mb-10 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-300 mb-2">
            <Scissors size={18} className="rotate-45" />
            <p className="text-base font-black italic tracking-tighter uppercase">Coiffeurr</p>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
            Version 2.0.1 • © {new Date().getFullYear()} Sponsered by
            <div>
              IIM shillong and SIDBi
            </div>
          </p>
        </div>
      </div>
    </div>
  );
}