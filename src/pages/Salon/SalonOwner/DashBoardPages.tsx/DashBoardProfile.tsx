import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
  // Small utility to handle data strings
  const salonDetail = (val: string) => val || t('salonProfile.notAvailable');
  
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
    <div className="space-y-6 animate-md3-fade-in pb-10">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-md3-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{t('salonProfile.title')}</h1>
          <p className="text-sm text-gray-500">{t('salonProfile.subtitle')}</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 bg-[#1E4D8C] text-white px-6 py-2.5 rounded-xl font-bold text-sm elevation-3 hover:elevation-4 hover:bg-[#153a6b] transition-all active:scale-95 ripple-container"
        >
          <Edit3 size={18} />
          {t('salonProfile.editProfile')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. OWNER INFO CARD (Left Sidebar Style) */}
        <div className="lg:col-span-1 space-y-6 animate-delay-100">
          <div className="glass-card rounded-2xl p-6 text-center hover-lift animate-md3-fade-in">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-orange-100 flex items-center justify-center border-4 border-white elevation-2 overflow-hidden mx-auto">
                <span className="text-3xl md:text-5xl font-black text-orange-600">
                  {salonData.ownerName.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 glass-modal text-[#1E4D8C] rounded-xl elevation-2 hover:elevation-3 transition-all">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{salonData.ownerName}</h2>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100">
              {t('salonProfile.verifiedOwner')}
            </span>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed text-left bg-gray-50/50 p-4 rounded-xl border border-gray-100 italic">
              "{salonData.bio}"
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4 hover-lift animate-md3-fade-in">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <UserCircle size={16} /> {t('salonProfile.contactDetails')}
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
          <div className="glass-card rounded-2xl overflow-hidden hover-lift animate-delay-200 animate-md3-fade-in">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Clock size={20} className="text-[#1E4D8C]" />
              <h2 className="font-bold text-gray-800">{t('salonProfile.operationalHours')}</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <TimeBox label={t('salonProfile.openingTime')} value={salonData.openingTime} icon={Clock} />
                <TimeBox label={t('salonProfile.lunchStart')} value={salonData.lunchStart} icon={Scissors} color="text-orange-500" />
              </div>
              <div className="space-y-4">
                <TimeBox label={t('salonProfile.closingTime')} value={salonData.closingTime} icon={Calendar} />
                <TimeBox label={t('salonProfile.lunchEnd')} value={salonData.lunchEnd} icon={Scissors} color="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="glass-card rounded-2xl overflow-hidden hover-lift animate-delay-300 animate-md3-fade-in">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <MapPinHouse size={20} className="text-[#1E4D8C]" />
              <h2 className="font-bold text-gray-800">{t('salonProfile.locationDetails')}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <AddressDetail label={t('salonProfile.country')} value={salonData.country} />
              <AddressDetail label={t('salonProfile.state')} value={salonDetail(salonData.state)} />
              <AddressDetail label={t('salonProfile.city')} value={salonData.city} />
              <div className="col-span-2">
                <AddressDetail label={t('salonProfile.streetAddress')} value={salonData.street} />
              </div>
              <AddressDetail label={t('salonProfile.pincode')} value={salonData.pincode} />
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
  <div className="glass-card p-4 rounded-2xl flex items-center gap-4 elevation-1 hover:elevation-2 group transition-all">
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

export default DashBoardProfile;