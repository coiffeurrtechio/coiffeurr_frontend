import React, { useEffect, useState } from "react";
import { 
  Camera, ArrowLeft, Mail, Phone, Calendar, 
  MessageCircleQuestion, LayoutDashboard, LogOut, 
  ChevronRight, Award, Scissors
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/APIs";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiRequest } = useApi();
  
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
        return;
      }

      const res = await apiRequest<any>(`/users/${id}/pii`);
      if (res.data) {
        setusercontactdetails(res.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

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
        } 
      ].filter(Boolean)
    },
    {
      title: "Support & Legal",
      items: [
        { label: "Help & Support", icon: MessageCircleQuestion, onClick: () => {} },
        { label: "Terms & Conditions", icon: Award, onClick: () => {} },
        { label: "Logout", icon: LogOut, onClick: handleLogout, color: "text-red-500" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-32 bg-[#1E4D8C] relative">
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full text-white backdrop-blur-md"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <div className="relative -mt-16 bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-md">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-3xl font-bold">
                  {/* Optional chaining used for safety */}
                  {user.username?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#1E4D8C] text-white rounded-full border-2 border-white shadow-lg">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
          <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">
            {user.role?.replace("_", " ") || "Member"}
          </span>
        </div>

        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-gray-400" />
            <span className="text-gray-600">{usercontactdetails.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-gray-400" />
            <span className="text-gray-600">{usercontactdetails.phone || "No phone added"}</span>
          </div>
        </div>

        {menuSections.map((section, idx) => (
          <div key={idx} className="mt-6">
            <p className="px-1 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item: any, i) => (
                <button
                  key={i}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b last:border-0 border-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${item.color || 'text-gray-600'}`}>
                      <item.icon size={18} />
                    </div>
                    <span className={`text-sm font-bold ${item.color || 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-10 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-300 mb-1">
            <Scissors size={16} />
            <p className="text-sm font-black italic tracking-tighter">Coiffeurr</p>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Version 2.0.1 • © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}