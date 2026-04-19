import React, { useState, useEffect } from "react";
import { ArrowLeft, Mail, Lock, ShieldCheck, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui_components/button";
import Config from "../configs/config";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // --- States ---
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // Force English when user is not logged in
  useEffect(() => {
    if (!isloggedin) {
      i18n.changeLanguage('en');
    }
  }, [isloggedin]);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  // --- Helpers ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${Config.API_AUTH_URL}/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        showToast(t('auth.otpSent'));
        setStep(2);
      } else {
        showToast(t('auth.userNotFound'), "error");
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
    
    setLoading(true);
    try {
      const response = await fetch(`${Config.API_AUTH_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          new_password: formData.newPassword
        }),
      });

      if (response.ok) {
        showToast(t('auth.passwordResetSuccess'));
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showToast(t('auth.invalidOTP'), "error");
      }
    } catch (error) {
      showToast(t('auth.resetFailed'), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans relative overflow-hidden flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6">
        <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all active:scale-90">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-8 pt-4 pb-12">
        {/* Animated Brand Icon */}
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-sm">
          <KeyRound size={32} className="text-[#1E4D8C]" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {step === 1 ? t('auth.forgotPassword') : t('auth.verifyAccount')}
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">
            {step === 1 
              ? t('auth.enterEmail') 
              : t('auth.codeSent', { email: formData.email })}
          </p>
        </div>

        {/* --- STEP 1: EMAIL --- */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('common.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all border-none"
                />
              </div>
            </div>

            <Button disabled={loading} className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">
              {loading ? <Loader2 className="animate-spin" /> : t('auth.sendOTP')}
            </Button>
          </form>
        )}

        {/* --- STEP 2: OTP & NEW PASSWORD --- */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('auth.oneTimePassword')}</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  placeholder={t('auth.enterOTP')}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl font-bold text-sm tracking-[0.5em] outline-none focus:ring-4 focus:ring-blue-50 border-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('auth.newPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 border-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50 border-none"
                />
              </div>
            </div>

            <Button disabled={loading} className="w-full h-14 bg-[#1E4D8C] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">
              {loading ? <Loader2 className="animate-spin" /> : t('auth.resetAndLogin')}
            </Button>
            
            <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => setStep(1)}>
              {t('auth.resendCode')}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}