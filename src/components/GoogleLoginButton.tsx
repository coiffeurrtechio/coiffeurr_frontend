import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './GoogleLoginButton.css';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  onSuccess, 
  onError
}) => {
  return (
    <div className="google-login-button-container">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError || (() => console.log('Google Login Failed'))}
        type="icon"
        shape="circle"
        theme="filled_black"
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleLoginButton;
