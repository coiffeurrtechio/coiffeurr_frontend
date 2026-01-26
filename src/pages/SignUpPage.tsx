import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui_components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui_components/card"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, UserPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Config from "../configs/config"
import { useToast } from "../components/Toast"


export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({
        email: "",
        phone: "",
        username: "",
        password: "",
        agreeToPolicy: false,
    })
    const [formSubmit, setformSubmit] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
        return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.email) {
            newErrors.email = "Email is required"
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!formData.phone) {
            newErrors.phone = "Phone number is required"
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number"
        }

        if (!formData.username) {
            newErrors.username = "Username is required"
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters"
        }

        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters"
        }

        if (!formData.agreeToPolicy) {
            newErrors.agreeToPolicy = "You must agree to the terms and privacy policy"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        setformSubmit(true);

        const data = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
        };

        try {
            const response = await fetch(`${Config.API_BASE_URL}/register`, {
                method: "POST",
                credentials: "include", // for cookies
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                showToast({
                    type: "error",
                    title: "Signup Failed",
                    message: errorMessage,
                    duration: 5000,
                });
                return;
            }

            // Success
            // const result = await response.json();
            navigate('/login');
            showToast({
                type: "success",
                title: "Account Created Successfully!",
                message: "Welcome! Please check your email to verify your account.",
                duration: 5000,
            });

        } catch (err) {
            // Network or unexpected errors
            console.error(err);
            showToast({
                type: "error",
                title: "Signup Failed",
                message: "Something went wrong. Please try again.",
                duration: 5000,
            });
        }
        finally {
            setformSubmit(false);

        }
    };




    const handleGoogleSignup = () => {
        // Handle Google signup logic here
        console.log("Google signup attempt")
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value })
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    return (
        <div className="min-h-screen relative bg-background flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back to home link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Coiffeurr
                </Link>

                <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <UserPlus className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Join Coiffeurr to book premium salon services
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={`pl-10 w-full border border-gray-300 rounded-xl ${errors.email ? "border-destructive" : ""}`}
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phone">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="phone"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className={`pl-10 w-full border border-gray-300 rounded-xl ${errors.phone ? "border-destructive" : ""}`}
                                        required
                                    />
                                </div>
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="username">Username *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        className={`pl-10 w-full border border-gray-300 rounded-xl ${errors.username ? "border-destructive" : ""}`}
                                        required
                                    />
                                </div>
                                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password">Password *</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        className={`pl-10 pr-10 w-full border border-gray-300 rounded-xl ${errors.password ? "border-destructive" : ""}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-start items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="agreeToPolicy"
                                        checked={formData.agreeToPolicy}
                                        onChange={(e) => {
                                            setFormData({ ...formData, agreeToPolicy: e.target.checked })
                                            if (errors.agreeToPolicy) {
                                                setErrors({ ...errors, agreeToPolicy: "" })
                                            }
                                        }}
                                        className={errors.agreeToPolicy ? "border-destructive" : ""}
                                    />

                                    <div className="grid gap-1.5 leading-none">
                                        <label htmlFor="agreeToPolicy" className="text-sm font-normal leading-relaxed cursor-pointer">
                                            I agree to the{" "}
                                            <Link to="#" className="text-primary hover:text-primary/80 underline">
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link to="#" className="text-primary hover:text-primary/80 underline">
                                                Privacy Policy
                                            </Link>
                                        </label>
                                    </div>
                                </div>
                                {errors.agreeToPolicy && <p className="text-sm text-destructive">{errors.agreeToPolicy}</p>}
                            </div>

                            <Button disabled={formSubmit} type="submit" className="w-full" size="lg">
                                {formSubmit ? 'Creating your account ...' : 'Create Account'}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                {/* <Separator className="w-full" /> */}
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="w-full bg-transparent"
                            onClick={handleGoogleSignup}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Sign up with Google
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
