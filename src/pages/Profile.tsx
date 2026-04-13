import React, { useEffect, useState, useRef } from "react";
import {
  Camera, ArrowLeft, Mail, Phone, Calendar,
  LayoutDashboard, LogOut, ChevronRight,
  Heart, Edit3, X, MapPin, Loader2, CheckCircle2, AlertCircle,
  Plus
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../API/APIs";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";
import { Button } from "../components/ui_components/button";
import Config from "../configs/config";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userapiRequest, userapiPost } = usersalonApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const authData = JSON.parse(localStorage.getItem("authState") || "{}");
  const [user, setUser] = useState<any>(authData?.user?.user);
  const [usercontactdetails, setusercontactdetails] = useState<any>({ email: "", phone: "", address: "", image_url: "" });

  // Combined Form State
  const [editForm, setEditForm] = useState({
    address: "",
    profileImage: "",
    user_id: authData?.user?.user?.id || ""
  });

  // --- Helpers ---
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
        // Pre-fill the form with fetched data
        setEditForm({
          address: res.data.address || "",
          profileImage: res.data.image_url || user?.profileImage || "",
          user_id: id
        });
      }
    } catch (error) {
      showToast("Could not load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Update form state whenever usercontactdetails changes to ensure modal is always synced
  useEffect(() => {
    setEditForm(prev => ({
      ...prev,
      address: usercontactdetails.address || "",
      profileImage: usercontactdetails.image_url || ""
    }));
  }, [usercontactdetails]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast("Image too large (max 5MB)", "error");

    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("files", file);
      uploadData.append("salon_id", authData?.user?.user?.id);

      const res = await userapiPost<any>(`/upload/salon-images`, uploadData);
      const newUrl = res?.data?.data?.urls[0];

      if (newUrl) {
        setEditForm(prev => ({ ...prev, profileImage: newUrl }));
        showToast("Image uploaded successfully");
      }
    } catch (error) {
      showToast("Image upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: editForm.user_id,
        address: editForm.address,
        image_url: editForm.profileImage
      };

      const response = await fetch(`${Config.API_AUTH_URL}/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData?.user?.access_token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setUser((prev: any) => ({ ...prev, profileImage: editForm.profileImage }));
        setusercontactdetails((prev: any) => ({
          ...prev,
          address: editForm.address,
          image_url: editForm.profileImage
        }));

        syncLocalStorage({
          address: editForm.address,
          profileImage: editForm.profileImage
        });

        setIsEditModalOpen(false);
        showToast("Profile updated successfully");
      } else {
        throw new Error();
      }
    } catch (error) {
      showToast("Failed to save profile changes", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !usercontactdetails.email) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-[#1E4D8C]" /></div>;

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
            <Edit3 size={14} /> Update Info
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
            {usercontactdetails.name || "User"}
          </span>
        </div>

        <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
         
          {usercontactdetails?.phone ? (
            <ContactItem icon={<Phone size={18} />} label="Phone" value={usercontactdetails.phone} />
          ) : (
            <AddContactPlaceholder
              icon={<Phone size={18} />}
              label="Phone"
              onClick={() => navigate('/verify', { state: { mode: 'phone' } })}
            />
          )}

         
          {/* Email Section */}
          {usercontactdetails.email ? (
            <ContactItem icon={<Mail size={18} />} label="Email" value={usercontactdetails.email} />
          ) : (
            <AddContactPlaceholder
              icon={<Mail size={18} />}
              label="Email"
              onClick={() => navigate('/verify', { state: { mode: 'email' } })}
            />
          )}

         
          {/* Address Section */}

           {usercontactdetails.address ? (
            <ContactItem icon={<MapPin size={18} />} label="Email" value={usercontactdetails.address} />
          ) : (
            <AddContactPlaceholder
              icon={<MapPin size={18} />}
              label=" Address"
              onClick={() => setIsEditModalOpen(true)}
              // onClick={() => navigate('/verify', { state: { mode: 'email' } })}
            />
          )}
          {/* <ContactItem icon={<MapPin size={18} />} label="Address" value={usercontactdetails.address || "Add address"} /> */}
        </div>

        <div className="mt-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <MenuItem label="My Bookings" icon={<Calendar className="text-blue-600" />} onClick={() => navigate("/bookings")} />
          {user.role === "OWNER" && <MenuItem label="Salon Dashboard" icon={<LayoutDashboard className="text-orange-600" />} onClick={() => navigate("/dashboard")} />}
          <MenuItem label="Wishlist" icon={<Heart className="text-red-500" />} onClick={() => navigate("/wishlist")} />
          <MenuItem label="Logout" icon={<LogOut className="text-gray-400" />} onClick={handleLogout} isRed />
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md bg-gray-200 relative">
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                    {editForm.profileImage ? (
                      <img src={editForm.profileImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2 bg-[#1E4D8C] text-white rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform">
                    <Camera size={12} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <p className="mt-3 text-[10px] font-black text-[#1E4D8C] uppercase tracking-widest cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {isUploading ? "Uploading..." : "Change Profile Photo"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Current Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1E4D8C]"><MapPin size={18} /></div>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Enter city or full address..."
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none border-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading || isUploading}
                className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Save All Changes"}
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
    <div className="p-2 bg-gray-50 rounded-xl text-gray-400">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{label}</span>
      <span className="text-sm font-bold text-gray-700 truncate">{value}</span>
    </div>
  </div>
);

const MenuItem = ({ icon, label, onClick, isRed }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all group">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-xl bg-gray-50 group-hover:bg-white transition-colors`}>{icon}</div>
      <span className={`text-sm font-bold ${isRed ? 'text-red-500' : 'text-gray-700'}`}>{label}</span>
    </div>
    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

const AddContactPlaceholder = ({ icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
  >
    <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-white group-hover:text-[#1E4D8C] transition-colors">
      {icon}
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">
        {label}
      </span>
      <span className="text-sm font-bold text-blue-600/60 group-hover:text-[#1E4D8C] flex items-center gap-1">
        Add {label} <Plus size={14} />
      </span>
    </div>
  </button>
);