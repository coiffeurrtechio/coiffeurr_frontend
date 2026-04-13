import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ArrowRight, Smartphone, Loader2, Lock,
  CheckCircle2, AlertCircle, ShieldCheck, Camera,
  CalendarDays, VenusAndMars, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui_components/button';
import Config from '../configs/config';
import { useDispatch } from 'react-redux';
import { login } from '../utils/Storage/slice/authSlice';
import { useToast } from '../components/Toast';

const CustomerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added for password visibility
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    otp: '',
    gender: 'male',
    dob: '', 
    marital_status: 'single',
    image_url: '',
    agreeToPolicy: true
  });

  // Calculate max date (5 years ago from today)
  const maxDate = useMemo(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 5);
    return today.toISOString().split('T')[0];
  }, []);

  const formatDateToPayload = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleSendOTP = async () => {
    if (formData.phone.length < 10) {
      setErrors({ phone: "Enter a valid 10-digit number" });
      return;
    }
    setIsLoading(true);
    try {
      const payload = { email: null, phone: formData.phone, username: "NewUser" };
      const response = await fetch(`${Config.API_AUTH_URL}/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData?.detail || "Failed to send OTP");
      setNotification({ type: 'success', message: `OTP sent to ${formData.phone}!` });
      setStep(2);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("files", file);
      const response = await fetch(`${Config.API_Customers}/upload/user-images`, {
        method: "POST",
        body: uploadData,
      });
      const res = await response.json();
      const url = res?.data?.data?.urls?.[0] || res?.data?.urls?.[0];
      if (url) {
        setFormData(prev => ({ ...prev, image_url: url }));
        setNotification({ type: 'success', message: 'Photo Uploaded!' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Upload Failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.otp) newErrors.otp = "OTP is required";
    if (!formData.username) newErrors.username = "Name is required";
    if (formData.password.length < 8) newErrors.password = "Min 8 characters";
    if (!formData.dob) newErrors.dob = "DOB is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const finalPayload = {
      email: "",
      otp: formData.otp,
      phone: formData.phone,
      username: formData.username,
      password: formData.password,
      agreeToPolicy: formData.agreeToPolicy,
      gender: formData.gender,
      dob: formatDateToPayload(formData.dob),
      marital_status: formData.marital_status,
      image_url: formData.image_url,
      metadata: { signupSource: "web" }
    };

    try {
      const response = await fetch(`${Config.API_AUTH_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData?.detail || 'Registration failed');

      dispatch(login({ user: resData }));

      showToast({
        type: "success",
        title: "Registration Successful",
        message: "Welcome back to Coiffeurr!",
        duration: 5000,
      });

      if (resData?.user?.role === "OWNER") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'otp') {
      const sanitized = value.replace(/[^0-9]/g, '');
      const limit = name === 'phone' ? 10 : 6;
      setFormData(prev => ({ ...prev, [name]: sanitized.slice(0, limit) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4 relative font-sans">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="pt-8 px-8 flex justify-between gap-2">
          {[1, 2].map(num => <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-[#1E4D8C]' : 'bg-gray-100'}`} />)}
        </div>

        <div className="p-8">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Register</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Step {step} of 2</p>
          </header>

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <InputField label="Enter WhatsApp Number *" name="phone" type="tel" value={formData.phone} onChange={handleChange} icon={Smartphone} placeholder="9876543210" error={errors.phone} />
              <Button onClick={handleSendOTP} disabled={isLoading || formData.phone.length < 10} className="w-full h-12 rounded-2xl bg-[#1E4D8C] text-white font-black shadow-xl shadow-blue-900/20">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Get Verification Code'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">

              {/* PHOTO SECTION */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative">
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-[#1E4D8C]" size={20} />
                      </div>
                    ) : formData.image_url ? (
                      <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-[#1E4D8C] text-white rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform">
                    <Camera size={12} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>
                <p className="mt-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">Add Photo</p>
              </div>

              {/* OTP SECTION - Improved UI */}
              <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 mb-2">
                <InputField 
                    label="Verification Code *" 
                    name="otp" 
                    value={formData.otp} 
                    onChange={handleChange} 
                    icon={ShieldCheck} 
                    placeholder="Enter 6-digit OTP" 
                    error={errors.otp} 
                    maxLength={6}
                />
                <p className="text-[9px] text-blue-400 font-bold mt-2 ml-1">Check your WhatsApp for the code</p>
              </div>

              <InputField label="Full Name *" name="username" value={formData.username} onChange={handleChange} icon={User} placeholder="Enter your name" error={errors.username} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                  <div className="relative group">
                    <VenusAndMars className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select name="gender" className="w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none appearance-none" value={formData.gender} onChange={handleChange}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        name="dob" 
                        type="date" 
                        max={maxDate} // Prevent future dates and enforce 5 years old
                        className={`w-full h-11 pl-11 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none ${errors.dob ? 'ring-2 ring-red-100' : ''}`} 
                        value={formData.dob} 
                        onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              {/* PASSWORD SECTION - with visibility toggle */}
              <InputField 
                label="Secure Password *" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                value={formData.password} 
                onChange={handleChange} 
                icon={Lock} 
                placeholder="••••••••" 
                error={errors.password} 
                isPassword
                toggleVisible={() => setShowPassword(!showPassword)}
                isVisible={showPassword}
              />

              <Button disabled={isLoading || isUploading} onClick={handleSubmit} className="w-full h-14 bg-[#1E4D8C] text-white font-black rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Signup'}
                {!isLoading && <ArrowRight size={18} />}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black uppercase text-gray-400 py-2">Back to mobile</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-component - Updated for Password Toggle
const InputField = React.memo(({ label, name, value, onChange, icon: Icon, type = "text", placeholder, error, isPassword, toggleVisible, isVisible, max }: any) => (
  <div className="space-y-1 w-full text-left">
    <div className="flex justify-between items-center px-1">
      <label className={`text-[10px] font-black uppercase tracking-widest ${error ? 'text-red-500' : 'text-gray-400'}`}>{label}</label>
      {error && <AlertCircle size={12} className="text-red-500" />}
    </div>
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#1E4D8C]'}`}><Icon size={16} /></div>
      <input 
        name={name} 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        max={max}
        className={`w-full h-11 pl-11 ${isPassword ? 'pr-12' : 'pr-4'} rounded-2xl text-sm font-bold outline-none transition-all border ${error ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-transparent focus:ring-4 focus:ring-blue-100'}`} 
      />
      {isPassword && (
        <button 
          type="button"
          onClick={toggleVisible}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E4D8C] transition-colors"
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
));

export default CustomerRegistration;