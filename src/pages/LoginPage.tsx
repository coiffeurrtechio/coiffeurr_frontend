import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Building2, Scissors, ArrowLeft,
  Mail, Lock, Eye, EyeOff, Smartphone
} from "lucide-react";
import { Button } from "../components/ui_components/button";
import {
  Card, CardContent, CardHeader,
  CardTitle, CardDescription
} from "../components/ui_components/card";
import { useToast } from "../components/Toast";
import { useDispatch } from "react-redux";
import { login } from "../utils/Storage/slice/authSlice";
import Config from '../configs/config';

interface LoginPageProps {
  role: string;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ role, onBack }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) newErrors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";
    } else {
      if (!formData.phone) newErrors.phone = "Phone is required";
      else if (formData.phone.length < 10) newErrors.phone = "Invalid phone number";
    }

    if (!formData.password) newErrors.password = "Password is required";

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
        throw new Error(errorMessage?.detail || "Login failed");
      }

      const result = await response.json();
      dispatch(login({ user: result }));

      showToast({
        type: "success",
        title: "Welcome back!",
        message: "Logged in successfully.",
        duration: 3000,
      });

      if (result?.user?.role === "OWNER") navigate("/dashboard");
      else navigate("/");

    } catch (error: any) {
      showToast({
        type: "error",
        title: "Login Error",
        message: error.message || "Connection error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gray-50">
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `url('/Background.jpeg')`,
          backgroundSize: '320px',
          backgroundRepeat: 'repeat',
          filter: 'grayscale(100%) brightness(1.1)',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-[#1E4D8C] mb-6 transition-colors font-black text-[10px] uppercase tracking-widest ml-1 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <Card className="border-0 bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(30,77,140,0.15)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pb-2 pt-10">
            <div className="mx-auto w-16 h-16 bg-[#1E4D8C] rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3 transition-transform hover:rotate-0 duration-300">
              <Scissors className="w-8 h-8 text-white -rotate-3" />
            </div>
            <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Login to your  account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-10">
            {/* Method Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginMethod === 'email' ? 'bg-white text-[#1E4D8C] shadow-sm' : 'text-gray-400'}`}
              >
                <Mail size={14} /> Email
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginMethod === 'phone' ? 'bg-white text-[#1E4D8C] shadow-sm' : 'text-gray-400'}`}
              >
                <Smartphone size={14} /> Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === 'email' ? (
                <div className="space-y-1.5 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-[#1E4D8C]"}`} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.email ? "ring-2 ring-red-100" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in duration-300">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Smartphone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.phone ? "text-red-500" : "text-gray-400 group-focus-within:text-[#1E4D8C]"}`} />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.phone ? "ring-2 ring-red-100" : ""}`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  <Link to="/forgetpassword" className="text-[10px] font-black text-[#1E4D8C] hover:underline tracking-widest">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1E4D8C]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full h-12 pl-12 pr-12 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-[#1E4D8C] hover:bg-[#153a6b] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs font-bold text-gray-400">
                Don't have an account?
                <Link to="/signup" className="text-[#1E4D8C] hover:underline ml-1">Create account</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;