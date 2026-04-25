import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, User, MapPin, Clock, ArrowRight, ArrowLeft,
  Smartphone, Hash, Mail, Loader2, Lock, Coffee,
  CheckCircle2, XCircle, Navigation, Globe, LocateFixed,
  AlertCircle, ShieldCheck, Eye, EyeOff, Camera, X
} from 'lucide-react';
import { Button } from '../../components/ui_components/button';
import Config from '../../configs/config';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import '../../styles/classy-salon.css';
import Sponser_Footer from '../../components/Sponser_Footer';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SalonRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // Force English when user is not logged in
  useEffect(() => {
    if (!isloggedin) {
      i18n.changeLanguage('en');
    }
  }, [isloggedin]);
  
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // State for GPS loading
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    primaryPhone: '',
    otp: '',
    image_url: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    location: { latitude: 0, longitude: 0 }, // GPS State
    timing: {
      openingTime: '',
      closingTime: '',
      lunchBreak: { start: '', end: '' },
      weeklyOff: [] as string[]
    },
  });

  // --- API HANDLERS ---

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const validatePassword = (password: string) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password)
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(v => v);
  };

  // NEW: GPS Detection Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotification({ type: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        }));
        setIsLocating(false);
        setNotification({ type: 'success', message: 'Location locked successfully!' });
      },
      (error) => {
        setIsLocating(false);
        setNotification({ type: 'error', message: 'Unable to retrieve location. Please enter manually.' });
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("files", file);
      uploadData.append("salon_id", formData.primaryPhone); 

      const response = await fetch(`${Config.API_Customers}/upload/salon-images`, {
        method: "POST",
        body: uploadData,
      });
      const res = await response.json();
      const url = res?.data?.urls?.[0] || res?.data?.data?.urls?.[0];

      if (url) {
        setFormData(prev => ({ ...prev, image_url: url }));
        setNotification({ type: 'success', message: 'Logo uploaded!' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Logo upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendOTP = async (method: 'phone' | 'email') => {
    setIsLoading(true);
    try {
      const payload = {
        email: method === 'email' ? formData.email : null,
        phone: method === 'phone' ? formData.primaryPhone : null,
        username: formData.ownerName || "SalonOwner"
      };
      const response = await fetch(`${Config.API_AUTH_URL}/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData?.detail || "Failed to send OTP");
      setNotification({ type: 'success', message: `OTP sent to ${method}` });
      setStep(step + 1);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally { setIsLoading(false); }
  };

  const handleVerifyOTP = async (method: 'phone' | 'email') => {
    setIsLoading(true);
    try {
      const payload = {
        email: method === 'email' ? formData.email : null,
        phone: method === 'phone' ? formData.primaryPhone : null,
        otp: formData.otp
      };
      const response = await fetch(`${Config.API_AUTH_URL}/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Invalid OTP");
      setNotification({ type: 'success', message: 'Verified!' });
      setFormData(prev => ({ ...prev, otp: '' })); 
      setStep(step + 1);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally { setIsLoading(false); }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const formatTime = (t: string) => t && t.length === 5 ? `${t}:00` : t;
    const finalPayload = {
      ...formData,
      timing: {
        ...formData.timing,
        openingTime: formatTime(formData.timing.openingTime),
        closingTime: formatTime(formData.timing.closingTime),
        lunchBreak: {
          start: formatTime(formData.timing.lunchBreak.start),
          end: formatTime(formData.timing.lunchBreak.end),
        }
      }
    };

    try {
      const response = await fetch(`${Config.API_BASE_URL}/create-salon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });
      if (!response.ok) throw new Error('Registration failed');
      setNotification({ type: 'success', message: 'Registered successfully!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (name === 'primaryPhone') {
      const sanitized = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newState = JSON.parse(JSON.stringify(prev));
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
        current[keys[keys.length - 1]] = type === 'number' ? parseFloat(value) : value;
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 slide-in-right staggered-1">
            <InputField label="Enter WhatsApp Number *" name="primaryPhone" type="tel" value={formData.primaryPhone} onChange={handleChange} icon={Smartphone} placeholder="9876543210" />
            <Button onClick={() => handleSendOTP('phone')} disabled={isLoading || formData.primaryPhone.length !== 10} className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Send Phone OTP'}
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 slide-in-right staggered-1">
            <InputField label="Phone OTP *" name="otp" value={formData.otp} onChange={handleChange} icon={Hash} placeholder="00000" />
            <Button onClick={() => handleVerifyOTP('phone')} disabled={isLoading || !formData.otp} className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Phone'}
            </Button>
            <button onClick={() => setStep(1)} className="w-full text-[10px] font-black text-white/50 hover:text-white py-2 rounded-full transition-colors text-button">Back</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 slide-in-right staggered-1">
            <InputField label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="owner@salon.com" />
            <Button onClick={() => handleSendOTP('email')} disabled={isLoading || !formData.email} className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Send Email OTP'}
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 slide-in-right staggered-1">
            <InputField label="Email OTP *" name="otp" value={formData.otp} onChange={handleChange} icon={Hash} placeholder="00000" />
            <Button onClick={() => handleVerifyOTP('email')} disabled={isLoading || !formData.otp} className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Email'}
            </Button>
            <button onClick={() => setStep(3)} className="w-full text-[10px] font-black text-white/50 hover:text-white py-2 rounded-full transition-colors text-button">Back</button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 slide-in-right staggered-1">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white/10 relative">
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#D4AF37]" size={24} />
                    </div>
                  ) : formData.image_url ? (
                    <img src={formData.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="text-white/30" size={30} />
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-white rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform focus-ring"><Camera size={12} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
              <p className="mt-2 text-[9px] font-black text-white/50 tracking-widest">Studio Logo</p>
            </div>
            <InputField label="Salon Name *" name="salonName" value={formData.salonName} onChange={handleChange} icon={Store} placeholder="Elite Hair Studio" />
            <InputField label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} icon={User} placeholder="John Doe" />
            <div className="space-y-2">
              <label className="dark-label ml-1">Password *</label>
              <div className={`relative input-wrapper ${errors.password ? 'error' : ''}`}>
                <Lock className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.password ? "text-[#DC143C]" : ""}`} size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    validatePassword(e.target.value);
                  }}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-14 pr-12 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors focus-ring z-10"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password Requirements */}
              <div className="space-y-1 mt-2 px-1">
                <div className={`flex items-center gap-2 text-[10px] font-medium ${passwordValidation.minLength ? 'text-emerald-400' : 'text-white/50'}`}>
                  {passwordValidation.minLength ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-medium ${passwordValidation.hasUpperCase ? 'text-emerald-400' : 'text-white/50'}`}>
                  {passwordValidation.hasUpperCase ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>At least one uppercase letter</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-medium ${passwordValidation.hasNumber ? 'text-emerald-400' : 'text-white/50'}`}>
                  {passwordValidation.hasNumber ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>At least one number</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-medium ${passwordValidation.hasSpecialChar ? 'text-emerald-400' : 'text-white/50'}`}>
                  {passwordValidation.hasSpecialChar ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>At least one special character</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="dark-label ml-1">Confirm Password *</label>
              <div className={`relative input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
                <Lock className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.confirmPassword ? "text-[#DC143C]" : ""}`} size={18} />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-14 pr-12 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.confirmPassword ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors focus-ring z-10"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button onClick={() => {
              if (!isPasswordValid()) {
                setNotification({ type: 'error', message: 'Please meet all password requirements' });
                return;
              }
              if (formData.password !== formData.confirmPassword) {
                setNotification({ type: 'error', message: 'Passwords do not match' });
                return;
              }
              setStep(6);
            }} className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30">Next: Location & Hours</Button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 slide-in-right max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
            <InputField label="Street *" name="address.street" value={formData.address.street} onChange={handleChange} icon={MapPin} />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="City *" name="address.city" value={formData.address.city} onChange={handleChange} icon={MapPin} />
              <InputField label="Zip *" name="address.pincode" value={formData.address.pincode} onChange={handleChange} icon={Hash} />
            </div>

            {/* GPS Section */}
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <Navigation size={12}/> GPS Coordinates
                </p>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="text-[10px] font-bold text-[#D4AF37] hover:text-[#FFD700] flex items-center gap-1"
                >
                  {isLocating ? <Loader2 size={10} className="animate-spin" /> : <LocateFixed size={10} />}
                  Auto-Detect
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Latitude" name="location.latitude" type="number" value={formData.location.latitude} onChange={handleChange} icon={Navigation} placeholder="0.0000" />
                <InputField label="Longitude" name="location.longitude" type="number" value={formData.location.longitude} onChange={handleChange} icon={Navigation} placeholder="0.0000" />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Shift Timing</p>
              <div className="grid grid-cols-2 gap-3">
                <TimeDropdown label="Opens" name="timing.openingTime" value={formData.timing.openingTime} onChange={handleChange} icon={Clock} />
                <TimeDropdown label="Closes" name="timing.closingTime" value={formData.timing.closingTime} onChange={handleChange} icon={Clock} />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
              <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2"><Coffee size={12}/> Lunch Break</p>
              <div className="grid grid-cols-2 gap-3">
                <TimeDropdown label="Starts" name="timing.lunchBreak.start" value={formData.timing.lunchBreak.start} onChange={handleChange} icon={Clock} />
                <TimeDropdown label="Ends" name="timing.lunchBreak.end" value={formData.timing.lunchBreak.end} onChange={handleChange} icon={Clock} />
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Finalize Registration'}
            </Button>
            <button onClick={() => setStep(5)} className="w-full text-[10px] font-black text-white/50 hover:text-white py-2 rounded-full transition-colors text-button">Back</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen classy-salon-bg font-sans relative overflow-hidden flex flex-col">
      <div className="classy-overlay" />

      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 glass-card ${notification.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-bold text-white">{notification.message}</span>
        </div>
      )}

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-4 pb-12">
        <div className="w-full max-w-[450px] glass-card border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl p-4">
          {/* Coiffeurr Logo */}
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 mx-auto shadow-lg border border-white/20 transition-transform hover:scale-105 duration-300">
            <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-10 h-10 object-contain" />
          </div>

          <div className="pt-8 px-8 flex justify-between gap-2">
            {[1, 2, 3, 4, 5, 6].map(num => <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]' : 'bg-white/10'}`} />)}
          </div>

          <div className="p-8 md:p-10">
            <header className="mb-8 text-center">
              <h1
                className="text-2xl font-bold text-white tracking-tight letter-reveal"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Studio Registration
              </h1>
              <p className="punch-line text-[9px] letter-reveal tracking-widest" style={{ animationDelay: '0.2s' }}>
                Your journey to excellence begins here.
              </p>
              <p className="text-xs text-white/60 font-bold uppercase tracking-widest mt-2 letter-reveal" style={{ animationDelay: '0.3s' }}>
                Section {step} of 6
              </p>
            </header>
            {renderStep()}
          </div>
        </div>
      </div>
      <Sponser_Footer collapsed={false} />
    </div>
  );
};

const InputField = React.memo(({ label, name, value, onChange, icon: Icon, type = "text", placeholder, error }: any) => (
  <div className="space-y-2 w-full">
    <label className={`dark-label ml-1 ${error ? 'text-red-400' : ''}`}>{label}</label>
    <div className={`relative input-wrapper ${error ? 'error' : ''}`}>
      <Icon className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${error ? "text-[#DC143C]" : ""}`} size={18} />
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step="any"
        className={`w-full h-12 pl-14 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 ${error ? "error" : ""}`}
      />
    </div>
  </div>
));

const TimeDropdown = React.memo(({ label, name, value, onChange, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate time options in 24-hour format (00:00 to 23:45 in 15-min intervals)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      timeOptions.push(timeStr);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (time: string) => {
    onChange({ target: { name, value: time } } as React.ChangeEvent<HTMLInputElement>);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({ target: { name, value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 w-full" ref={dropdownRef}>
      <label className="dark-label ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" size={18} />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 pl-14 dark-input text-sm font-bold outline-none transition-all duration-300 text-left flex items-center"
        >
          <span className={value ? 'text-white' : 'text-white/40'}>
            {value || 'Select time'}
          </span>
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors z-10"
          >
            <X size={14} />
          </button>
        )}
        
        {isOpen && (
          <div className="absolute z-[100] w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar bottom-full mb-2">
            <div className="p-2 space-y-1">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleSelect(time)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 text-left ${
                    value === time
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default SalonRegistration;