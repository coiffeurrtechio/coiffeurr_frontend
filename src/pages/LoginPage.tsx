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

      if (result?.user?.role === "OWNER") {
        sessionStorage.setItem('fromLogin', 'true');
        navigate("/dashboard");
      }
      else {
        sessionStorage.setItem('fromLogin', 'true');
        navigate("/");
      }

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
    <div className="min-h-screen bg-gradient-to-br from-[#1E4D8C] to-[#0a2e5c] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-4 sm:space-y-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('auth.signIn')}</h1>
            </motion.div>
            <motion.p 
              className="punch-line text-[9px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Refining the art of your presence.
            </motion.p>
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-gray-600">{t('auth.dontHaveAccount')} <Link to="/signup" className="text-[#1E4D8C] hover:underline font-semibold">{t('auth.createAccount')}</Link></p>
            </div>
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
                    <label className="text-xs sm:text-sm font-medium text-gray-700">{t('common.email')}</label>
                    <div className={`relative input-wrapper ${errors.email ? 'error' : ''}`}>
                      <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 ${errors.email ? "text-[#DC143C]" : ""}`} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E4D8C] focus:border-transparent outline-none transition-all text-sm ${errors.email ? "error" : ""}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">{t('auth.phoneNumber')}</label>
                    <div className={`relative input-wrapper ${errors.phone ? 'error' : ''}`}>
                      <Smartphone className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 ${errors.phone ? "text-[#DC143C]" : ""}`} />
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E4D8C] focus:border-transparent outline-none transition-all text-sm ${errors.phone ? "error" : ""}`}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">{t('auth.password')}</label>
                    <Link to="/forgetpassword" className="text-[10px] font-black text-white/60 hover:text-[#D4AF37] tracking-widest text-button transition-colors focus-ring">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <div className="relative input-wrapper">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-20 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E4D8C] focus:border-transparent outline-none transition-all text-sm"
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
                  disabled={isLoading}
                  className="w-full bg-[#1E4D8C] hover:bg-[#0a2e5c] text-white py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {isLoading ? t('common.loading') : t('auth.signIn')}
                </Button>
              </motion.form>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <Sponser_Footer collapsed={false} />
    </div>
  );
};

export default LoginPage;