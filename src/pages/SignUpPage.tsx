import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ArrowRight, Smartphone, Loader2, Lock,
  CheckCircle2, AlertCircle, ShieldCheck, Camera,
  CalendarDays, VenusAndMars, Eye, EyeOff, Info
} from 'lucide-react';
import { Button } from '../components/ui_components/button';
import Config from '../configs/config';
import { useDispatch } from 'react-redux';
import { login } from '../utils/Storage/slice/authSlice';
import { useToast } from '../components/Toast';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import '../styles/classy-salon.css';
import Sponser_Footer from '../components/Sponser_Footer';

const CustomerRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // Force English when user is not logged in
  useEffect(() => {
    if (!isloggedin) {
      i18n.changeLanguage('en');
    }
  }, [isloggedin]);

  // Real-time password validation
  const passwordIssues = useMemo(() => {
    const issues = [];
    if (formData.password.length > 0) {
      if (formData.password.length < 8) issues.push(t('auth.passwordMinLength'));
      if (!/[A-Z]/.test(formData.password)) issues.push(t('auth.passwordUppercase'));
      if (!/[0-9]/.test(formData.password)) issues.push(t('auth.passwordNumber'));
      if (!/[!@#$%^&*]/.test(formData.password)) issues.push(t('auth.passwordSpecial'));
    }
    return issues;
  }, [formData.password, t]);

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
      setErrors({ phone: t('auth.invalidCredentials') });
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
      if (!response.ok) throw new Error(resData?.detail || t('auth.signupFailed'));
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
    if (!formData.otp) newErrors.otp = t('auth.requiredField');
    if (!formData.username) newErrors.username = t('auth.requiredField');
    if (passwordIssues.length > 0) newErrors.password = t('auth.requiredField');
    if (!formData.password) newErrors.password = t('auth.requiredField');
    if (!formData.dob) newErrors.dob = t('auth.requiredField');

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
      if (!response.ok) throw new Error(resData?.detail || t('auth.signupFailed'));

      dispatch(login({ user: resData }));

      // Set language from user preference in signup response, default to English if not set
      const languagePreference = resData?.user?.language_preference || 'en';
      if (['en', 'hi', 'mr'].includes(languagePreference)) {
        i18n.changeLanguage(languagePreference);
        localStorage.setItem('selectedLanguage', languagePreference);
      } else {
        i18n.changeLanguage('en');
        localStorage.setItem('selectedLanguage', 'en');
      }

      showToast({
        type: "success",
        title: t('auth.signupSuccess'),
        message: t('auth.signupSuccess'),
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
    <div className="min-h-screen classy-salon-bg flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="classy-overlay" />
      
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 glass-card ${notification.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold text-white">{notification.message}</span>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md glass-card rounded-[2.5rem] overflow-hidden flex-1 flex flex-col justify-center">
        <div className="pt-8 px-8 flex justify-between gap-2">
          {[1, 2].map(num => <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]' : 'bg-white/10'}`} />)}
        </div>

        <div className="p-8">
          <header className="mb-8 text-center">
            <div className="mx-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/20 transition-transform hover:scale-105 duration-300">
              <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-14 h-14 object-contain" />
            </div>
            <h1 
              className="text-3xl font-bold text-white tracking-tight letter-reveal"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {t('auth.register')}
            </h1>
            <p className="punch-line letter-reveal" style={{ animationDelay: '0.2s' }}>
              Your journey to excellence begins here.
            </p>
            <p className="text-xs text-white/60 font-bold tracking-widest mt-2 letter-reveal" style={{ animationDelay: '0.3s' }}>
              {t('auth.stepOf', { current: step, total: 2 })}
            </p>
          </header>

          {step === 1 ? (
            <div className="space-y-6 slide-in-right">
              <div className="space-y-2 staggered-1">
                <label className="dark-label ml-1">{t('auth.enterPhone')} *</label>
                <div className={`relative input-wrapper ${errors.phone ? 'error' : ''}`}>
                  <Smartphone className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.phone ? "text-[#DC143C]" : ""}`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full h-12 pl-14 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.phone ? "error" : ""}`}
                  />
                </div>
              </div>
              <Button onClick={handleSendOTP} disabled={isLoading || formData.phone.length < 10} className={`w-full h-14 shimmer-button text-white font-extrabold rounded-2xl staggered-2 focus-ring ${isLoading ? 'loading-state' : ''}`}>
                {isLoading ? <Loader2 className="animate-spin" /> : t('auth.getVerificationCode')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 slide-in-right max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">

              {/* PHOTO SECTION */}
              <div className="flex flex-col items-center justify-center mb-4 staggered-1">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white/10 relative">
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                      </div>
                    ) : formData.image_url ? (
                      <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-br from-[#D4AF37] to-[#FFD700] text-white rounded-full border-2 border-white shadow-lg active:scale-90 transition-transform focus-ring">
                    <Camera size={12} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                </div>
                <p className="mt-2 text-[9px] font-black text-white/50 tracking-widest">{t('auth.addPhoto')}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 mb-2 staggered-2">
                <div className="space-y-2">
                  <label className="dark-label ml-1">{t('auth.verificationCode')} *</label>
                  <div className={`relative input-wrapper ${errors.otp ? 'error' : ''}`}>
                    <ShieldCheck className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.otp ? "text-[#DC143C]" : ""}`} />
                    <input
                      name="otp"
                      type="tel"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder={t('auth.enterOTP')}
                      maxLength={6}
                      className={`w-full h-12 pl-18 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.otp ? "error" : ""}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 staggered-3">
                <label className="dark-label ml-1">{t('auth.fullName')} *</label>
                <div className={`relative input-wrapper ${errors.username ? 'error' : ''}`}>
                  <User className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.username ? "text-[#DC143C]" : ""}`} />
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t('auth.fullName')}
                    className={`w-full h-12 pl-18 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.username ? "error" : ""}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 staggered-4">
                <div className="space-y-2">
                  <label className="dark-label ml-1">{t('auth.gender')}</label>
                  <div className="relative group">
                    <VenusAndMars className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" size={18} />
                    <select name="gender" className="w-full h-11 pl-18 pr-4 dark-input text-sm font-bold outline-none appearance-none focus-ring transition-all duration-300" value={formData.gender} onChange={handleChange}>
                      <option value="male" className="bg-gray-800">Male</option>
                      <option value="female" className="bg-gray-800">Female</option>
                      <option value="other" className="bg-gray-800">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="dark-label ml-1">{t('auth.dateOfBirth')}</label>
                  <div className={`relative input-wrapper ${errors.dob ? 'error' : ''}`}>
                    <CalendarDays className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.dob ? "text-[#DC143C]" : ""}`} size={18} />
                    <input
                        name="dob"
                        type="date"
                        max={maxDate}
                        className={`w-full h-11 pl-18 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.dob ? 'error' : ''}`}
                        value={formData.dob}
                        onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* PASSWORD SECTION with issues display */}
              <div className="space-y-2 staggered-5">
                <label className="dark-label ml-1">{t('auth.securePassword')} *</label>
                <div className={`relative input-wrapper ${errors.password ? 'error' : ''}`}>
                  <Lock className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.password ? "text-[#DC143C]" : ""}`} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full h-12 pl-18 pr-20 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.password ? "error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus-ring z-10"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Real-time Password Requirements Display */}
                {formData.password.length > 0 && passwordIssues.length > 0 && (
                  <div className="bg-red-900/30 p-3 rounded-2xl border border-red-500/30 animate-in slide-in-from-top-1">
                    <div className="flex items-start gap-2">
                      <Info size={12} className="text-red-400 mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {passwordIssues.map((issue, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-red-400 tracking-tight">• {issue}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Success message when password is valid */}
                {formData.password.length >= 8 && passwordIssues.length === 0 && (
                  <div className="flex items-center gap-2 ml-1 animate-in fade-in">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-400">{t('auth.strongPassword')}</span>
                  </div>
                )}
              </div>

              <div className="gold-divider" />

              <Button disabled={isLoading || isUploading} onClick={handleSubmit} className={`w-full h-14 shimmer-button text-white font-extrabold rounded-2xl mt-4 flex items-center justify-center gap-2 staggered-6 focus-ring ${(isLoading || isUploading) ? 'loading-state' : ''}`}>
                {isLoading ? <Loader2 className="animate-spin" /> : t('auth.completeSignup')}
                {!isLoading && <ArrowRight size={18} />}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black text-white/50 hover:text-white py-2 transition-colors text-button">{t('auth.backToMobile')}</button>
              
              <div className="w-full h-px bg-white/10 my-4" />
            </div>
          )}
        </div>
      </div>
      <Sponser_Footer collapsed={false} />
    </div>
  );
};


export default CustomerRegistration;