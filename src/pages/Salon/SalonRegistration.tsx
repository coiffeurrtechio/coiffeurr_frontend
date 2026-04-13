import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, User, MapPin, Clock, ArrowRight, ArrowLeft,
  Smartphone, Hash, Mail, Loader2, Lock, Coffee,
  CheckCircle2, XCircle, Navigation, Globe, LocateFixed, 
  AlertCircle, ShieldCheck, Eye, EyeOff, Camera
} from 'lucide-react';
import { Button } from '../../components/ui_components/button';
import Config from '../../configs/config';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SalonRegistration: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // State for GPS loading
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    email: '',
    password: '',
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

      const response = await fetch(`${Config.API_AUTH_URL}/upload/salon-images`, {
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
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="Enter WhatsApp Number *" name="primaryPhone" type="tel" value={formData.primaryPhone} onChange={handleChange} icon={Smartphone} placeholder="9876543210" />
            <Button onClick={() => handleSendOTP('phone')} disabled={isLoading || formData.primaryPhone.length !== 10} className="w-full h-12 rounded-2xl bg-[#1E4D8C] text-white font-bold">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Send Phone OTP'}
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="Phone OTP *" name="otp" value={formData.otp} onChange={handleChange} icon={Hash} placeholder="00000" />
            <Button onClick={() => handleVerifyOTP('phone')} disabled={isLoading || !formData.otp} className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-bold">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Phone'}
            </Button>
            <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 w-full text-center">Change Phone Number</button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="owner@salon.com" />
            <Button onClick={() => handleSendOTP('email')} disabled={isLoading || !formData.email} className="w-full h-12 rounded-2xl bg-[#1E4D8C] text-white font-bold">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Send Email OTP'}
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="Email OTP *" name="otp" value={formData.otp} onChange={handleChange} icon={Hash} placeholder="00000" />
            <Button onClick={() => handleVerifyOTP('email')} disabled={isLoading || !formData.otp} className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-bold">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Email'}
            </Button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50 relative flex items-center justify-center">
                  {isUploading ? <Loader2 className="animate-spin text-[#1E4D8C]" /> : 
                   formData.image_url ? <img src={formData.image_url} className="w-full h-full object-cover" /> : <Store className="text-gray-300" size={30} />}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-[#1E4D8C] text-white rounded-full border-2 border-white shadow-lg"><Camera size={12} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
              <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Studio Logo</p>
            </div>
            <InputField label="Salon Name *" name="salonName" value={formData.salonName} onChange={handleChange} icon={Store} placeholder="Elite Hair Studio" />
            <InputField label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} icon={User} placeholder="John Doe" />
            <div className="relative">
              <InputField label="Password *" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} icon={Lock} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[34px] text-gray-400 hover:text-[#1E4D8C]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button onClick={() => setStep(6)} className="w-full h-12 rounded-2xl bg-[#1E4D8C] text-white font-bold">Next: Location & Hours</Button>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            <InputField label="Street *" name="address.street" value={formData.address.street} onChange={handleChange} icon={MapPin} />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="City *" name="address.city" value={formData.address.city} onChange={handleChange} icon={MapPin} />
              <InputField label="Zip *" name="address.pincode" value={formData.address.pincode} onChange={handleChange} icon={Hash} />
            </div>

            {/* NEW: GPS Section */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Navigation size={12}/> GPS Coordinates
                </p>
                <button 
                  type="button" 
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="text-[10px] font-bold text-[#1E4D8C] hover:underline flex items-center gap-1"
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
            
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <p className="text-[10px] font-black text-[#1E4D8C] uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Shift Timing</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Opens" name="timing.openingTime" type="time" value={formData.timing.openingTime} onChange={handleChange} icon={Clock} />
                <InputField label="Closes" name="timing.closingTime" type="time" value={formData.timing.closingTime} onChange={handleChange} icon={Clock} />
              </div>
            </div>

            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2"><Coffee size={12}/> Lunch Break</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Starts" name="timing.lunchBreak.start" type="time" value={formData.timing.lunchBreak.start} onChange={handleChange} icon={Clock} />
                <InputField label="Ends" name="timing.lunchBreak.end" type="time" value={formData.timing.lunchBreak.end} onChange={handleChange} icon={Clock} />
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading} className="w-full h-14 bg-[#1E4D8C] text-white font-black rounded-2xl shadow-xl">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Finalize Registration'}
            </Button>
            <button onClick={() => setStep(5)} className="text-xs font-bold text-gray-400 w-full text-center">Back to Details</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4 relative font-sans">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="pt-8 px-8 flex justify-between gap-2">
          {[1, 2, 3, 4, 5, 6].map(num => <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-[#1E4D8C]' : 'bg-gray-100'}`} />)}
        </div>
        <div className="p-8 md:p-10">
          <header className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Studio Registration</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Section {step} of 6</p>
          </header>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

const InputField = React.memo(({ label, name, value, onChange, icon: Icon, type = "text", placeholder, error }: any) => (
  <div className="space-y-1 w-full">
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
        step="any" // Required for float numbers in input type number
        className={`w-full h-11 pl-11 pr-4 rounded-2xl text-sm font-bold outline-none transition-all border ${error ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-transparent focus:ring-4 focus:ring-blue-100'}`} 
      />
    </div>
  </div>
));

export default SalonRegistration;