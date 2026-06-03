import React, { useState, useEffect } from "react";
import { Mail, Lock, ShieldCheck, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui_components/button";
import Config from "../configs/config";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import '../styles/classy-salon.css';
import Sponser_Footer from '../components/Sponser_Footer';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // --- States ---
  const [step, setStep] = useState(1); // 1: Email/Phone, 2: OTP & New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resetMethod, setResetMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [isUnregistered, setIsUnregistered] = useState(false);

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // Force English when user is not logged in
  useEffect(() => {
    if (!isloggedin) {
      i18n.changeLanguage('en');
    }
  }, [isloggedin]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: number;
    if (step === 2 && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendCountdown]);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // --- Helpers ---
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUnregistered(false);
    
    if (resetMethod === 'whatsapp' && formData.phone.length < 10) {
      return showToast("Please enter a valid 10-digit phone number", "error");
    }

    setLoading(true);
    try {
      const payload = resetMethod === 'email' 
        ? { email: formData.email }
        : { phone: formData.phone };

      const response = await fetch(`${Config.API_AUTH_URL}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(t('auth.otpSent'));
        setStep(2);
        setResendCountdown(300); // Start 5-minute countdown
      } else {
        if (response.status === 404 || resData?.detail?.toLowerCase().includes("register")) {
          setIsUnregistered(true);
          showToast(resData?.detail || "User not registered. Please register first.", "error");
        } else {
          showToast(resData?.detail || t('auth.userNotFound'), "error");
        }
      }
    } catch (error) {
      showToast(t('auth.somethingWentWrong'), "error");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    setLoading(true);
    try {
      const payload = resetMethod === 'email' 
        ? { email: formData.email }
        : { phone: formData.phone };

      const response = await fetch(`${Config.API_AUTH_URL}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(t('auth.otpSent'));
        setResendCountdown(300); // Reset 5-minute countdown
      } else {
        showToast(resData?.detail || t('auth.somethingWentWrong'), "error");
      }
    } catch (error) {
      showToast(t('auth.somethingWentWrong'), "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return showToast(t('auth.passwordMismatch'), "error");
    }
    
    if (!isPasswordValid()) {
      return showToast("Please meet all password requirements", "error");
    }
    
    setLoading(true);
    try {
      const payload = resetMethod === 'email'
        ? {
            email: formData.email,
            otp: formData.otp,
            new_password: formData.newPassword
          }
        : {
            phone: formData.phone,
            otp: formData.otp,
            new_password: formData.newPassword
          };

      const response = await fetch(`${Config.API_AUTH_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        setStep(3);
      } else {
        showToast(resData?.detail || t('auth.invalidOTP'), "error");
      }
    } catch (error) {
      showToast(t('auth.resetFailed'), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen classy-salon-bg flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="classy-overlay" />
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 glass-card ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold text-white">{toast.message}</span>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md mx-auto glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Coiffeurr Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg border border-white/20 transition-transform hover:scale-105 duration-300">
            <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          </div>

          {step !== 3 && (
            <div className="text-center mb-4">
              <h1 
                className="text-2xl font-bold text-white tracking-tight letter-reveal"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {step === 1 ? t('auth.forgotPassword') : t('auth.verifyAccount')}
              </h1>
              <p className="punch-line text-[9px] letter-reveal tracking-widest" style={{ animationDelay: '0.2s' }}>
                Reclaim your style.
              </p>
              <p className="text-white/60 text-[10px] mt-1 font-medium letter-reveal" style={{ animationDelay: '0.3s' }}>
                {step === 1 
                  ? (resetMethod === 'whatsapp' ? "Enter your phone number to receive OTP on WhatsApp" : t('auth.enterEmail')) 
                  : t('auth.codeSent', { email: resetMethod === 'email' ? formData.email : formData.phone })}
              </p>
            </div>
          )}

        {/* --- STEP 1: METHOD SELECTOR AND INPUT --- */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4 slide-in-right">
            
            {/* Reset Method Selector */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-2 staggered-2">
              <button
                type="button"
                onClick={() => {
                  setResetMethod('whatsapp');
                  setIsUnregistered(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${resetMethod === 'whatsapp' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-white/60 hover:text-white'}`}
              >
                <Smartphone size={14} />
                WhatsApp OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetMethod('email');
                  setIsUnregistered(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-300 ${resetMethod === 'email' ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-white/60 hover:text-white'}`}
              >
                <Mail size={14} />
                Email OTP
              </button>
            </div>

            {resetMethod === 'email' ? (
              <div className="space-y-2 staggered-3">
                <label className="dark-label ml-1">{t('common.email')}</label>
                <div className="relative input-wrapper">
                  <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10" size={18} />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full h-12 pl-12 pr-12 dark-input font-bold text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 staggered-3">
                <label className="dark-label ml-1">{t('auth.enterPhone')}</label>
                <div className="relative input-wrapper">
                  <Smartphone className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10" size={18} />
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                    placeholder="9876543210"
                    className="w-full h-12 pl-12 pr-12 dark-input font-bold text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                </div>
              </div>
            )}

            {isUnregistered && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex flex-col gap-2 items-center text-center staggered-3 animate-bounce">
                <span className="text-red-400 text-xs font-bold">You are not registered yet!</span>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-black rounded-xl tracking-widest shadow-md transition-all duration-300"
                >
                  REGISTER FIRST
                </button>
              </div>
            )}

            <Button disabled={loading} className={`w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl tracking-widest staggered-4 hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? <Loader2 className="animate-spin" /> : t('auth.sendOTP')}
            </Button>
          </form>
        )}

        {/* --- STEP 2: OTP & NEW PASSWORD --- */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 slide-in-right">
            <div className="space-y-2 staggered-3">
              <label className="dark-label ml-1">{t('auth.oneTimePassword')}</label>
              <div className="relative input-wrapper">
                <ShieldCheck className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10" size={18} />
                <input
                  required
                  maxLength={5}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '')})}
                  placeholder={t('auth.enterOTP')}
                  className="w-full h-12 pl-12 pr-4 dark-input font-bold text-sm tracking-[0.8em] outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              </div>
            </div>

            <div className="space-y-2 staggered-4">
              <label className="dark-label ml-1">{t('auth.newPassword')}</label>
              <div className="relative input-wrapper">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10" size={18} />
                <input
                  required
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({...formData, newPassword: e.target.value});
                    validatePassword(e.target.value);
                  }}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 dark-input font-bold text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors focus-ring z-10"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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

            <div className="space-y-2 staggered-5">
              <label className="dark-label ml-1">{t('auth.confirmPassword')}</label>
              <div className="relative input-wrapper">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10" size={18} />
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 dark-input font-bold text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50"
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

            <Button disabled={loading} className={`w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl tracking-widest staggered-6 hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? <Loader2 className="animate-spin" /> : t('auth.resetAndLogin')}
            </Button>
            
            <button 
              type="button" 
              disabled={resendCountdown > 0 || loading}
              className={`text-center text-[9px] font-bold tracking-widest cursor-pointer transition-colors text-button focus-ring w-full py-2 ${resendCountdown > 0 ? 'text-white/40 cursor-not-allowed' : 'text-[#D4AF37] hover:text-[#FFD700]'}`}
              onClick={handleResendOTP}
            >
              {resendCountdown > 0 
                ? `Resend in ${Math.floor(resendCountdown / 60)}:${(resendCountdown % 60).toString().padStart(2, '0')}`
                : t('auth.resendCode')
              }
            </button>

            <div className="w-full h-px bg-white/10 my-4" />
          </form>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && (
          <div className="slide-in-right text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF37]/30 animate-bounce">
              <CheckCircle2 size={40} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 letter-reveal" style={{ fontFamily: 'Playfair Display, serif' }}>
              All set!
            </h2>
            <p className="text-white/80 text-sm font-medium mb-8 letter-reveal" style={{ animationDelay: '0.2s' }}>
              Now remember it… or we'll meet again 👀
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl tracking-widest hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30"
            >
              Go to Login
            </Button>
          </div>
        )}
        </div>
      </div>

      <div className="mt-8">
        <Sponser_Footer collapsed={false} />
      </div>
    </div>
  );
}