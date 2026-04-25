import React, { useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './GoogleLoginButton.css';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  text?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  onSuccess, 
  onError,
  text = 'Continue with Google' 
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // Trigger pulse animation
    if (buttonRef.current) {
      buttonRef.current.classList.add('pulse-animation');
      setTimeout(() => {
        buttonRef.current?.classList.remove('pulse-animation');
      }, 300);
    }
  };

  return (
    <div 
      ref={buttonRef}
      className="google-login-button-container"
      onClick={handleClick}
    >
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError || (() => console.log('Google Login Failed'))}
        type="icon"
        shape="circle"
        theme="outline"
        text="continue_with"
        useOneTap={false}
      />
      <div className="google-button-text">{text}</div>
    </div>
  );
};

export default GoogleLoginButton;
