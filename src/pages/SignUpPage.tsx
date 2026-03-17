import React, { useState } from "react"
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, 
  ArrowLeft, UserPlus, Scissors, CheckCircle2 
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../components/ui_components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui_components/card"
import Config from "../configs/config"
import { useToast } from "../components/Toast"

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [formSubmit, setformSubmit] = useState(false);
    
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        username: "",
        password: "",
        agreeToPolicy: false,
    })
    
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        
        if (!formData.username || formData.username.length < 3) newErrors.username = "Enter a valid name";
        if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Enter a valid email";
        if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Enter a valid phone number";
        if (!formData.password || formData.password.length < 8) newErrors.password = "Min. 8 characters required";
        if (!formData.agreeToPolicy) newErrors.agreeToPolicy = "Please accept terms";

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setformSubmit(true);

        try {
            const response = await fetch(`${Config.API_AUTH_URL}/signup`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    agreeToPolicy: formData.agreeToPolicy
                }),
            });

            if (!response.ok) throw new Error(await response.text());

            navigate('/login');
            showToast({ type: "success", title: "Welcome!", message: "Account created successfully.", duration: 4000 });
        } catch (err: any) {
            showToast({ type: "error", title: "Registration Error", message: err.message || "Something went wrong", duration: 5000 });
        } finally {
            setformSubmit(false);
        }
    };

    return (
       

<div className="min-h-screen relative bg-[#F4F7FE] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden">
    
    {/* --- BACKGROUND DECORATION --- */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Adjusted blob sizes for mobile responsiveness */}
        <div className="absolute top-[-5%] right-[-10%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-[#1E4D8C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-orange-400/5 rounded-full blur-3xl" />
    </div>

    {/* Responsive container: Narrower on mobile, slightly wider on desktop for the side-by-side grid */}
    <div className="relative w-full max-w-[440px] md:max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Back to Login Link - Better touch area and spacing */}
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1E4D8C] transition-colors text-xs font-black uppercase tracking-widest mb-6 group ml-1">
            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">
                <ArrowLeft size={14} />
            </div>
            Sign In instead
        </Link>

        <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(30,77,140,0.08)] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="text-center pb-2 pt-6 sm:pt-8 px-6 sm:px-8">
                {/* Icon - Scaled for mobile */}
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-[#1E4D8C] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20 rotate-3">
                    <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-white -rotate-3" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">
                    Create Account
                </CardTitle>
                <CardDescription className="text-gray-500 font-medium text-sm sm:text-base">
                    Join Coiffeurr to book premium services
                </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pb-8 sm:pb-12 pt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Grid for Name and Email - 1 col on mobile, 2 col on tablet/desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField 
                            label="Full Name" 
                            icon={User} 
                            placeholder="Justin Mason"
                            value={formData.username}
                            onChange={(val: string) => handleInputChange("username", val)}
                            error={errors.username}
                        />
                        <InputField 
                            label="Email" 
                            icon={Mail} 
                            placeholder="name@email.com"
                            value={formData.email}
                            onChange={(val: string) => handleInputChange("email", val)}
                            error={errors.email}
                        />
                    </div>

                    {/* Single column fields */}
                    <InputField 
                        label="Phone Number" 
                        icon={Phone} 
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(val: string) => handleInputChange("phone", val)}
                        error={errors.phone}
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E4D8C] transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                className={`w-full h-12 pl-12 pr-12 bg-gray-50/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${errors.password ? 'ring-2 ring-red-100' : ''}`}
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E4D8C] p-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password}</p>}
                    </div>

                    {/* Terms Checkbox - Improved layout for multi-line text on mobile */}
                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-0.5 shrink-0">
                                <input 
                                    type="checkbox" 
                                    className="peer hidden" 
                                    checked={formData.agreeToPolicy}
                                    onChange={(e) => handleInputChange("agreeToPolicy", e.target.checked)}
                                />
                                <div className="w-5 h-5 border-2 border-gray-200 rounded-lg peer-checked:bg-[#1E4D8C] peer-checked:border-[#1E4D8C] transition-all flex items-center justify-center">
                                    <CheckCircle2 size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                                </div>
                            </div>
                            <span className="text-[11px] text-gray-500 font-medium leading-tight select-none">
                                By signing up, you agree to our <Link to="#" className="text-[#1E4D8C] font-black underline">Terms of Service</Link> and <Link to="#" className="text-[#1E4D8C] font-black underline">Privacy Policy</Link>.
                            </span>
                        </label>
                        {errors.agreeToPolicy && <p className="text-[10px] text-red-500 font-bold mt-1">{errors.agreeToPolicy}</p>}
                    </div>

                    <Button 
                        disabled={formSubmit} 
                        type="submit" 
                        className="w-full h-14 bg-[#1E4D8C] hover:bg-[#153a6b] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all mt-4"
                    >
                        {formSubmit ? 'Creating Account...' : 'Get Started'}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* Brand Footer - Optimized spacing for mobile */}
        <div className="mt-6 sm:mt-10 flex flex-col items-center gap-2 opacity-30 select-none pb-8">
            <div className="flex items-center gap-2">
                <Scissors size={14} className="text-gray-400 rotate-45" />
                <p className="text-[10px] font-black italic tracking-tighter text-gray-400 uppercase">Coiffeurr Professional</p>
            </div>
            <p className="text-[9px] font-bold text-gray-400">© {new Date().getFullYear()} STYLEHUB NETWORK</p>
        </div>
    </div>
</div>
    )
}

// --- Efficient Reusable Input ---
const InputField = ({ label, icon: Icon, value, onChange, error, placeholder }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1E4D8C] transition-colors" size={18} />
            <input
                type="text"
                placeholder={placeholder}
                className={`w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${error ? 'ring-2 ring-red-100' : ''}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
)