import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Building2, Mail, Lock, Eye, EyeOff, Smartphone
} from "lucide-react";
import { Button } from "../components/ui_components/button";
import {
  Card, CardContent, CardHeader,
  CardTitle
} from "../components/ui_components/card";
import { useToast } from "../components/Toast";
import { useDispatch } from "react-redux";
import { login } from "../utils/Storage/slice/authSlice";
import Config from '../configs/config';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/config';
import "../styles/classy-salon.css";
import Sponser_Footer from "../components/Sponser_Footer";
import { motion, AnimatePresence } from "motion/react";

interface LoginPageProps {
  role: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ role }) => {
  const { t } = useTranslation();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = localStorage.getItem("authState");
  const parsedUser = user ? JSON.parse(user) : null;
  const isloggedin = parsedUser?.isAuthenticated;

  // Force English when user is not logged in
  useEffect(() => {
    if (!isloggedin) {
      i18n.changeLanguage('en');
    }
  }, [isloggedin]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) newErrors.email = t('auth.requiredField');
      else if (!emailRegex.test(formData.email)) newErrors.email = t('auth.invalidEmail');
    } else {
      if (!formData.phone) newErrors.phone = t('auth.requiredField');
      else if (formData.phone.length < 10) newErrors.phone = t('auth.invalidCredentials');
    }

    if (!formData.password) newErrors.password = t('auth.requiredField');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Structure payload: current method value + null for the other
      const payload = {
        email: loginMethod === 'email' ? formData.email : null,
        phone: loginMethod === 'phone' ? formData.phone : null,
        password: formData.password,
      };

      const response = await fetch(`${Config.API_AUTH_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage?.detail || t('auth.loginFailed'));
      }

      const result = await response.json();
      dispatch(login({ user: result }));

      // Set language from user preference in login response, default to English if not set
      const languagePreference = result?.user?.language_preference || 'en';
      if (['en', 'hi', 'mr'].includes(languagePreference)) {
        i18n.changeLanguage(languagePreference);
        localStorage.setItem('selectedLanguage', languagePreference);
      } else {
        i18n.changeLanguage('en');
        localStorage.setItem('selectedLanguage', 'en');
      }

      showToast({
        type: "success",
        title: t('auth.loginSuccess'),
        message: t('auth.loginSuccess'),
        duration: 3000,
      });

      if (result?.user?.role === "OWNER") {
        sessionStorage.setItem('fromLogin', 'true');
        navigate("/dashboard");
      }
      else navigate("/");

    } catch (error: any) {
      showToast({
        type: "error",
        title: t('auth.loginFailed'),
        message: error.message || t('auth.loginFailed'),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden classy-salon-bg">
      <div className="classy-overlay" />

      <div className="relative z-10 w-full max-w-[420px] flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="border border-white/10 glass-card rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
            <CardHeader className="text-center pb-1 pt-4 px-4">
              <motion.div 
                className="mx-auto w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-lg border border-white/20 transition-transform hover:scale-105 duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-10 h-10 object-contain" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <CardTitle 
                  className="text-2xl font-bold text-white tracking-tight letter-reveal"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {t('auth.signIn')}
                </CardTitle>
              </motion.div>
              <motion.p 
                className="punch-line text-[9px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Refining the art of your presence.
              </motion.p>
            </CardHeader>

            <CardContent className="space-y-3 px-4 pb-4">
              {/* Method Toggle */}
              <motion.div 
                className="flex bg-white/5 p-1 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <button
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${loginMethod === 'phone' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
                >
                  <Smartphone size={12} /> {t('common.phone')}
                </button>
                <button
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all ${loginMethod === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
                >
                  <Mail size={12} /> {t('common.email')}
                </button>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.form 
                  key={loginMethod}
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                  initial={{ opacity: 0, x: loginMethod === 'email' ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: loginMethod === 'email' ? -50 : 50 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {loginMethod === 'email' ? (
                    <div className="space-y-2">
                      <label className="dark-label ml-1">{t('common.email')}</label>
                      <div className={`relative input-wrapper ${errors.email ? 'error' : ''}`}>
                        <Mail className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10 ${errors.email ? "text-[#DC143C]" : ""}`} />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`w-full h-12 pl-12 pr-12 dark-input text-sm font-bold outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50 ${errors.email ? "error" : ""}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="dark-label ml-1">{t('auth.phoneNumber')}</label>
                      <div className={`relative input-wrapper ${errors.phone ? 'error' : ''}`}>
                        <Smartphone className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon z-10 ${errors.phone ? "text-[#DC143C]" : ""}`} />
                        <input
                          type="tel"
                          placeholder="+91 00000 00000"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={`w-full h-12 pl-12 pr-4 dark-input text-sm font-bold outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50 ${errors.phone ? "error" : ""}`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="dark-label">{t('auth.password')}</label>
                      <Link to="/forgetpassword" className="text-[10px] font-black text-white/60 hover:text-[#D4AF37] tracking-widest text-button transition-colors focus-ring">
                        {t('auth.forgotPassword')}
                      </Link>
                    </div>
                    <div className="relative input-wrapper">
                      <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full h-12 pl-12 pr-20 dark-input text-sm font-bold outline-none transition-all duration-300 focus:ring-2 focus:ring-[#D4AF37]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 transition-colors focus-ring z-10"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold text-xs rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-3 focus-ring shadow-lg shadow-[#D4AF37]/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? t('common.loading') : t('auth.signIn')}
                  </Button>
                </motion.form>
              </AnimatePresence>

              <div className="gold-divider" />

              <motion.div 
                className="text-center pt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <p className="text-[10px] font-bold text-white/60">
                  {t('auth.dontHaveAccount')}
                  <Link to="/signup" className="text-[#D4AF37] hover:text-[#FFD700] ml-1 text-button transition-colors">{t('auth.createAccount')}</Link>
                </p>
              </motion.div>

              <div className="w-full h-px bg-white/10 my-2" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Sponser_Footer collapsed={false} />
    </div>
  );
};

export default LoginPage;