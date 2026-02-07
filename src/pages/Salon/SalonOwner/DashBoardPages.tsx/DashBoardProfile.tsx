import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Calendar, Clock, 
  MapPinHouse, Edit3, Camera, Globe, 
  UserCircle, Scissors, Building
} from 'lucide-react';

// --- Types ---
interface DashBoardProfileProps {
  ownerName: string;
  email: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  lunchStart: string;
  lunchEnd: string;
  country: string;
  city: string;
  state: string;
  pincode: string;
  street: string;
  bio: string;
}

const DashBoardProfile: React.FC = () => {
  // Dummy Data - In production, this would come from salonData props or a selector
  const [salonData] = useState<DashBoardProfileProps>({
    ownerName: "Justin Mason",
    email: "justin.mason@stylehub.com",
    phone: "+91 98765 43210",
    openingTime: "09:00 AM",
    closingTime: "09:00 PM",
    lunchStart: "01:00 PM",
    lunchEnd: "02:00 PM",
    country: "India",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    street: "123, Indiranagar 100ft Road",
    bio: "Passionate salon owner with over 15 years of experience in the beauty industry. Focused on providing premium grooming services and an exceptional customer experience at StyleHub."
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Salon Profile</h1>
          <p className="text-sm text-gray-500">Manage your public salon information and business hours.</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 bg-[#1E4D8C] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#153a6b] transition-all active:scale-95"
        >
          <Edit3 size={18} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. OWNER INFO CARD (Left Sidebar Style) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-orange-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden mx-auto">
                <span className="text-3xl md:text-5xl font-black text-orange-600">
                  {salonData.ownerName.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white text-[#1E4D8C] rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{salonData.ownerName}</h2>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100">
              Verified Owner
            </span>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed text-left bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
              "{salonData.bio}"
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={16} /> Contact Details
            </h3>
            <div className="space-y-3">
               <InfoRow icon={Mail} value={salonData.email} />
               <InfoRow icon={Phone} value={salonData.phone} />
            </div>
          </div>
        </div>

        {/* 3. BUSINESS HOURS & ADDRESS (Main Content Area) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Hours Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Clock size={20} className="text-[#1E4D8C]" />
              <h2 className="font-bold text-gray-800">Operational Hours</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <TimeBox label="Opening Time" value={salonData.openingTime} icon={Clock} />
                <TimeBox label="Lunch Start" value={salonData.lunchStart} icon={Scissors} color="text-orange-500" />
              </div>
              <div className="space-y-4">
                <TimeBox label="Closing Time" value={salonData.closingTime} icon={Calendar} />
                <TimeBox label="Lunch End" value={salonData.lunchEnd} icon={Scissors} color="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <MapPinHouse size={20} className="text-[#1E4D8C]" />
              <h2 className="font-bold text-gray-800">Location Details</h2>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <AddressDetail label="Country" value={salonData.country} />
              <AddressDetail label="State" value={salonDetail(salonData.state)} />
              <AddressDetail label="City" value={salonData.city} />
              <div className="col-span-2">
                <AddressDetail label="Street Address" value={salonData.street} />
              </div>
              <AddressDetail label="Pincode" value={salonData.pincode} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const InfoRow = ({ icon: Icon, value }: any) => (
  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
    <Icon size={16} className="text-gray-400" />
    <span className="truncate">{value}</span>
  </div>
);

const TimeBox = ({ label, value, icon: Icon, color = "text-[#1E4D8C]" }: any) => (
  <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-blue-200 transition-colors">
    <div className={`p-2 bg-gray-50 rounded-lg ${color} transition-transform group-hover:scale-110`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AddressDetail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-gray-800">{value}</p>
  </div>
);

// Small utility to handle data strings
const salonDetail = (val: string) => val || "N/A";

export default DashBoardProfile;