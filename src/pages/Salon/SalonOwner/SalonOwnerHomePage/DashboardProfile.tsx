import React, { useEffect, useState, useCallback } from 'react';
import {
  Mail, Phone, MapPin, Calendar, Clock,
  Edit3, UserCircle, Star, ShieldCheck, X, Check,
  Trash2, Plus, Globe, Camera, Image as ImageIcon,
  CalendarDays, AlignLeft
} from 'lucide-react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { useApi } from '../../../../API/SalonsAPIs/ALLSalonAPI';
import { Loader } from '../../../../components/ui_components/Loader';

// Styles
import "swiper/css";
import "swiper/css/pagination";
import { useSalonApi } from '../../../../API/Salon_Owner_API/SalonOwnerAPI';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DashboardProfile: React.FC = () => {
  const { apiRequest, apiCustomerPut } = useApi();
  const [salonData, setSalonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const fetchProfile = useCallback(async () => {
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
  }, [apiRequest]);

  const handleUpdateSalon = async (updatedValues: any) => {
    try {
      const res = await apiCustomerPut<any>(`/salons/update/${salonData.id}`, updatedValues);
      if (res.data) {
        setSalonData(res.data);
        setIsEditModalOpen(false);
        fetchProfile();
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <Loader isVisible={true} />;
  if (!salonData) return <div className="p-10 text-center font-bold text-gray-400">Profile Not Found</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 pt-6">

        {/* HERO SECTION */}
        <div className="relative h-48 md:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
          <Swiper modules={[Pagination, Autoplay]} pagination={{ clickable: true }} autoplay={{ delay: 5000 }} className="h-full w-full">
            {(salonData.branding?.coverImages?.length > 0 ? salonData.branding.coverImages : ['/api/placeholder/1200/400']).map((img: string, i: number) => (
              <SwiperSlide key={i}><img src={img} className="w-full h-full object-cover" alt="cover" /></SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute top-6 right-6 z-10">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-[#1E4D8C] border border-white/50 shadow-sm">{salonData.status}</span>
          </div>
        </div>

        {/* PROFILE HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-4 -mt-16 md:-mt-20 relative z-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border-4 border-white overflow-hidden">
              <img src={salonData.branding?.logoUrl || '/api/placeholder/150/150'} className="w-full h-full object-cover rounded-[2rem]" alt="logo" />
            </div>
            <div className="mb-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{salonData.salonName}</h1>
                {salonData.isVerified && <ShieldCheck className="text-blue-500 fill-blue-50" size={24} />}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{salonData.salonType} • {salonData.pricing?.priceRange || 'Luxury'}</p>
            </div>
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="mb-2 flex items-center gap-2 bg-[#1E4D8C] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#163a6b] transition-all active:scale-95">
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">About & Contact</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">{salonData.description || "No description provided."}</p>
              <div className="space-y-5 border-t pt-6">
                <InfoRow icon={UserCircle} label="Owner" value={salonData.ownerName} />
                <InfoRow icon={Mail} label="Email" value={salonData.email} />
                <InfoRow icon={Phone} label="Primary Phone" value={salonData.primaryPhone} />
              </div>
            </div>

            <div className="bg-[#1E4D8C] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12"><Star size={120} fill="white" /></div>
              <p className="text-[10px] font-black uppercase opacity-60 mb-4">Performance</p>
              <p className="text-4xl font-black">{salonData.ratings?.average || 0}</p>
              <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">Based on {salonData.ratings?.reviewsCount || 0} Reviews</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={16} /> Operations & Weekly Off
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <TimeBox label="Opens" value={salonData.timing?.openingTime} />
                <TimeBox label="Closes" value={salonData.timing?.closingTime} />
                <TimeBox label="Lunch In" value={salonData.timing?.lunchBreak?.start} />
                <TimeBox label="Lunch Out" value={salonData.timing?.lunchBreak?.end} />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 flex flex-wrap gap-2 items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Weekly Off:</p>
                {salonData.timing?.weeklyOff?.length > 0 ? (
                  salonData.timing.weeklyOff.map((day: string) => (
                    <span key={day} className="px-3 py-1 bg-[#1E4D8C] text-white rounded-lg text-[10px] font-black uppercase">{day}</span>
                  ))
                ) : <span className="text-xs font-bold text-slate-400">Open 7 days a week</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-sans">Location</h3>
                <p className="text-sm font-bold text-slate-700 leading-relaxed font-sans">
                  {salonData.address?.street},<br />
                  {salonData.address?.city}, {salonData.address?.state}<br />
                  {salonData.address?.pincode}
                </p>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 font-sans">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {salonData.expertise?.map((ex: string) => (
                    <span key={ex} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black border border-slate-100 uppercase tracking-tighter font-sans">{ex}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
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
    description: initialData?.description || "",
    expertise: initialData?.expertise || [],
    pricing: initialData?.pricing || { priceRange: "" },
    address: initialData?.address || { street: "", city: "", state: "", pincode: "", country: "India" },
    timing: initialData?.timing || { openingTime: "", closingTime: "", lunchBreak: { start: "", end: "" }, weeklyOff: [] },
    branding: initialData?.branding || { logoUrl: "", coverImages: [] }
  }));

  const [newExpertise, setNewExpertise] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const { apiSalonPost } = useSalonApi();


  // Add these new states
  const [tempLogo, setTempLogo] = useState<{ file: File; preview: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // For the Gallery, we'll track which index or if it's a "new" upload
  const [tempGalleryFile, setTempGalleryFile] = useState<{ file: File; preview: string } | null>(null);


  const handleNestedChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const toggleWeeklyOff = (day: string) => {
    const currentOffs = formData.timing.weeklyOff || [];
    const updatedOffs = currentOffs.includes(day)
      ? currentOffs.filter((d: string) => d !== day)
      : [...currentOffs, day];
    handleNestedChange('timing.weeklyOff', updatedOffs);
  };

  const addTag = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise)) {
      setFormData({ ...formData, expertise: [...formData.expertise, newExpertise.trim()] });
      setNewExpertise("");
    }
  };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Start reading the file as a Data URL
      reader.readAsDataURL(file);

      // On success: the result contains the full base64 string (including data:image/png;base64,...)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to string"));
        }
      };

      // On error: reject the promise
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFile = async (file: File, path: string) => {
    if (!file) return;

    // 1. Strict Size Validation (2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    if (file.size > MAX_SIZE) {
      alert("File is too large! Please upload an image smaller than 2MB.");
      // We return here so no state is updated and no conversion happens
      return;
    }

    // 2. Optional: Type Validation (Security Best Practice)
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }

    try {
      // Only proceeds if validations above passed
      const base64 = await fileToBase64(file);

      // Update the state with the new image
      handleNestedChange(path, base64);

      console.log("File processed and state updated successfully.");
    } catch (err) {
      console.error("File processing failed:", err);
    }
  };

  const EditFileInput = ({ label, onChange }: any) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
        {label}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
          }
        }}
        className="w-full text-xs font-bold text-slate-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-2xl file:border-0
        file:text-[10px] file:font-black file:uppercase
        file:bg-[#1E4D8C] file:text-white
        hover:file:bg-[#163a6b] transition-all cursor-pointer"
      />
    </div>
  );


  const handleCloudUpload = async (file: File, type: 'logo' | 'gallery') => {
    setIsUploading(true);
    try {
      const user = localStorage.getItem("authState");
      const parsedUser = user ? JSON.parse(user) : null;
      // Fallback to match your fetchProfile logic
      const salonId = parsedUser?.user?.user?.salonId || parsedUser?.user?.salonId;

      const uploadData = new FormData();
      uploadData.append("files", file);
      uploadData.append("salon_id", salonId);

      const res = await apiSalonPost<any>("/upload/salon-images", uploadData);

      // Accessing the URL from: res.data.data.urls[0] based on your JSON structure
      const uploadedUrl = res.data?.data?.urls?.[0];

      if (uploadedUrl) {
        if (type === "logo") {
          handleNestedChange("branding.logoUrl", uploadedUrl);
          setTempLogo(null);
        } else {
          const currentImages = formData.branding.coverImages || [];
          handleNestedChange("branding.coverImages", [...currentImages, uploadedUrl]);
          setTempGalleryFile(null);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image. Please check file size or connection.");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">

          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Edit Salon Profile</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your brand story and ops</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={20} /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* COLUMN 1 */}
            <div className="space-y-8">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Business Story & Branding</h4>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex justify-between">
                    <span>Description</span>
                    <span className={formData.description.length > 200 ? 'text-orange-500' : ''}>{formData.description.length}/300</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 300) })}
                    rows={4}
                    className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                    placeholder="Tell clients about your salon..."
                  />
                </div>

                {/* <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-inner overflow-hidden flex-shrink-0 border-2 border-white">
                    <img src={formData.branding.logoUrl || '/api/placeholder/100/100'} alt="Logo Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <EditInput label="Logo URL" value={formData.branding.logoUrl} onChange={(val: any) => handleNestedChange('branding.logoUrl', val)} />
                    <EditFileInput label="Upload File" onChange={handleFile, } />
                  </div>
                </div> */}

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Logo Management</h4>
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-inner overflow-hidden flex-shrink-0 border-2 border-white">
                      <img
                        src={tempLogo ? tempLogo.preview : (formData.branding.logoUrl || '/api/placeholder/100/100')}
                        alt="Logo Preview"
                        className={`w-full h-full object-cover ${tempLogo ? 'opacity-50' : ''}`}
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      {!tempLogo ? (
                        <EditFileInput
                          label="Select New Logo"
                          onChange={async (file: File) => {
                            if (file.size > 2 * 1024 * 1024) return alert("Max 2MB");
                            const preview = await fileToBase64(file);
                            setTempLogo({ file, preview });
                          }}
                        />
                      ) : (
                        <div className="flex gap-2">
                          <button
                            disabled={isUploading}
                            onClick={() => handleCloudUpload(tempLogo.file, 'logo')}
                            className="flex-1 h-10 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                          >
                            {isUploading ? 'Uploading...' : <><Check size={14} /> Confirm</>}
                          </button>
                          <button onClick={() => setTempLogo(null)} className="px-4 h-10 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cover Gallery</label>

                  {/* NEW UPLOAD SLOT */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-4">
                    {!tempGalleryFile ? (
                      <EditFileInput
                        label="Add New Gallery Image"
                        onChange={async (file: File) => {
                          if (file.size > 2 * 1024 * 1024) return alert("Max 2MB");
                          const preview = await fileToBase64(file);
                          setTempGalleryFile({ file, preview });
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-4">
                        <img src={tempGalleryFile.preview} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 flex gap-2">
                          <button
                            disabled={isUploading}
                            onClick={() => handleCloudUpload(tempGalleryFile.file, 'gallery')}
                            className="flex-1 h-10 bg-[#1E4D8C] text-white rounded-xl text-[10px] font-black uppercase"
                          >
                            {isUploading ? 'Uploading...' : 'Upload to Gallery'}
                          </button>
                          <button onClick={() => setTempGalleryFile(null)} className="px-4 h-10 bg-slate-200 rounded-xl text-[10px] font-black uppercase">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* EXISTING IMAGES LIST */}
                  <div className="grid grid-cols-4 gap-3">
                    {formData.branding.coverImages?.map((img: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                        <button
                          onClick={() => handleNestedChange('branding.coverImages', formData.branding.coverImages.filter((_: any, i: number) => i !== idx))}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Location</h4>
                <EditInput label="Street Address" value={formData.address.street} onChange={(val: any) => handleNestedChange('address.street', val)} />
                <div className="grid grid-cols-3 gap-3">
                  <EditInput label="City" value={formData.address.city} onChange={(val: any) => handleNestedChange('address.city', val)} />
                  <EditInput label="State" value={formData.address.state} onChange={(val: any) => handleNestedChange('address.state', val)} />
                  <EditInput label="Zip" value={formData.address.pincode} onChange={(val: any) => handleNestedChange('address.pincode', val)} />
                </div>
              </section>
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Business Hours & Weekly Off</h4>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Opens" type="time" value={formData.timing.openingTime} onChange={(val: any) => handleNestedChange('timing.openingTime', val)} />
                  <EditInput label="Closes" type="time" value={formData.timing.closingTime} onChange={(val: any) => handleNestedChange('timing.closingTime', val)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Break Start" type="time" value={formData.timing.lunchBreak?.start} onChange={(val: any) => handleNestedChange('timing.lunchBreak.start', val)} />
                  <EditInput label="Break End" type="time" value={formData.timing.lunchBreak?.end} onChange={(val: any) => handleNestedChange('timing.lunchBreak.end', val)} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Weekly Off Days</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeeklyOff(day)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${formData.timing.weeklyOff.includes(day) ? "bg-[#1E4D8C] text-white border-[#1E4D8C] shadow-lg shadow-blue-900/10" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-[#1E4D8C] tracking-widest border-b pb-2">Details & Expertise</h4>
                <div className="grid grid-cols-2 gap-4">
                  <EditInput label="Salon Type" value={formData.salonType} onChange={(val: any) => setFormData({ ...formData, salonType: val })} />
                  <EditInput label="Price Range" value={formData.pricing?.priceRange} onChange={(val: any) => handleNestedChange('pricing.priceRange', val)} />
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input value={newExpertise} onChange={(e) => setNewExpertise(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} placeholder="Add specialized service..." className="flex-1 h-12 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" />
                    <button onClick={addTag} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center"><Plus size={20} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise?.map((item: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black border border-slate-200 uppercase tracking-tighter">
                        {item}
                        <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setFormData({ ...formData, expertise: formData.expertise.filter((_: any, i: number) => i !== idx) })} />
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4">
            <button onClick={onClose} className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-400 font-bold hover:bg-slate-100 transition-all font-sans">Discard</button>
            <button
              onClick={() => onUpdate(formData)}
              className="flex-[2] h-14 rounded-2xl bg-[#1E4D8C] text-white font-bold shadow-xl shadow-blue-900/20 hover:bg-[#163a6b] flex items-center justify-center gap-2 font-sans"
            >
              <Check size={18} /> Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helpers
const InfoRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Icon size={18} /></div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{value || 'N/A'}</p>
    </div>
  </div>
);

const TimeBox = ({ label, value }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-900">{value || '--:--'}</p>
  </div>
);

const EditInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
    />
  </div>
);

const EditFileInput = ({ label, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
      {label}
    </label>

    <input
      type="file"
      onChange={(e) => onChange(e.target.files[0])}
      className="w-full h-12 px-3 py-2 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-100 file:text-blue-700"
    />
  </div>
);

export default DashboardProfile;