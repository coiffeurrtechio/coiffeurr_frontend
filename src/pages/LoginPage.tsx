import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, Smartphone
} from "lucide-react";
import { Button } from "../components/ui_components/button";
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
      const response = await fetch(`${Config.API_AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const result = await response.json();
      if (!response.ok) {
        // Check if this is a Google-only account
        if (result?.detail?.includes('Google login') || result?.detail?.includes('set a password')) {
          showToast({
            type: "error",
            title: "Google Account Detected",
            message: "This account uses Google login. Please use the 'Forgot Password' option to set a password for email login.",
            duration: 8000,
          });
          setIsLoading(false);
          return;
        }
        throw new Error(result?.detail || 'Login failed');
      }

      dispatch(login({ user: result }));

      // Fetch user PII to get image URL
      try {
        const piiResponse = await fetch(`${Config.API_Customers}/users/${result.user.id}/pii`, {
          headers: {
            'Authorization': `Bearer ${result.access_token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (piiResponse.ok) {
          const piiData = await piiResponse.json();
          // Update user state with image URL from PII
          dispatch(login({ user: { ...result.user, access_token: result.access_token, image_url: piiData.image_url } }));
        }
      } catch (piiError) {
        console.error('Failed to fetch PII:', piiError);
        // Continue even if PII fetch fails
      }

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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Load Google Identity Services
      const google = (window as any).google;
      if (!google) {
        throw new Error('Google SDK not loaded');
      }

      // Use Google Identity Services for ID token (not OAuth2 access token)
      google.accounts.id.initialize({
        client_id: '584558727500-i5sv6ci73aqgnuple5rebq6r1gq85vb4.apps.googleusercontent.com',
        callback: async (response: any) => {
          try {
            // Call backend Google login API with ID token
            const apiResponse = await fetch(`${Config.API_AUTH_URL}/google-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id_token: response.credential }),
              credentials: 'include',
            });

            const result = await apiResponse.json();

            if (!apiResponse.ok) {
              throw new Error(result?.detail || 'Google login failed');
            }

            dispatch(login({ user: result }));

            // Fetch user PII to get image URL
            try {
              const piiResponse = await fetch(`${Config.API_Customers}/users/${result.user.id}/pii`, {
                headers: {
                  'Authorization': `Bearer ${result.access_token}`,
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              });

              if (piiResponse.ok) {
                const piiData = await piiResponse.json();
                // Update user state with image URL from PII
                dispatch(login({ user: { ...result.user, access_token: result.access_token, image_url: piiData.image_url } }));
              }
            } catch (piiError) {
              console.error('Failed to fetch PII:', piiError);
              // Continue even if PII fetch fails
            }

            // Redirect to current origin (localhost or production)
            globalThis.location.href = globalThis.location.origin;
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
        },
      });

      // Trigger the Google sign-in popup
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          throw new Error('Google sign-in popup not displayed');
        }
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: t('auth.loginFailed'),
        message: error.message || t('auth.loginFailed'),
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen classy-salon-bg flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="classy-overlay" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-auto glass-card rounded-[2.5rem] overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <header className="mb-6 sm:mb-8 text-center">
            <motion.div 
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg border border-white/20 transition-transform hover:scale-105 duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{t('auth.signIn')}</h1>
            </motion.div>
            <motion.p 
              className="punch-line text-[9px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Refining the art of your presence.
            </motion.p>
          </header>
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
                    <label className="dark-label ml-1 text-xs sm:text-sm">{t('common.email')}</label>
                    <div className={`relative input-wrapper ${errors.email ? 'error' : ''}`}>
                      <Mail className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.email ? "text-[#DC143C]" : ""}`} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full h-10 sm:h-12 pl-12 sm:pl-14 pr-3 sm:pr-4 dark-input text-xs sm:text-sm font-bold outline-none transition-all duration-300 ${errors.email ? "error" : ""}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="dark-label ml-1 text-xs sm:text-sm">{t('auth.phoneNumber')}</label>
                    <div className={`relative input-wrapper ${errors.phone ? 'error' : ''}`}>
                      <Smartphone className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 dark-icon ${errors.phone ? "text-[#DC143C]" : ""}`} />
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full h-10 sm:h-12 pl-12 sm:pl-14 pr-3 sm:pr-4 dark-input text-xs sm:text-sm font-bold outline-none transition-all duration-300 ${errors.phone ? "error" : ""}`}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="dark-label ml-1 text-xs sm:text-sm">{t('auth.password')}</label>
                    <Link to="/forgetpassword" className="text-[10px] font-black text-white/50 hover:text-[#D4AF37] tracking-widest text-button transition-colors focus-ring">
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
                      className="w-full h-12 pl-12 pr-20 dark-input text-sm font-bold outline-none transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus-ring z-10"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-extrabold rounded-2xl hover:from-[#FFD700] hover:to-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-ring shadow-lg shadow-[#D4AF37]/30 text-sm sm:text-base"
                >
                  {isLoading ? t('common.loading') : t('auth.signIn')}
                </Button>
                <div className="text-center space-y-2">
                  <p className="text-xs sm:text-sm text-white/60">{t('auth.dontHaveAccount')} <Link to="/signup" className="text-[#D4AF37] hover:text-[#FFD700] font-semibold">{t('auth.createAccount')}</Link></p>
                </div>

                <div className="w-full h-px bg-white/10 my-4" />
                
                <div className="flex flex-col items-center gap-3">
                  <p className="text-xs text-white/50">sign in with google</p>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="group relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-[#4285F4]/30 transition-all duration-500 focus-ring overflow-hidden"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-md" />
                    
                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[#4285F4]/30 transition-all duration-500 group-hover:scale-125" />
                    
                    {/* Google logo */}
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                    >
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    
                    {/* Particle dots */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1 left-1 w-1 h-1 bg-[#4285F4] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                      <div className="absolute top-1 right-1 w-1 h-1 bg-[#34A853] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-75" />
                      <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#FBBC05] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-150" />
                      <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#EA4335] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping delay-200" />
                    </div>
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
        </div>
      </motion.div>

      <div className="mt-8">
        <Sponser_Footer collapsed={false} />
      </div>
    </div>
  );
};

export default LoginPage;