import React, { useEffect, useState } from 'react';
import {
  Mail, Phone, MapPin, Calendar, Clock,
  MapPinHouse, Edit3, Camera, Globe,
  UserCircle, Scissors, Building, Star,
  ShieldCheck, ShieldAlert, X, Check,
  ChevronRight, Trash2, Plus
} from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
// import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
// import { Loader } from "../../components/ui_components/Loader";
// import { Button } from "../../components/ui_components/button";

// Styles
import "swiper/css";
import "swiper/css/pagination";
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';

const DashboardProfile: React.FC = () => {
  const { apiRequest } = useApi();
  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const salonId = parsedAuth?.user?.user?.salonId || parsedAuth?.user?.salonId;

      if (!salonId) return;
      const res = await apiRequest<any>(`/salons/${salonId}`);
      if (res.data) setSalonData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // The method called when update is clicked in the modal
  const handleUpdateSalon = async (updatedValues: any) => {
    try {
      // In production: await apiRequest.put(`/salons/${salonData.id}`, updatedValues);
      console.log("Calling update API with:", updatedValues);
      setSalonData(updatedValues); // Optimistic UI update
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatTime = (time: string) => {
    if (!time) return "--:--";
    if (time.includes('T') || time.includes('Z')) {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return time;
  };

  if (loading) return <Loader isVisible={true} />;
  if (!salonData) return <div className="p-10 text-center font-bold text-gray-400">Profile Not Found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6 pt-6">

        {/* HERO SECTION */}
        <div className="relative h-48 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group">
          <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 5000 }} className="h-full w-full">
            {(salonData.branding?.coverImages?.length > 0 ? salonData.branding.coverImages : ['/api/placeholder/1200/400']).map((img: string, i: number) => (
              <SwiperSlide key={i}><img src={img} className="w-full h-full object-cover" alt="cover" /></SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-[#1E4D8C] border border-white/50">{salonData.status}</span>
          </div>
        </div>

        {/* PROFILE HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-4 -mt-16 md:-mt-20 relative z-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border-4 border-white">
              <img src={salonData.branding?.logoUrl || '/api/placeholder/150/150'} className="w-full h-full object-cover rounded-[2rem]" alt="logo" />
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{salonData.salonName}</h1>
                {salonData.isVerified && <ShieldCheck className="text-blue-500 fill-blue-50" size={24} />}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{salonData.salonType} • {salonData.pricing?.priceRange}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="mb-2 flex items-center gap-2 bg-[#1E4D8C] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#163a6b] transition-all active:scale-95"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Contact Information</h3>
              <div className="space-y-5">
                <InfoRow icon={UserCircle} label="Owner" value={salonData.ownerName} />
                <InfoRow icon={Mail} label="Email" value={salonData.email} />
                <InfoRow icon={Phone} label="Primary Phone" value={salonData.primaryPhone} />
              </div>
            </div>

            <div className="bg-[#1E4D8C] rounded-[2rem] p-8 text-white shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black uppercase opacity-60">Avg Rating</p>
                <Star size={20} fill="white" />
              </div>
              <p className="text-4xl font-black">{salonData.ratings?.average || 0}</p>
              <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">Based on {salonData.ratings?.reviewsCount || 0} Reviews</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={16} /> Business Hours & Breaks
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TimeBox label="Opens" value={formatTime(salonData.timing?.openingTime)} />
                <TimeBox label="Closes" value={formatTime(salonData.timing?.closingTime)} />
                <TimeBox label="Lunch In" value={formatTime(salonData.timing?.lunchBreak?.start)} />
                <TimeBox label="Lunch Out" value={formatTime(salonData.timing?.lunchBreak?.end)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Location</h3>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  {salonData.address?.street},<br />
                  {salonData.address?.city}, {salonData.address?.state}<br />
                  {salonData.address?.pincode}, {salonData.address?.country}
                </p>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {salonData.expertise?.map((ex: string) => (
                    <span key={ex} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 uppercase">{ex}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={salonData}
          onUpdate={handleUpdateSalon}
        />
      )}
    </div>
  );
};

// --- MODAL COMPONENT ---
const EditProfileModal = ({ onClose, initialData, onUpdate }: any) => {
const [formData, setFormData] = useState(() => ({
    ...initialData,
    pricing: initialData?.pricing ?? { priceRange: "" },
    address: initialData?.address ?? { street: "", city: "", state: "", pincode: "", country: "India" },
    timing: initialData?.timing ?? { openingTime: "", closingTime: "", lunchBreak: { start: "", end: "" }, weeklyOff: [] },
    branding: initialData?.branding ?? { logoUrl: "", coverImages: [] }
  }));
  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Edit Salon Profile</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Update your business presence</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-tighter">Basic Details</h4>
              <EditInput label="Salon Name" value={formData.salonName} onChange={(e: any) => setFormData({ ...formData, salonName: e?.target?.value })} />
              <EditInput label="Description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e?.target?.value })} />
              <div className="grid grid-cols-2 gap-4">
                <EditInput label="Salon Type" value={formData.salonType} onChange={(e: any) => setFormData({ ...formData, salonType: e?.target?.value })} />
                <EditInput
                  label="Price Range"
                  value={formData.pricing?.priceRange ?? ""} // Add ?. and ?? ""
                  onChange={(e: any) => handleNestedChange('pricing.priceRange', e?.target?.value)}
                />              </div>
            </div>

            {/* Address */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-tighter">Location</h4>
              <EditInput label="Street Address" value={formData.address.street} onChange={(e: any) => handleNestedChange('address.street', e?.target?.value)} />
              <div className="grid grid-cols-2 gap-4">
                <EditInput label="City" value={formData.address.city} onChange={(e: any) => handleNestedChange('address.city', e?.target?.value)} />
                <EditInput label="Pincode" value={formData.address.pincode} onChange={(e: any) => handleNestedChange('address.pincode', e?.target?.value)} />
              </div>
            </div>

            {/* Timings */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-tighter">Operational Timings</h4>
              <div className="grid grid-cols-2 gap-4">
                <EditInput label="Opening" type="time" value={formData.timing.openingTime} onChange={(e: any) => handleNestedChange('timing.openingTime', e?.target?.value)} />
                <EditInput label="Closing" type="time" value={formData.timing.closingTime} onChange={(e: any) => handleNestedChange('timing.closingTime', e?.target?.value)} />
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-tighter">Branding Assets</h4>
              <EditInput label="Logo URL" value={formData.branding.logoUrl} onChange={(e: any) => handleNestedChange('branding.logoUrl', e?.target?.value)} />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4">
            <button onClick={onClose} className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-400 font-bold hover:bg-slate-100 transition-all">Discard Changes</button>
            <button
              onClick={() => onUpdate(formData)}
              className="flex-[2] h-14 rounded-2xl bg-[#1E4D8C] text-white font-bold shadow-xl shadow-blue-900/20 hover:bg-[#163a6b] flex items-center justify-center gap-2"
            >
              <Check size={18} /> Save & Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UI HELPERS ---
const InfoRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Icon size={18} /></div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{value || 'N/A'}</p>
    </div>
  </div>
);

const TimeBox = ({ label, value }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-900">{value}</p>
  </div>
);

const EditInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all"
    />
  </div>
);

export default DashboardProfile;