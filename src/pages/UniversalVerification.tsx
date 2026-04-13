import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Smartphone, ArrowRight, 
  RefreshCcw, Edit3 
} from 'lucide-react';
import { Button } from '../components/ui_components/button';
import Config from '../configs/config';
import { useToast } from '../components/Toast';

const UniversalVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // --- Conditional Logic based on state ---
  // We check if the keys exist in state to decide what to show
  const shouldVerifyEmail = !!location.state?.email;
  const shouldVerifyPhone = !!location.state?.phone;

  // --- States ---
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    email: '', // Start empty to take data from user
    phone: '', // Start empty to take data from user
    otp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Auth Context
  const authData = JSON.parse(localStorage.getItem("authState") || "{}");
  const userId = authData?.user?.user?.id || authData?.user?.id;
  const accessToken = authData?.user?.access_token;

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    // Validation based on the active condition
    if (shouldVerifyEmail && !formData.email) {
      showToast({ type: 'error', title: 'Email Required', message: 'Please enter your email.' });
      return;
    }
    if (shouldVerifyPhone && !formData.phone) {
      showToast({ type: 'error', title: 'Phone Required', message: 'Please enter your phone number.' });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {};
      if (shouldVerifyEmail) payload.email = formData.email;
      if (shouldVerifyPhone) payload.phone = formData.phone;

      const response = await fetch(`${Config.API_AUTH_URL}/signup/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData?.detail || "Failed to send OTP");
      
      showToast({ type: 'success', title: 'Code Sent', message: 'Check your device.' });
      setStep(2);
      setTimer(30);
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (formData.otp.length < 4) {
      showToast({ type: 'error', title: 'Invalid OTP', message: 'Enter the code.' });
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await fetch(`${Config.API_AUTH_URL}/signup/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shouldVerifyEmail ? formData.email : "",
          phone: shouldVerifyPhone ? formData.phone : "",
          otp: formData.otp
        }),
      });

      if (!verifyResponse.ok) throw new Error('Invalid OTP.');

      const updateResponse = await fetch(`${Config.API_AUTH_URL}/update-profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: userId,
          email: shouldVerifyEmail ? formData.email : undefined,
          phone: shouldVerifyPhone ? formData.phone : undefined,
        }),
      });

      if (!updateResponse.ok) throw new Error('Profile update failed.');

      showToast({ type: 'success', title: 'Success!', message: 'Profile updated.' });
      
      const updatedAuth = { ...authData };
      if (shouldVerifyEmail) updatedAuth.user.user.email = formData.email;
      if (shouldVerifyPhone) updatedAuth.user.user.phone = formData.phone;
      localStorage.setItem("authState", JSON.stringify(updatedAuth));

      navigate('/profile');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="p-8 relative z-10">
          <header className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-[#1E4D8C]" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              {step === 1 ? 'Link Account' : 'Verify Details'}
            </h1>
          </header>

          <div className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                
                {/* User types Email ONLY if shouldVerifyEmail is true */}
                {shouldVerifyEmail && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* User types Phone ONLY if shouldVerifyPhone is true */}
                {shouldVerifyPhone && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765..."
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSendOTP} 
                  isLoading={loading}
                  className="w-full"
                  icon={<ArrowRight size={18}/>}
                >
                  Send OTP
                </Button>
              </div>
            ) : (
              /* OTP Step Remains the Same */
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-400 uppercase">Sending to</span>
                    <span className="text-xs font-bold text-[#1E4D8C]">
                        {shouldVerifyEmail ? formData.email : formData.phone}
                    </span>
                  </div>
                  <button onClick={() => setStep(1)} className="p-2 text-[#1E4D8C] hover:bg-white rounded-xl transition-all">
                    <Edit3 size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Enter 6-Digit OTP</label>
                  <input 
                    name="otp"
                    type="text"
                    maxLength={6}
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="••••••"
                    className="w-full h-16 bg-gray-50 border-none rounded-2xl text-center text-3xl font-black tracking-[0.3em] outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>

                <Button onClick={handleVerifyAndComplete} isLoading={loading} className="w-full">
                  Confirm & Update
                </Button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Resend in {timer}s</p>
                  ) : (
                    <button onClick={handleSendOTP} className="text-[10px] font-black text-[#1E4D8C] uppercase tracking-widest flex items-center gap-2 mx-auto">
                      <RefreshCcw size={12} /> Resend Code
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversalVerification;