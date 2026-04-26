import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../utils/Storage/slice/authSlice";
import { useToast } from "../components/Toast";
import { Button } from "../components/ui_components/button";
import { Smartphone, Mail, Lock, Eye, EyeOff, VenusAndMars, CalendarDays, CheckCircle2, X, Loader2, ChevronLeft, ChevronRight, AlertCircle, User, Camera, ShieldCheck, Info } from "lucide-react";
import Config from "../configs/config";
import { useApi } from "../API/SalonsAPIs/ALLSalonAPI";
import Sponser_Footer from "../components/Sponser_Footer";
import GoogleLoginButton from "../components/GoogleLoginButton";

const CustomerRegistration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
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
    setFormData(prev => ({ ...prev, dob: `${year}-${month}-${dayStr}` }));
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Google signup state
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    otp: '',
    gender: 'male',
    dob: '', 
    marital_status: 'single',
    image_url: '',
    agreeToPolicy: false
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
      setOtpSent(true);
      setOtpTimer(300);
      setCanResendOtp(false);
      setStep(2);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
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
      if (!response.ok) {
        if (resData?.detail === "Phone already registered") {
          setErrors({ phone: "Phone already registered" });
          setNotification({ type: 'error', message: "Phone already registered. Please login instead." });
        } else {
          throw new Error(resData?.detail || t('auth.signupFailed'));
        }
        return;
      }
      setNotification({ type: 'success', message: `OTP sent to ${formData.phone}!` });
      setOtpSent(true);
      setOtpTimer(300);
      setCanResendOtp(false);
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
        setNotification({ type: 'success', message: t('auth.photoUploaded') || 'Photo Uploaded!' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: t('auth.uploadFailed') || 'Upload Failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called', formData);
    const newErrors: Record<string, string> = {};
    if (!formData.otp) newErrors.otp = t('auth.requiredField');
    if (!formData.username) newErrors.username = t('auth.requiredField');
    if (passwordIssues.length > 0) newErrors.password = t('auth.requiredField');
    if (!formData.password) newErrors.password = t('auth.requiredField');
    if (!formData.dob) newErrors.dob = t('auth.requiredField');
    if (!formData.agreeToPolicy) newErrors.agreeToPolicy = "Please accept the Terms and Conditions";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const finalPayload = {
      email: formData.email || "",
      phone: formData.phone,
      otp: formData.otp,
      username: formData.username,
      password: formData.password,
      agreeToPolicy: formData.agreeToPolicy,
      gender: formData.gender,
      dob: formData.dob,
      marital_status: formData.marital_status,
      image_url: formData.image_url,
      email_verified: false,  // Email is not verified during signup
      phone_verified: true,   // Phone is verified via OTP
      metadata: { signupSource: "web" }
    };

    console.log('Sending payload:', finalPayload);

    try {
      const response = await fetch(`${Config.API_AUTH_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const resData = await response.json();
      console.log('API response:', resData);
      
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
      console.error('Signup error:', error);
      showToast({
        type: "error",
        title: t('auth.signupFailed'),
        message: error.message || t('auth.signupFailed'),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'otp') {
      const sanitized = value.replace(/[^0-9]/g, '');
      const limit = name === 'phone' ? 10 : 5;
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

  // OTP countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (otpSent && otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const handleGoogleLoginSuccess = (credentialResponse: any) => {
    setGoogleUserData({ idToken: credentialResponse.credential });
    setShowWhatsAppModal(true);
    setIsLoading(false);
  };

  const handleSendWhatsAppOtp = async () => {
    if (!whatsappNumber || whatsappNumber.length < 10) {
      showToast({
        type: "error",
        title: "Invalid Number",
        message: "Please enter a valid 10-digit WhatsApp number",
        duration: 5000,
      });
      return;
    }

    try {
      setIsSendingOtp(true);
      const response = await fetch(`${Config.API_AUTH_URL}/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: whatsappNumber }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData?.detail || 'Failed to send OTP');

      setOtpSent(true);
      setOtpTimer(300);
      setCanResendOtp(false);
      showToast({
        type: "success",
        title: "OTP Sent",
        message: "OTP sent to your WhatsApp number",
        duration: 5000,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Failed to Send OTP",
        message: error.message,
        duration: 5000,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleWhatsAppSubmit = async () => {
    if (!googleUserData || !googleUserData.idToken) return;

    try {
      setIsVerifyingOtp(true);
      const response = await fetch(`${Config.API_AUTH_URL}/google-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_token: googleUserData.idToken,
          phone: whatsappNumber || null,
          otp: whatsappOtp || null,
          email_verified: true,  // Google verifies email
          phone_verified: whatsappOtp ? true : false  // Phone verified if OTP provided
        }),
        credentials: 'include',
      });

      const resData = await response.json();
      if (!response.ok) {
        // Check if email is already registered
        if (resData?.detail?.includes('already registered') || resData?.detail?.includes('Email already')) {
          showToast({
            type: "error",
            title: "Email Already Registered",
            message: "Please login instead",
            duration: 5000,
          });
          setTimeout(() => {
            globalThis.location.href = '/login';
          }, 1500);
          return;
        }
        throw new Error(resData?.detail || 'Signup failed');
      }

      dispatch(login({ user: { ...resData.user, access_token: resData.access_token } }));

      showToast({
        type: "success",
        title: "Signup Successful",
        message: "Welcome to Coiffeurr!",
        duration: 5000,
      });

      globalThis.location.href = globalThis.location.origin;
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Signup Failed",
        message: error.message,
        duration: 5000,
      });
    } finally {
      setIsVerifyingOtp(false);
      setShowWhatsAppModal(false);
    }
  };

  const handleSkipWhatsApp = async () => {
    if (!googleUserData || !googleUserData.idToken) return;

    try {
      setIsVerifyingOtp(true);
      const response = await fetch(`${Config.API_AUTH_URL}/google-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_token: googleUserData.idToken,
          phone: null,
          otp: null,
          email_verified: true,  // Google verifies email
          phone_verified: false  // Phone not provided/verified
        }),
        credentials: 'include',
      });

      const resData = await response.json();
      if (!response.ok) {
        // Check if email is already registered
        if (resData?.detail?.includes('already registered') || resData?.detail?.includes('Email already')) {
          showToast({
            type: "error",
            title: "Email Already Registered",
            message: "Please login instead",
            duration: 5000,
          });
          setTimeout(() => {
            globalThis.location.href = '/login';
          }, 1500);
          return;
        }
        throw new Error(resData?.detail || 'Signup failed');
      }

      dispatch(login({ user: { ...resData.user, access_token: resData.access_token } }));

      showToast({
        type: "success",
        title: "Signup Successful",
        message: "Welcome to Coiffeurr!",
        duration: 5000,
      });

      globalThis.location.href = globalThis.location.origin;
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Signup Failed",
        message: error.message,
        duration: 5000,
      });
    } finally {
      setIsVerifyingOtp(false);
      setShowWhatsAppModal(false);
    }
  };

  return (
    <div className="min-h-screen classy-salon-bg flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="classy-overlay" />
      
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 glass-card ${notification.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-bold text-white">{notification.message}</span>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md mx-auto glass-card rounded-[2.5rem] overflow-hidden">
        <div className="pt-6 sm:pt-8 px-6 sm:px-8 flex justify-between gap-2">
          {[1, 2].map(num => <div key={num} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]' : 'bg-white/10'}`} />)}
        </div>

        <div className="p-6 sm:p-8">
          <header className="mb-6 sm:mb-8 text-center">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg border border-white/20 transition-transform hover:scale-105 duration-300">
              <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
            </div>
            <h1 
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight letter-reveal"
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
            <div className="space-y-4 sm:space-y-6 slide-in-right">
              {/* Google Signup - Prominent at top */}
              <div className="staggered-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-xs font-bold text-white/50 tracking-widest uppercase">Quick Signup</span>
                  <div className="flex-1 h-px bg-white/20" />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs text-white/50">sign up with google</p>
                  <GoogleLoginButton
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                      showToast({
                        type: "error",
                        title: "Google Login Failed",
                        message: "Google login failed",
                        duration: 5000,
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2 staggered-2">
                <label className="dark-label ml-1 text-xs sm:text-sm">{t('auth.enterPhone')} *</label>
                <div className={`relative input-wrapper ${errors.phone ? 'error' : ''}`}>
                  <Smartphone className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.phone ? "text-[#DC143C]" : ""}`} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full h-10 sm:h-12 pl-12 sm:pl-14 pr-3 sm:pr-4 dark-input text-xs sm:text-sm font-bold outline-none transition-all duration-300 ${errors.phone ? "error" : ""}`}
                  />
                </div>
              </div>
              <Button onClick={handleNext} disabled={isLoading || formData.phone.length < 10} className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30 text-sm sm:text-base staggered-3">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Next'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 slide-in-right max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">

              {/* PHOTO SECTION */}
              <div className="flex flex-col items-center justify-center mb-3 sm:mb-4 staggered-1">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white/10 relative">
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
                <p className="mt-2 text-[8px] sm:text-[9px] font-black text-white/50 tracking-widest">{t('auth.addPhoto')}</p>
              </div>

              <div className="bg-white/5 p-3 sm:p-4 rounded-3xl border border-white/10 mb-2 staggered-2">
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
                      maxLength={5}
                      className={`w-full h-12 pl-18 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 ${errors.otp ? "error" : ""}`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {canResendOtp ? (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isLoading}
                        className="text-[10px] font-bold text-[#D4AF37] hover:text-[#FFD700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-white/50">
                        Resend in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 staggered-3">
                <label className="dark-label ml-1 text-xs sm:text-sm">{t('auth.fullName')} *</label>
                <div className={`relative input-wrapper ${errors.username ? 'error' : ''}`}>
                  <User className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.username ? "text-[#DC143C]" : ""}`} />
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t('auth.fullName')}
                    className={`w-full h-10 sm:h-12 pl-16 sm:pl-18 pr-3 sm:pr-4 dark-input text-xs sm:text-sm font-bold outline-none transition-all duration-300 ${errors.username ? "error" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2 staggered-3">
                <label className="dark-label ml-1 text-xs sm:text-sm">Email (Optional)</label>
                <div className="relative input-wrapper">
                  <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" size={18} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full h-10 sm:h-12 pl-16 sm:pl-18 pr-3 sm:pr-4 dark-input text-xs sm:text-sm font-bold outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 staggered-4">
                <div className="space-y-2">
                  <label className="dark-label ml-1 text-xs sm:text-sm">{t('auth.gender')}</label>
                  <div className="relative group">
                    <VenusAndMars className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" size={18} />
                    <select name="gender" className="w-full h-10 sm:h-11 pl-16 sm:pl-18 pr-3 sm:pr-4 dark-input text-xs sm:text-sm font-bold outline-none appearance-none focus-ring transition-all duration-300" value={formData.gender} onChange={handleChange}>
                      <option value="male" className="bg-gray-800">Male</option>
                      <option value="female" className="bg-gray-800">Female</option>
                      <option value="other" className="bg-gray-800">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="dark-label ml-1">{t('auth.dateOfBirth')}</label>
                  <div className={`relative input-wrapper ${errors.dob ? 'error' : ''}`}>
                    <CalendarDays className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10 ${errors.dob ? "text-[#DC143C]" : ""}`} size={18} />
                    <input
                      type="text"
                      value={formData.dob}
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      readOnly
                      placeholder="DD/MM/YYYY"
                      className={`w-full h-11 pl-18 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 cursor-pointer ${errors.dob ? 'error' : ''}`}
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
                                const isSelected = formData.dob === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 staggered-6">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    id="agreeToPolicy"
                    checked={formData.agreeToPolicy}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToPolicy: e.target.checked }))}
                    className="sr-only cursor-pointer"
                  />
                  <div 
                    onClick={() => setFormData(prev => ({ ...prev, agreeToPolicy: !prev.agreeToPolicy }))}
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                      formData.agreeToPolicy 
                        ? 'bg-[#D4AF37] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/50' 
                        : errors.agreeToPolicy
                        ? 'border-[#DC143C] bg-[#DC143C]/10'
                        : 'border-white/30 bg-white/5 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {formData.agreeToPolicy && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="agreeToPolicy" className="text-xs text-white/70 leading-relaxed cursor-pointer">
                    I agree to the <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }} className="text-[#D4AF37] font-bold hover:underline cursor-pointer">Terms of Service & Privacy Policy</span>
                  </label>
                  {errors.agreeToPolicy && (
                    <p className="text-[10px] text-[#DC143C] mt-1 font-bold">{errors.agreeToPolicy}</p>
                  )}
                </div>
              </div>

              <div className="gold-divider" />

              <Button 
                disabled={isLoading || isUploading || !formData.username || !formData.otp || formData.otp.length !== 5 || !formData.password || !formData.dob || !formData.agreeToPolicy} 
                onClick={handleSubmit} 
                className={`w-full h-14 font-extrabold rounded-2xl transition-all duration-300 focus-ring text-sm sm:text-base staggered-6 ${
                  isLoading || isUploading || !formData.username || !formData.otp || formData.otp.length !== 5 || !formData.password || !formData.dob || !formData.agreeToPolicy
                    ? 'bg-gradient-to-r from-gray-600 to-gray-500 text-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#D4AF37]/30'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : t('auth.completeSignup')}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full h-12 text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-colors text-button border border-white/10">Back</button>
              
              <div className="w-full h-px bg-white/10 my-4" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Sponser_Footer collapsed={false} />
      </div>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTermsModal(false)}>
          <div className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                Terms of Service & Privacy Policy
              </h2>
              <button onClick={() => setShowTermsModal(false)} className="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-6 text-white/80 text-sm">
              <div>
                <p className="text-xs text-white/50 mb-4">Last Updated: April 1, 2026</p>
                <p className="mb-4">Welcome to Coiffeurr ("Platform", "we", "our", "us"). By accessing or using our website, mobile application, or services ("Services"), you agree to these Terms. If you do not agree, please do not use the Platform.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">1. Nature of Service</h3>
                <p className="mb-2">Coiffeurr is an intermediary platform connecting users ("Customers") with independent salons and service providers ("Service Providers").</p>
                <p className="mb-2">We do not:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Own, operate, or control any salon</li>
                  <li>Provide salon services directly</li>
                  <li>Guarantee quality, safety, or suitability of services</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">2. User Responsibilities</h3>
                <p className="mb-2">You agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate information</li>
                  <li>Arrive on time for appointments</li>
                  <li>Follow salon policies</li>
                  <li>Use the Platform lawfully</li>
                </ul>
                <p className="mt-2 mb-2">You are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your booking decisions</li>
                  <li>Informing salons about allergies or conditions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">3. No Liability</h3>
                <p className="mb-2">To the maximum extent permitted by law, Coiffeurr is not liable for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Injuries, allergic reactions, or health issues</li>
                  <li>Poor service or dissatisfaction</li>
                  <li>Loss, theft, or damage at salon premises</li>
                  <li>Misconduct or negligence by Service Providers</li>
                  <li>Delays, cancellations, or rescheduling</li>
                </ul>
                <p className="mt-2">All services are used at your own risk.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">4. No Warranty</h3>
                <p className="mb-2">The Platform is provided "as-is" and "as-available" without warranties, including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>No guarantee of availability</li>
                  <li>No assurance of accuracy of listings or pricing</li>
                  <li>No guarantee of uninterrupted or error-free service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">5. Payments & Refunds</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Payments are processed via third-party gateways</li>
                  <li>We are not responsible for payment issues caused by them</li>
                  <li>Refunds depend on salon and platform policies</li>
                  <li>Refunds may be denied in case of misuse</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">6. Cancellations & No-Shows</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Users must follow the cancellation policy at booking</li>
                  <li>Repeated no-shows may lead to account suspension</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">7. Third-Party Services</h3>
                <p className="mb-2">Service Providers are independent entities.</p>
                <p className="mb-2">We do not:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Conduct background checks (unless stated)</li>
                  <li>Guarantee certifications</li>
                  <li>Take responsibility for their actions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">8. Limitation of Liability</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We are not liable for indirect or consequential damages</li>
                  <li>Total liability (if any) is limited to the booking amount</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">9. Indemnification</h3>
                <p className="mb-2">You agree to indemnify Coiffeurr from claims arising from:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your use of the Platform</li>
                  <li>Interactions with Service Providers</li>
                  <li>Violation of these Terms</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">10. Account Termination</h3>
                <p className="mb-2">We may suspend or terminate accounts for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Misuse or fraud</li>
                  <li>Violation of Terms</li>
                </ul>
                <p className="mt-2">We may modify or discontinue the Platform at any time.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">11. Privacy</h3>
                <p>Your use of the Platform is subject to our Privacy Policy.</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">12. Security</h3>
                <p className="mb-2">We take your security seriously and implement industry-standard measures to protect your information.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your personal data is encrypted and stored securely</li>
                  <li>We use secure payment gateways for all transactions</li>
                  <li>Regular security updates protect your account</li>
                  <li>We monitor for suspicious activity to prevent unauthorized access</li>
                  <li>Your information is never shared without your consent</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">13. Governing Law</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>These Terms are governed by the laws of India.</li>
                  <li>Disputes are subject to the courts of Assam.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] mb-2">14. Changes to Terms</h3>
                <p>We may update these Terms at any time. Continued use means acceptance.</p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-3">Support</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">Email:</span>
                    <span className="text-white">mrmrscoiffeurr@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">WhatsApp:</span>
                    <span className="text-white">+91-7045464907</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowTermsModal(false)}
              className="w-full h-12 shimmer-button text-white font-bold rounded-2xl mt-6"
            >
              I Understand
            </Button>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Smartphone size={32} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                WhatsApp number?
              </h2>
              <p className="text-sm text-white/70">
                It helps us send your booking details smoothly—otherwise your inbox might get a little too much love from us.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="dark-label ml-1 text-xs sm:text-sm">WhatsApp Number (Optional)</label>
                <div className="relative input-wrapper">
                  <Smartphone className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" />
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9]/g, '');
                      setWhatsappNumber(sanitized.slice(0, 10));
                    }}
                    placeholder="9876543210"
                    className="w-full h-12 pl-12 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300"
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button
                  onClick={handleSendWhatsAppOtp}
                  disabled={isSendingOtp || !whatsappNumber || whatsappNumber.length < 10}
                  className="w-full h-12 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold rounded-2xl hover:from-[#128C7E] hover:to-[#25D366] transition-all duration-300 text-sm"
                >
                  {isSendingOtp ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="dark-label ml-1 text-xs sm:text-sm">Enter OTP</label>
                    <div className="relative input-wrapper">
                      <ShieldCheck className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" />
                      <input
                        type="tel"
                        value={whatsappOtp}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^0-9]/g, '');
                          setWhatsappOtp(sanitized.slice(0, 5));
                        }}
                        placeholder="Enter 5-digit OTP"
                        maxLength={5}
                        className="w-full h-12 pl-12 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Timer display */}
                  <div className="text-center">
                    <p className="text-xs text-white/60">
                      OTP expires in: <span className="font-bold text-[#D4AF37]">
                        {Math.floor(otpTimer / 60).toString().padStart(2, '0')}:{(otpTimer % 60).toString().padStart(2, '0')}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSkipWhatsApp}
                      className="flex-1 h-12 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 text-sm"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={handleWhatsAppSubmit}
                      disabled={isVerifyingOtp}
                      className="flex-1 h-12 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold rounded-2xl hover:from-[#128C7E] hover:to-[#25D366] transition-all duration-300 text-sm"
                    >
                      {isVerifyingOtp ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                    </Button>
                  </div>

                  {/* Resend OTP button */}
                  <Button
                    onClick={handleSendWhatsAppOtp}
                    disabled={!canResendOtp || isSendingOtp}
                    className="w-full h-10 bg-white/5 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-all duration-300 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? <Loader2 className="animate-spin w-4 h-4" /> : canResendOtp ? 'Resend OTP' : `Resend in ${Math.floor(otpTimer / 60).toString().padStart(2, '0')}:${(otpTimer % 60).toString().padStart(2, '0')}`}
                  </Button>
                </>
              )}

              {!otpSent && (
                <Button
                  onClick={handleSkipWhatsApp}
                  className="w-full h-12 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 text-sm mt-2"
                >
                  Skip
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default CustomerRegistration;