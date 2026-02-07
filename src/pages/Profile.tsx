import React from "react";
import { 
  Camera, ArrowLeft, Mail, Phone, Calendar, 
  MessageCircleQuestion, LayoutDashboard, LogOut, 
  Store, ChevronRight, Award, Scissors
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/APIs";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userDetails = useSelector((state: any) => state.auth.user);

  // Fallback dummy data if userDetails is missing
  const user = {
    name: userDetails?.username || "Guest User",
    email: userDetails?.email || "guest@example.com",
    phone: userDetails?.phone || "+91 0000000000",
    role: userDetails?.role || "customer",
    profileImage: userDetails?.avatar || null,
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

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
        user.role === "salon_owner" && {
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
      {/* Header Banner */}
      <div className="h-32 bg-[#1E4D8C] relative">
        <button 
          onClick={() => navigate("/")}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full text-white backdrop-blur-md"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4">
        {/* Profile Card */}
        <div className="relative -mt-16 bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-md">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#1E4D8C] text-white rounded-full border-2 border-white shadow-lg">
              <Camera size={14} />
            </button>
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
          <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-full">
            {user.role.replace("_", " ")}
          </span>

          {/* <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-[#1E4D8C]">24</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Visits</p>
            </div>
            <div className="flex flex-col items-center border-l border-gray-100">
              <p className="text-lg font-bold text-orange-600">1250</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Points</p>
            </div>
          </div> */}
        </div>

        {/* Info Strip */}
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-gray-400" />
            <span className="text-gray-600">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-gray-400" />
            <span className="text-gray-600">{user.phone}</span>
          </div>
        </div>

        {/* Menu Sections */}
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

        {/* Footer */}
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