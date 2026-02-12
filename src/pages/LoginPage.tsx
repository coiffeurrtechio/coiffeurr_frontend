import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, Building2, Scissors, ArrowLeft, 
  Mail, Lock, Eye, EyeOff 
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

// --- SUB-COMPONENT: LOGIN PAGE ---
interface LoginPageProps {
  role: string;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ role, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field] || errors.email) {
      setErrors((prev) => ({ ...prev, [field]: "", email: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${Config.API_AUTH_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        showToast({
          type: "error",
          title: "Login Failed",
          message: errorMessage || "Something went wrong. Please try again.",
          duration: 5000,
        });
        return;
      }

      const result = await response.json();
      dispatch(login({ user: result }));
      
      showToast({
        type: "success",
        title: "Login Successful",
        message: "Welcome back to Coiffeurr!",
        duration: 5000,
      });

      console.log("result?.user?.role = ",result?.user?.role);
      
      if(result?.user?.role === "OWNER"){
        navigate("/dashboard")
      }
      else{
        navigate("/");
      }

    } catch (error: any) {
      showToast({
        type: "error",
        title: "Login Failed",
        message: "Network error. Please check your connection.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1E4D8C] transition-colors text-sm font-bold mb-6 group"
      >
        <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-blue-50">
          <ArrowLeft size={16} />
        </div>
        Change Role
      </button> */}

      <Card className="border-0 mt-4 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(30,77,140,0.1)] rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pb-2 pt-10">
          <div className="mx-auto w-16 h-16 bg-[#1E4D8C] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 rotate-3">
            <Scissors className="w-8 h-8 text-white -rotate-3" />
          </div>
          <CardTitle className="text-3xl font-black text-gray-900 tracking-tight text-capitalize">
            Login 
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium mt-2">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email or Username</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? "text-destructive" : "text-gray-400 group-focus-within:text-[#1E4D8C]"}`} />
                <input
                  type="text"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  className={`w-full h-12 pl-12 pr-4 bg-gray-50 border-2 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.email ? "border-destructive/50" : "border-transparent"}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-destructive font-bold ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-[10px] font-black text-[#1E4D8C] hover:underline tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password ? "text-destructive" : "text-gray-400 group-focus-within:text-[#1E4D8C]"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                  className={`w-full h-12 pl-12 pr-12 bg-gray-50 border-2 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.password ? "border-destructive/50" : "border-transparent"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive font-bold ml-1">{errors.password}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#1E4D8C] hover:bg-[#153a6b] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs font-bold text-gray-400">
              Don't have an account? <Link to="/signup" className="text-[#1E4D8C] hover:underline ml-1">Create account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// // --- MAIN COMPONENT: HOME ---
// export default function Home() {
//   const [selectedRole, setSelectedRole] = useState<string | null>(null);

//   const roles = [
//     { id: "customer", title: "Customer", icon: Users, color: "bg-blue-500", desc: "Book appointments" },
//     { id: "salon-owner", title: "Salon Owner", icon: Building2, color: "bg-[#1E4D8C]", desc: "Manage your business" },
//     { id: "artist", title: "Artist", icon: Scissors, color: "bg-orange-500", desc: "View your schedule" },
//   ];

//   return (
//     <main className="min-h-screen bg-[#F4F7FE] flex items-center justify-center overflow-hidden relative">
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#1E4D8C]/5 rounded-full blur-3xl" />
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl" />
//       </div>

//       <div className="relative w-full h-screen overflow-hidden">
//         <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out px-6 ${selectedRole ? "-translate-x-full opacity-0 scale-95" : "translate-x-0 opacity-100 scale-100"}`}>
//           <div className="mb-10 text-center">
//             <div className="flex items-center justify-center gap-3 mb-4">
//                <div className="bg-[#1E4D8C] p-2 rounded-xl rotate-3 shadow-lg">
//                   <Scissors className="text-white w-6 h-6 -rotate-3" />
//                </div>
//                <h1 className="text-3xl font-black tracking-tighter text-[#1E4D8C] uppercase">Coiffeurr</h1>
//             </div>
//             <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Who are you?</h2>
//             <p className="text-gray-500 font-medium">Choose your role to continue</p>
//           </div>

//           <div className="w-full max-w-md space-y-4">
//             {roles.map((role) => {
//               const Icon = role.icon;
//               return (
//                 <button
//                   key={role.id}
//                   onClick={() => setSelectedRole(role.id)}
//                   className="group w-full p-5 rounded-3xl bg-white border border-gray-100 hover:border-[#1E4D8C] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className={`${role.color} p-3 rounded-2xl shadow-lg transition-transform group-hover:rotate-6`}>
//                       <Icon className="w-6 h-6 text-white" />
//                     </div>
//                     <div className="text-left">
//                       <p className="text-lg font-bold text-gray-900">{role.title}</p>
//                       <p className="text-xs text-gray-400 font-medium">{role.desc}</p>
//                     </div>
//                   </div>
//                   <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-[#1E4D8C] transition-colors">
//                     <ArrowLeft className="rotate-180 w-4 h-4" />
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${selectedRole ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}`}>
//           {selectedRole && (
//             <LoginPage
//               role={selectedRole}
//               onBack={() => setSelectedRole(null)}
//             />
//           )}
//         </div>
//       </div>

//       <div className="absolute bottom-8 flex items-center gap-2 opacity-20 select-none">
//         <Scissors size={14} className="text-gray-400 rotate-45" />
//         <p className="text-[10px] font-black italic tracking-tighter text-gray-400 uppercase">Coiffeurr Salon Suite</p>
//       </div>
//     </main>
//   );
// }

export default LoginPage;