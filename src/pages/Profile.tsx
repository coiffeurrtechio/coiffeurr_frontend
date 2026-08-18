import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';
import {
  Camera, ArrowLeft, Mail, Phone, Calendar,
  LayoutDashboard, LogOut, ChevronRight, ChevronDown,
  Heart, Edit3, X, MapPin, Loader2, CheckCircle2, AlertCircle,
  Plus, Home, MapPinned, LocateFixed, User, Globe, Gift, MessageCircle, Link,
  CalendarDays, ChevronLeft
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/APIs";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";
import { Button } from "../components/ui_components/button";
import Config from "../configs/config";
import SettingsPanel from "../components/SettingsPanel";
import ParticleSystem from "../components/ParticleSystem";
import Sponser_Footer from "../components/Sponser_Footer";

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
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isUserDetailsExpanded, setIsUserDetailsExpanded] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showContactSupportModal, setShowContactSupportModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    setEditForm(prev => ({ ...prev, dob: `${year}-${month}-${dayStr}` }));
    setIsCalendarOpen(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const authData = JSON.parse(localStorage.getItem("authState") || "{}");
  const [user, setUser] = useState<any>(authData?.user);
  const [usercontactdetails, setusercontactdetails] = useState<any>({
    email: "",
    phone: "",
    address: { house_no: "", street: "", locality: "", city: "", state: "", pincode: "", country: "", landmark: "" },
    image_url: "",
    gender: "",
    dob: "",
    marital_status: ""
  });

  const [editForm, setEditForm] = useState({
    address: { house_no: "", street: "", locality: "", city: "", state: "", pincode: "", country: "India", landmark: "" },
    profileImage: "",
    user_id: authData?.user?.id || "",
    gender: "",
    dob: "",
    marital_status: ""
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateAuthState = (updatedData: any) => {
    const freshAuth = JSON.parse(localStorage.getItem("authState") || "{}");
    if (freshAuth.user) {
      freshAuth.user = { ...freshAuth.user, ...updatedData };
      localStorage.setItem("authState", JSON.stringify(freshAuth));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const id = authData?.user?.id;
      if (!id) {
        // Don't auto-logout if auth state is still loading
        if (authData?.isAuthenticated) {
          return handleLogout();
        }
        return;
      }
      const res = await userapiRequest<any>(`/users/${id}/pii`);
      if (res.data) {
        setusercontactdetails(res.data);
        setEditForm({
          address: res.data.address || { house_no: "", street: "", locality: "", city: "", state: "", pincode: "", country: "India", landmark: "" },
          profileImage: res.data.image_url || "",
          user_id: id,
          gender: res.data.gender || "",
          dob: res.data.dob || "",
          marital_status: res.data.marital_status || ""
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

      // Only add gender if it changed
      if (editForm.gender !== usercontactdetails.gender) {
        payload.gender = editForm.gender;
        hasChanges = true;
      }

      // Only add dob if it changed
      if (editForm.dob !== usercontactdetails.dob) {
        payload.dob = editForm.dob;
        hasChanges = true;
      }

      // Only add marital_status if it changed
      if (editForm.marital_status !== usercontactdetails.marital_status) {
        payload.marital_status = editForm.marital_status;
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
        updateAuthState(payload);
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

  return (
    <div className="min-h-screen pb-10 overflow-x-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-slate-50">
      <ParticleSystem />
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      <div className="h-40 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="max-w-7xl mx-auto w-full h-full relative flex items-start justify-between p-6">
          <button onClick={() => navigate("/")} className="p-3 bg-white/20 rounded-full text-white backdrop-blur-md hover:bg-white/30 active:scale-90 transition-all shadow-lg">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <div className="relative -mt-20 bg-gradient-to-br from-white/95 to-slate-50/95 rounded-[2.5rem] shadow-2xl p-8 text-center border border-white/20 backdrop-blur-[15px]">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 relative">
              {usercontactdetails.image_url ? <img src={usercontactdetails?.image_url} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 text-5xl font-black">{user?.name?.charAt(0) || usercontactdetails?.name?.charAt(0) || 'U'}</div>}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-4 border-white shadow-lg" />
          </div>
          <p className="mt-24 text-[10px] font-bold text-gray-400 tracking-[2px] text-center">
            {t('profile.welcomeBack') || 'Welcome Back'}
          </p>
          <h2 className="mt-1 text-3xl font-semibold text-gray-900 tracking-tight text-center whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif" }}>
            {user?.name || usercontactdetails?.name || t('profile.user')}
          </h2>
          <p className="mt-1 text-sm font-light italic text-gray-500 text-center opacity-70">
            Ready for your next transformation?
          </p>

          <div className="mt-4 inline-flex flex-col items-center gap-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-full">
              <Gift size={16} className="text-[#D4AF37]" />
              <span className="text-sm font-bold text-[#B8952E]">{usercontactdetails?.rewardPoints || 0} Reward Points</span>
            </div>
            <p className="text-[10px] text-[#B8952E]/80 text-center max-w-[240px] leading-tight">
              Your loyalty pays off! We’re rolling out special offers and perks very soon.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-[2rem] shadow-xl border border-white/20 overflow-hidden divide-y divide-slate-100 backdrop-blur-[15px]">
          <MenuItem label={t('profile.myBookings')} icon={<Calendar className="text-slate-800" />} onClick={() => navigate("/bookings")} />
          <MenuItem label={t('profile.wishlist')} icon={<Heart className="text-red-500" />} onClick={() => navigate("/wishlist")} />
          <MenuItem label={t('settings.language') || 'Language'} icon={<Globe className="text-slate-800" />} onClick={() => setShowLanguageModal(true)} />
          <MenuItem
            label={t('profile.contactSupport')}
            icon={<MessageCircle className="text-slate-800" />}
            onClick={() => setShowContactSupportModal(true)}
          />
          {user?.role === "OWNER" && <MenuItem label={t('profile.salonDashboard')} icon={<LayoutDashboard className="text-slate-800" />} onClick={() => navigate("/dashboard")} />}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setIsUserDetailsExpanded(!isUserDetailsExpanded)}
            className="w-full bg-gradient-to-br from-white/95 to-slate-50/95 rounded-2xl p-5 shadow-xl border border-white/20 flex items-center justify-between hover:shadow-2xl transition-all active:scale-[0.98] backdrop-blur-[15px]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl text-slate-800 shadow-sm">
                <User size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700">{t('profile.userDetails') || 'User Details'}</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${isUserDetailsExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isUserDetailsExpanded && (
            <div className="mt-4 bg-gradient-to-br from-white/95 to-slate-50/95 rounded-3xl p-6 shadow-xl border border-white/20 space-y-4 animate-in slide-in-from-top duration-200 backdrop-blur-[15px]">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl font-black tracking-widest shadow-lg hover:shadow-2xl active:scale-95 transition-all"
              >
                <Edit3 size={16} /> {t('profile.updateInfo')}
              </button>
              {usercontactdetails?.phone ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <Phone size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.phone')}</span>
                      <p className="mt-2 text-sm font-bold text-slate-900">{usercontactdetails.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <AddContactPlaceholder
                  icon={<Phone size={18} />}
                  label={t('profile.phone')}
                  onClick={() => navigate('/verify', { state: { phone: 'phone' } })}
                />
              )}


              {/* Email Section */}
              {usercontactdetails.email ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.email')}</span>
                      <p className="mt-2 text-sm font-bold text-slate-900">{usercontactdetails.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <AddContactPlaceholder
                  icon={<Mail size={18} />}
                  label={t('profile.email')}
                  onClick={() => navigate('/verify', { state: { email: 'email' } })}
                />
              )}


              {usercontactdetails.dob && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.dateOfBirth')}</span>
                      <p className="mt-2 text-sm font-bold text-slate-900">{new Date(usercontactdetails.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              )}

              {usercontactdetails.gender && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <User size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.gender')}</span>
                      <p className="mt-2 text-sm font-bold text-slate-900 capitalize">{usercontactdetails.gender}</p>
                    </div>
                  </div>
                </div>
              )}

              {usercontactdetails.anniversary && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <Heart size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.anniversary')}</span>
                      <p className="mt-2 text-sm font-bold text-slate-900">{new Date(usercontactdetails.anniversary).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              )}

              {usercontactdetails.marital_status && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <User size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.maritalStatus')}</span>
                      <p className="mt-2 text-sm font-bold text-slate-900 capitalize">{usercontactdetails.marital_status}</p>
                    </div>
                  </div>
                </div>
              )}

              {usercontactdetails.address?.city ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-white/50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl text-slate-800 shadow-sm">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-slate-500 tracking-tight">{t('profile.address')}</span>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-bold text-slate-900">{usercontactdetails.address.house_no}</p>
                        <p className="text-sm font-bold text-slate-800">{usercontactdetails.address.street}</p>
                        {isAddressExpanded && (
                          <>
                            <p className="text-sm font-bold text-slate-800">{usercontactdetails.address.locality}</p>
                            <p className="text-sm font-bold text-slate-800">{usercontactdetails.address.city}, {usercontactdetails.address.state} - {usercontactdetails.address.pincode}</p>
                            {usercontactdetails.address.country && <p className="text-sm font-bold text-slate-700">{usercontactdetails.address.country}</p>}
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                        className="mt-2 text-[10px] font-black text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        {isAddressExpanded ? (t('profile.seeLess') || 'See Less') : (t('profile.seeMore') || 'See More')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <AddContactPlaceholder icon={<MapPin size={18} />} label={t('profile.address')} onClick={() => setIsEditModalOpen(true)} />
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-gradient-to-br from-white/95 to-amber-50/20 rounded-[2rem] shadow-2xl border border-[rgba(212,175,55,0.3)] p-5 backdrop-blur-[15px]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl border border-black/10">
              <Gift className="text-gray-500" size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">{t('profile.shareStyle') || 'Share the Style'}</h3>
              <p className="mt-1 text-sm font-medium text-gray-500 leading-relaxed">
                {t('profile.goodStyleShared') || 'Good style is meant to be shared.'}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Hey! I just visited Mr & Mrs Coiffeurr and absolutely loved the experience. The vibe and the service are on another level. Thought you'd appreciate their style—check them out for your next refresh! ✂️✨\n\nView their work here: https://coiffeurr.com/")}`, '_blank')}
              className="w-[35px] h-[35px] flex items-center justify-center border border-black/10 rounded-full bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
            >
              <MessageCircle className="text-gray-500 hover:text-green-600" size={18} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://coiffeurr.com');
                showToast(t('profile.copied') || 'Copied', 'success');
              }}
              className="w-[35px] h-[35px] flex items-center justify-center border border-black/10 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300"
            >
              <Link className="text-gray-500 hover:text-gray-700" size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-white/95 to-slate-50/95 rounded-[2rem] shadow-xl border border-white/20 overflow-hidden backdrop-blur-[15px]">
          <MenuItem label={t('profile.logout')} icon={<LogOut className="text-slate-800" />} onClick={handleLogout} isRed />
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 animate-in slide-in-from-bottom shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{t('profile.updateProfile')}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="flex flex-col items-center justify-center py-3 sm:py-4 relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white overflow-hidden shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-sm"><Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" /></div>}
                  {editForm.profileImage ? <img src={editForm.profileImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl sm:text-3xl">{user.name?.charAt(0)}</div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 sm:bottom-4 right-[calc(50%-2.5rem)] sm:right-[calc(50%-3rem)] p-2 sm:p-3 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-full border-3 border-white shadow-xl hover:shadow-2xl active:scale-90 transition-all"><Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  const uploadData = new FormData();
                  uploadData.append("files", file);
                  uploadData.append("salon_id", authData?.user?.id);
                  const res = await userapiPost<any>(`/upload/salon-images`, uploadData);
                  if (res?.data?.data?.urls[0]) setEditForm(prev => ({ ...prev, profileImage: res.data.data.urls[0] }));
                  setIsUploading(false);
                }} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 ml-1">{t('profile.gender') || 'Gender'}</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full h-10 mt-1 px-3 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  >
                    <option value="">{t('profile.select') || 'Select'}</option>
                    <option value="male">{t('profile.male') || 'Male'}</option>
                    <option value="female">{t('profile.female') || 'Female'}</option>
                    <option value="other">{t('profile.other') || 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 ml-1">{t('profile.dateOfBirth') || 'Date of Birth'}</label>
                  <div className="relative input-wrapper">
                    <CalendarDays className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 opacity-60 z-10" size={18} />
                    <input
                      type="text"
                      value={editForm.dob || ''}
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      readOnly
                      placeholder="DD/MM/YYYY"
                      className="w-full h-10 mt-1 pl-10 pr-3 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-slate-100 transition-all cursor-pointer"
                    />
                    {isCalendarOpen && createPortal(
                      <div 
                        className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setIsCalendarOpen(false);
                          }
                        }}
                      >
                        <div 
                          className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 w-64 sm:w-72 animate-in zoom-in-95 duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <button onClick={() => handleMonthChange('prev')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                              <ChevronLeft size={16} className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => {
                                  const newDate = new Date(currentMonth);
                                  newDate.setMonth(parseInt(e.target.value));
                                  setCurrentMonth(newDate);
                                }}
                                className="font-bold text-xs sm:text-sm text-gray-900 bg-transparent border-none outline-none cursor-pointer"
                              >
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i} value={i} className="bg-white">
                                    {new Date(0, i).toLocaleDateString('en-US', { month: 'short' })}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={currentMonth.getFullYear()}
                                onChange={(e) => {
                                  const newDate = new Date(currentMonth);
                                  newDate.setFullYear(parseInt(e.target.value));
                                  setCurrentMonth(newDate);
                                }}
                                className="font-bold text-xs sm:text-sm text-gray-900 bg-transparent border-none outline-none cursor-pointer max-w-20"
                              >
                                {(() => {
                                  const currentYear = new Date().getFullYear();
                                  const years = [];
                                  for (let i = 0; i < 150; i++) {
                                    years.push(currentYear - 149 + i);
                                  }
                                  return years.map(year => (
                                    <option key={year} value={year} className="bg-white">
                                      {year}
                                    </option>
                                  ));
                                })()}
                              </select>
                            </div>
                            <button onClick={() => handleMonthChange('next')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                              <ChevronRight size={16} className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                              <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-gray-500 py-1">{day}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-0.5">
                            {(() => {
                              const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                              const days = [];
                              for (let i = 0; i < startingDayOfWeek; i++) {
                                days.push(<div key={`empty-${i}`} className="p-1" />);
                              }
                              for (let day = 1; day <= daysInMonth; day++) {
                                const isSelected = editForm.dob === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                                days.push(
                                  <button
                                    key={day}
                                    onClick={() => handleDateSelect(day)}
                                    className={`p-1 rounded-lg text-xs sm:text-sm font-bold transition-all hover:scale-105 ${
                                      isSelected 
                                        ? 'text-white' 
                                        : isToday
                                        ? 'text-[#D4AF37] font-bold'
                                        : 'hover:bg-gray-100'
                                    }`}
                                    style={isSelected ? { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' } : { color: '#1e293b' }}
                                  >
                                    {day}
                                  </button>
                                );
                              }
                              return days;
                            })()}
                          </div>
                          <button
                            onClick={() => setIsCalendarOpen(false)}
                            className="mt-3 w-full py-1.5 text-gray-600 hover:text-gray-900 font-bold text-xs transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-gray-400 ml-1">{t('profile.maritalStatus') || 'Marital Status'}</label>
                  <select
                    value={editForm.marital_status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, marital_status: e.target.value }))}
                    className="w-full h-10 mt-1 px-3 bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-slate-100 transition-all"
                  >
                    <option value="">{t('profile.select') || 'Select'}</option>
                    <option value="single">{t('profile.single') || 'Single'}</option>
                    <option value="married">{t('profile.married') || 'Married'}</option>
                    <option value="divorced">{t('profile.divorced') || 'Divorced'}</option>
                    <option value="widowed">{t('profile.widowed') || 'Widowed'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-slate-500 tracking-widest">{t('profile.addressDetails')}</h3>
                <button onClick={handleAutoDetectLocation} disabled={isLocating} className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 hover:text-slate-800 transition-colors">
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

              <Button onClick={handleUpdateProfile} disabled={loading || isUploading} className="w-full h-14 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl font-black tracking-widest shadow-xl hover:shadow-2xl active:scale-95 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : t('profile.saveChanges')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SettingsPanel isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} />

      {/* Contact Support Modal */}
      {showContactSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setShowContactSupportModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{t('profile.contactSupport')}</h2>
              <button onClick={() => setShowContactSupportModal(false)} className="p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:support@coiffeurr.com"
                className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-white/50 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="p-3 bg-white rounded-xl text-slate-800 shadow-sm">
                  <Mail size={20} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-500 tracking-tight uppercase">Email</span>
                  <p className="text-sm font-bold text-slate-900">support@coiffeurr.com</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </a>

              <a
                href="tel:+917045464907"
                className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-white/50 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="p-3 bg-white rounded-xl text-slate-800 shadow-sm">
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black text-slate-500 tracking-tight uppercase">Phone</span>
                  <p className="text-sm font-bold text-slate-900">+91 70454 64907</p>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </a>

              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-slate-600 text-center leading-relaxed">
                  Our support team is available to help you with any questions or concerns. We typically respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <Sponser_Footer collapsed={false} />
      </div>
    </div>
  );
}

const ContactItem = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-gray-50 rounded-xl text-slate-700">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-400 tracking-tight">{label}</span>
      <span className="text-sm font-bold text-gray-700">{value}</span>
    </div>
  </div>
);

const EditInput = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-gray-400 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 opacity-60">{icon}</div>}
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className={`w-full h-10 ${icon ? 'pl-9' : 'px-3'} bg-gray-50 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-slate-100 transition-all`} />
    </div>
  </div>
);

const MenuItem = ({ icon, label, onClick, isRed }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all group hover:-translate-y-[2px] hover:shadow-lg">
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
    <button onClick={onClick} className="w-full flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed border-gray-100 hover:border-slate-200 transition-all text-left">
      <div className="p-2 bg-gray-50 rounded-xl text-gray-400">{icon}</div>
      <div className="flex flex-col flex-1">
        <span className="text-[10px] font-black text-gray-400 tracking-tight">{label}</span>
        <span className="text-sm font-bold text-slate-700 flex items-center gap-1">{t('profile.add')} {label} <Plus size={14} /></span>
      </div>
    </button>
  );
};