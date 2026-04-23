import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, Lock, ArrowRight, Shield } from "lucide-react";
import { Button } from "../../components/ui_components/button";
import { useTranslation } from "react-i18next";

const SuperAdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = loginMethod === "email" 
        ? { email, password }
        : { phone, password };

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store tokens
      localStorage.setItem("super_admin_access_token", data.access_token);
      document.cookie = `refresh_token=${data.refresh_token}; path=/; secure; httponly; samesite=strict`;

      navigate("/super-admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = loginMethod === "email"
        ? { email }
        : { phone };

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send reset link");
      }

      alert(data.message);
      setShowForgotPassword(false);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl p-3 mb-4 shadow-2xl"
          >
            <img src="/Coiffeurr_Logo.png" alt="Coiffeurr" className="w-full h-full object-contain" />
          </motion.div>
          <motion.h1
            className="text-3xl font-black text-white mb-2"
            style={{
              background: 'linear-gradient(90deg, #D4AF37 0%, #F5E6A3 25%, #D4AF37 50%, #C9A227 75%, #D4AF37 100%)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            animate={{
              backgroundPosition: ['0% center', '100% center', '0% center'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            Coiffeurr
          </motion.h1>
          <p className="text-gray-400 text-sm">Super Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Method Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setLoginMethod("email")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                loginMethod === "email"
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                loginMethod === "phone"
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Phone
            </button>
          </div>

          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email/Phone Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {loginMethod === "email" ? <Mail size={20} /> : <Phone size={20} />}
                </div>
                <input
                  type={loginMethod === "email" ? "email" : "tel"}
                  placeholder={loginMethod === "email" ? "Email Address" : "Phone Number"}
                  value={loginMethod === "email" ? email : phone}
                  onChange={(e) => loginMethod === "email" ? setEmail(e.target.value) : setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Forgot Password */}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors w-full text-right"
              >
                Forgot Password?
              </button>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-4">
                <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-white font-bold text-lg">Reset Password</h3>
                <p className="text-gray-400 text-sm">
                  Enter your {loginMethod === "email" ? "email" : "phone"} to receive reset instructions
                </p>
              </div>

              {/* Email/Phone Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {loginMethod === "email" ? <Mail size={20} /> : <Phone size={20} />}
                </div>
                <input
                  type={loginMethod === "email" ? "email" : "tel"}
                  placeholder={loginMethod === "email" ? "Email Address" : "Phone Number"}
                  value={loginMethod === "email" ? email : phone}
                  onChange={(e) => loginMethod === "email" ? setEmail(e.target.value) : setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-gray-400 hover:text-white transition-colors w-full text-center"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <p className="text-center text-gray-500 text-xs mt-6">
          <Shield size={12} className="inline mr-1" />
          Authorized access only. All actions are logged.
        </p>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
