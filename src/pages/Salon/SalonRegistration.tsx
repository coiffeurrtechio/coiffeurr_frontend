import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store, User, MapPin, Clock, ArrowRight, ArrowLeft,
  Smartphone, Hash, Mail, Loader2, Lock, Coffee,
  CheckCircle2, XCircle, Navigation, Globe, LocateFixed, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui_components/button';
import Config from '../../configs/config';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SalonRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    salonName: '',
    ownerName: '',
    email: '',
    password: '',
    primaryPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    location: {
      latitude: 0,
      longitude: 0
    },
    timing: {
      openingTime: '',
      closingTime: '',
      lunchBreak: {
        start: '',
        end: ''
      },
      weeklyOff: [] as string[]
    },
    branding: {
      logoUrl: '',
      coverImages: [] as string[]
    },
  });

  // --- VALIDATION LOGIC: MAKING EVERYTHING COMPULSORY ---
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.salonName.trim()) newErrors.salonName = "Salon name is required";
      if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required";

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) newErrors.email = "Valid email is required";

      if (formData.password.length < 6) newErrors.password = "Min 6 characters required";
      if (formData.primaryPhone.length !== 10) newErrors.primaryPhone = "10-digit phone required";
    }

    if (currentStep === 2) {
      if (!formData.address.street.trim()) newErrors['address.street'] = "Street is required";
      if (!formData.address.city.trim()) newErrors['address.city'] = "City is required";
      if (!formData.address.state.trim()) newErrors['address.state'] = "State is required";
      if (!/^\d{6}$/.test(formData.address.pincode)) newErrors['address.pincode'] = "Valid 6-digit pincode required";
      if (formData.location.latitude === 0 || formData.location.longitude === 0) {
        newErrors.location = "GPS coordinates are compulsory";
      }
    }

    if (currentStep === 3) {
      if (formData.timing.openingTime >= formData.timing.closingTime) {
        newErrors['timing.openingTime'] = "Opening must be before closing";
      }
      if (formData.timing.lunchBreak.start >= formData.timing.lunchBreak.end) {
        newErrors['timing.lunchBreak.start'] = "Break start must be before end";
      }
      if (formData.timing.weeklyOff.length === 0) {
        newErrors.weeklyOff = "Please select at least one weekly off day";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCoverImage = () => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        coverImages: [...prev.branding.coverImages, '']
      }
    }));
  };

  const handleCoverImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.branding.coverImages];
    updatedImages[index] = value;
    setFormData(prev => ({
      ...prev,
      branding: { ...prev.branding, coverImages: updatedImages }
    }));
  };

  const removeCoverImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        coverImages: prev.branding.coverImages.filter((_, i) => i !== index)
      }
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // 1. INPUT MASKING: Phone number must be digits only and max 10
    if (name === 'primaryPhone') {
      const sanitized = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: sanitized }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }

    const finalValue = type === 'number' ? parseFloat(value) : value;

    // Clear field-specific error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newState = JSON.parse(JSON.stringify(prev));
        let current = newState;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = finalValue;
        return newState;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
      setErrors({});
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotification({ type: 'error', message: 'Geolocation not supported' });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: { latitude: position.coords.latitude, longitude: position.coords.longitude }
        }));
        setIsLocating(false);
        setNotification({ type: 'success', message: 'Location detected!' });
        setErrors(prev => {
          const { location, ...rest } = prev;
          return rest;
        });
      },
      () => {
        setIsLocating(false);
        setNotification({ type: 'error', message: 'Location access denied' });
      }
    );
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    const formatTime = (timeStr: string) => timeStr.length === 5 ? `${timeStr}:00` : timeStr;

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
      setNotification({ type: 'success', message: 'Salon registered! Redirecting...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="Salon Name *" name="salonName" value={formData.salonName} onChange={handleChange} icon={Store} placeholder="Elite Hair Studio" error={errors.salonName} />
            <InputField label="Owner Name *" name="ownerName" value={formData.ownerName} onChange={handleChange} icon={User} placeholder="John Doe" error={errors.ownerName} />
            <InputField label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="owner@salon.com" error={errors.email} />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Password *" name="password" type="password" value={formData.password} onChange={handleChange} icon={Lock} placeholder="••••••••" error={errors.password} />
              <InputField label="Primary Phone *" name="primaryPhone" type="tel" value={formData.primaryPhone} onChange={handleChange} icon={Smartphone} placeholder="9876543210" error={errors.primaryPhone} />
            </div>


            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Branding (Optional)</p>

              <InputField
                label="Logo URL"
                name="branding.logoUrl"
                value={formData.branding.logoUrl}
                onChange={handleChange}
                icon={Globe}
                placeholder="https://image.com/logo.png"
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400">Cover Images</label>
                  <button
                    type="button"
                    onClick={handleAddCoverImage}
                    className="text-[10px] font-bold text-[#1E4D8C] hover:underline"
                  >
                    + Add Image
                  </button>
                </div>

                {formData.branding.coverImages.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <InputField
                        label=""
                        name={`cover-${index}`}
                        value={url}
                        onChange={(e: any) => handleCoverImageChange(index, e.target.value)}
                        icon={Globe}
                        placeholder="Image URL"
                      />
                    </div>
                    <button
                      onClick={() => removeCoverImage(index)}
                      className="h-11 px-3 mt-1 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>




          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <InputField label="Street Address *" name="address.street" value={formData.address.street} onChange={handleChange} icon={MapPin} placeholder="123 Main St" error={errors['address.street']} />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="City *" name="address.city" value={formData.address.city} onChange={handleChange} icon={MapPin} placeholder="Mumbai" error={errors['address.city']} />
              <InputField label="Zip Code *" name="address.pincode" value={formData.address.pincode} onChange={handleChange} icon={Hash} placeholder="400001" error={errors['address.pincode']} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="State *" name="address.state" value={formData.address.state} onChange={handleChange} icon={MapPin} placeholder="Maharashtra" error={errors['address.state']} />
              <InputField label="Country *" name="address.country" value={formData.address.country} onChange={handleChange} icon={Globe} placeholder="India" />
            </div>
            <div className={`p-4 rounded-2xl border transition-colors ${errors.location ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-100'} space-y-3`}>
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-widest ${errors.location ? 'text-red-600' : 'text-slate-500'}`}>Geo Location *</p>
                <button type="button" onClick={handleGetCurrentLocation} className="text-[10px] font-bold text-[#1E4D8C] flex items-center gap-1 hover:underline">
                  {isLocating ? <Loader2 size={10} className="animate-spin" /> : <LocateFixed size={10} />} Auto-Detect
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Latitude" name="location.latitude" type="number" value={formData.location.latitude} onChange={handleChange} icon={Navigation} />
                <InputField label="Longitude" name="location.longitude" type="number" value={formData.location.longitude} onChange={handleChange} icon={Navigation} />
              </div>
              {errors.location && <p className="text-[10px] text-red-500 font-bold text-center">{errors.location}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <p className="text-[10px] font-black text-[#1E4D8C] uppercase text-center tracking-widest">Business Hours *</p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Opens" name="timing.openingTime" type="time" value={formData.timing.openingTime} onChange={handleChange} icon={Clock} error={errors['timing.openingTime']} />
                <InputField label="Closes" name="timing.closingTime" type="time" value={formData.timing.closingTime} onChange={handleChange} icon={Clock} />
              </div>
            </div>

            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Coffee size={14} className="text-orange-600" />
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Lunch Break *</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="From" name="timing.lunchBreak.start" type="time" value={formData.timing.lunchBreak.start} onChange={handleChange} icon={Clock} error={errors['timing.lunchBreak.start']} />
                <InputField label="To" name="timing.lunchBreak.end" type="time" value={formData.timing.lunchBreak.end} onChange={handleChange} icon={Clock} />
              </div>
            </div>

            <div className={`p-3 rounded-2xl border transition-all ${errors.weeklyOff ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
              <p className={`text-[10px] font-black uppercase mb-2 ${errors.weeklyOff ? 'text-red-600' : 'text-gray-400'}`}>Weekly Off *</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setFormData(p => ({ ...p, timing: { ...p.timing, weeklyOff: p.timing.weeklyOff.includes(day) ? p.timing.weeklyOff.filter(d => d !== day) : [...p.timing.weeklyOff, day] } }));
                      if (errors.weeklyOff) setErrors(prev => ({ ...prev, weeklyOff: '' }));
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${formData.timing.weeklyOff.includes(day) ? "bg-[#1E4D8C] text-white border-[#1E4D8C]" : "bg-white text-gray-400 border-gray-200"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.weeklyOff && <p className="text-[9px] text-red-500 font-bold mt-2">{errors.weeklyOff}</p>}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4 relative font-sans">
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-white border-green-500 text-green-600' : 'bg-white border-red-500 text-red-600'
          } border-l-4`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="pt-8 px-8 flex justify-between gap-2">
          {[1, 2, 3].map(num => <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-[#1E4D8C]' : 'bg-gray-100'}`} />)}
        </div>
        <div className="p-8 md:p-10">
          <header className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Studio Registration</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Step {step} of 3</p>
          </header>
          {renderStep()}
          <footer className="mt-10 flex gap-3">
            {step > 1 && <Button disabled={isLoading} onClick={() => setStep(s => s - 1)} className="flex-1 h-12 rounded-2xl bg-gray-50 text-gray-400 font-bold hover:bg-gray-100"><ArrowLeft size={16} /></Button>}
            <Button disabled={isLoading} onClick={() => step < 3 ? handleNext() : handleSubmit()} className="flex-[2] h-12 rounded-2xl bg-[#1E4D8C] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#153a6b]">
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : (step === 3 ? 'Complete Setup' : 'Next Step')}
              {!isLoading && <ArrowRight size={16} />}
            </Button>
          </footer>
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
        className={`w-full h-11 pl-11 pr-4 rounded-2xl text-sm font-bold outline-none transition-all border ${error
          ? 'bg-red-50 border-red-200 focus:ring-4 focus:ring-red-100'
          : 'bg-gray-50 border-transparent focus:ring-4 focus:ring-blue-100'
          }`}
      />
    </div>
    {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
  </div>
));

export default SalonRegistration;