import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import {
  Camera, ArrowLeft, Mail, Phone, Calendar,
  LayoutDashboard, LogOut, ChevronRight,
  Heart, Edit3, X, MapPin, Loader2, CheckCircle2, AlertCircle,
  Plus, Home, MapPinned, LocateFixed
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/APIs";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";
import { Button } from "../components/ui_components/button";
import Config from "../configs/config";

export default function Profile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userapiRequest, userapiPost } = usersalonApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const authData = JSON.parse(localStorage.getItem("authState") || "{}");
  const [user, setUser] = useState<any>(authData?.user?.user);
  const [usercontactdetails, setusercontactdetails] = useState<any>({
    email: "",
    phone: "",
    address: { house_no: "", street: "", locality: "", city: "", state: "", pincode: "", country: "", landmark: "" },
    image_url: ""
  });

  const [editForm, setEditForm] = useState({
    address: { house_no: "", street: "", locality: "", city: "", state: "", pincode: "", country: "India", landmark: "" },
    profileImage: "",
    user_id: authData?.user?.user?.id || ""
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const syncLocalStorage = (updatedData: any) => {
    const freshAuth = JSON.parse(localStorage.getItem("authState") || "{}");
    if (freshAuth.user?.user) {
      freshAuth.user.user = { ...freshAuth.user.user, ...updatedData };
      localStorage.setItem("authState", JSON.stringify(freshAuth));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const id = authData?.user?.user?.id || authData?.user?.id;
      if (!id) return handleLogout();
      const res = await userapiRequest<any>(`/users/${id}/pii`);
      if (res.data) {
        setusercontactdetails(res.data);
        setEditForm({
          address: res.data.address || { house_no: "", street: "", locality: "", city: "", state: "", pincode: "", country: "India", landmark: "" },
          profileImage: res.data.image_url || "",
          user_id: id
        });
      }
    } catch (error) {
      showToast(t('profile.couldNotLoadProfile'), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleAddressChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) return showToast(t('profile.geolocationNotSupported'), "error");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Using OpenStreetMap/Nominatim for free reverse geocoding
        // const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const body = {
          "lat": latitude,
          "lon": longitude,
          "language": "en"
        }
        const response = await fetch(`${Config.API_Customers}/geolocation/geolocation/location-details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include "Authorization": `Bearer ${token}` here if required
          },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        const addr = data.address;

        setEditForm(prev => ({
          ...prev,
          address: {
            ...prev.address,
            city: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
            locality: addr.suburb || addr.neighbourhood || "",
            street: addr.street || "",
            country: addr.country || "India"
          }
        }));
        showToast(t('profile.locationDetected'));
      } catch (err) {
        showToast(t('profile.failedToFetchAddress'), "error");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setIsLocating(false);
      showToast(t('profile.locationAccessDenied'), "error");
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // --- PARTIAL UPDATE LOGIC ---
      const payload: any = { user_id: editForm.user_id };
      let hasChanges = false;

      // Only add image_url if it changed
      if (editForm.profileImage !== usercontactdetails.image_url) {
        payload.image_url = editForm.profileImage;
        hasChanges = true;
      }

      // Only add address if any field within it changed
      if (JSON.stringify(editForm.address) !== JSON.stringify(usercontactdetails.address)) {
        payload.address = editForm.address;
        hasChanges = true;
      }

      if (!hasChanges) {
        setIsEditModalOpen(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${Config.API_AUTH_URL}/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData?.user?.access_token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setusercontactdetails((prev: any) => ({ ...prev, ...payload }));
        syncLocalStorage(payload);
        setIsEditModalOpen(false);
        showToast(t('profile.profileUpdated'));
      } else {
        throw new Error();
      }
    } catch (error) {
      showToast(t('profile.failedToSaveChanges'), "error");
    } finally {
      setLoading(false);
    }
  };

  const getFormattedAddress = () => {
    const addr = usercontactdetails.address;
    if (!addr || !addr.city) return null;
    return [addr.house_no, addr.street, addr.city].filter(Boolean).join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 overflow-x-hidden">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="h-32 bg-[#1E4D8C] relative">
        <div className="max-w-7xl mx-auto w-full h-full relative flex items-start justify-between p-6">
          <button onClick={() => navigate("/")} className="p-2.5 bg-white/10 rounded-full text-white backdrop-blur-md active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white backdrop-blur-md text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">
            <Edit3 size={14} /> {t('profile.updateInfo')}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <div className="relative -mt-16 bg-white rounded-[2rem] shadow-sm p-6 text-center border border-gray-100">
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-md relative">
              {usercontactdetails.image_url ? <img src={usercontactdetails?.image_url} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-3xl font-black">{user.name?.charAt(0)}</div>}
            </div>
          </div>
          <h2 className="mt-4 text-xl font-black text-gray-900 tracking-tight">{user.name}</h2>
          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block">
            {usercontactdetails.name || t('profile.user')}
          </span>
        </div>

        <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          {usercontactdetails?.phone ? (
            <ContactItem icon={<Phone size={18} />} label={t('profile.phone')} value={usercontactdetails.phone} />
          ) : (
            <AddContactPlaceholder
              icon={<Phone size={18} />}
              label={t('profile.phone')}
              onClick={() => navigate('/verify', { state: { phone: 'phone' } })}
            />
          )}


          {/* Email Section */}
          {usercontactdetails.email ? (
            <ContactItem icon={<Mail size={18} />} label={t('profile.email')} value={usercontactdetails.email} />
          ) : (
            <AddContactPlaceholder
              icon={<Mail size={18} />}
              label={t('profile.email')}
              onClick={() => navigate('/verify', { state: { email: 'email' } })}
            />
          )}


          {usercontactdetails.address?.city ? (
            <ContactItem icon={<MapPin size={18} />} label={t('profile.address')} value={getFormattedAddress()} />
          ) : (
            <AddContactPlaceholder icon={<MapPin size={18} />} label={t('profile.address')} onClick={() => setIsEditModalOpen(true)} />
          )}
        </div>

        <div className="mt-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <MenuItem label={t('profile.myBookings')} icon={<Calendar className="text-blue-600" />} onClick={() => navigate("/bookings")} />
          {user.role === "OWNER" && <MenuItem label={t('profile.salonDashboard')} icon={<LayoutDashboard className="text-orange-600" />} onClick={() => navigate("/dashboard")} />}
          <MenuItem label={t('profile.wishlist')} icon={<Heart className="text-red-500" />} onClick={() => navigate("/wishlist")} />
          <MenuItem label={t('profile.logout')} icon={<LogOut className="text-gray-400" />} onClick={handleLogout} isRed />
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">{t('profile.updateProfile')}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 relative">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-gray-200 relative">
                  {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                  {editForm.profileImage ? <img src={editForm.profileImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{user.name?.charAt(0)}</div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-[40%] p-2 bg-[#1E4D8C] text-white rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform"><Camera size={12} /></button>
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  const uploadData = new FormData();
                  uploadData.append("files", file);
                  uploadData.append("salon_id", authData?.user?.user?.id);
                  const res = await userapiPost<any>(`/upload/salon-images`, uploadData);
                  if (res?.data?.data?.urls[0]) setEditForm(prev => ({ ...prev, profileImage: res.data.data.urls[0] }));
                  setIsUploading(false);
                }} accept="image/*" className="hidden" />
              </div>

              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('profile.addressDetails')}</h3>
                <button onClick={handleAutoDetectLocation} disabled={isLocating} className="text-[10px] font-black uppercase text-[#1E4D8C] flex items-center gap-1 hover:underline">
                  {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                  {t('profile.autoDetect')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <EditInput label={t('profile.houseFlatNo')} value={editForm.address.house_no} onChange={(v: any) => handleAddressChange('house_no', v)} icon={<Home size={14} />} />
                <EditInput label={t('profile.landmark')} value={editForm.address.landmark} onChange={(v: any) => handleAddressChange('landmark', v)} icon={<MapPin size={14} />} />
                <div className="col-span-2"><EditInput label={t('profile.streetName')} value={editForm.address.street} onChange={(v: any) => handleAddressChange('street', v)} icon={<MapPinned size={14} />} /></div>
                <EditInput label={t('profile.locality')} value={editForm.address.locality} onChange={(v: any) => handleAddressChange('locality', v)} />
                <EditInput label={t('profile.city')} value={editForm.address.city} onChange={(v: any) => handleAddressChange('city', v)} />
                <EditInput label={t('profile.state')} value={editForm.address.state} onChange={(v: any) => handleAddressChange('state', v)} />
                <EditInput label={t('profile.pincode')} value={editForm.address.pincode} onChange={(v: any) => handleAddressChange('pincode', v)} />
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading || isUploading} className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : t('profile.saveChanges')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ContactItem = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-gray-50 rounded-xl text-[#1E4D8C]">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{label}</span>
      <span className="text-sm font-bold text-gray-700">{value}</span>
    </div>
  </div>
);

const EditInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase text-gray-400 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E4D8C] opacity-60">{icon}</div>}
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className={`w-full h-10 ${icon ? 'pl-9' : 'px-3'} bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-100 transition-all`} />
    </div>
  </div>
);

const MenuItem = ({ icon, label, onClick, isRed }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all group">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
      <span className={`text-sm font-bold ${isRed ? 'text-red-500' : 'text-gray-700'}`}>{label}</span>
    </div>
    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

const AddContactPlaceholder = ({ icon, label, onClick }: any) => {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed border-gray-100 hover:border-blue-200 transition-all text-left">
      <div className="p-2 bg-gray-50 rounded-xl text-gray-400">{icon}</div>
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{label}</span>
        <span className="text-sm font-bold text-blue-600 flex items-center gap-1">{t('profile.add')} {label} <Plus size={14} /></span>
      </div>
    </button>
  );
};