import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Bell,
  Check,
  Mail,
  MessageCircle
} from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageConfirm, setShowLanguageConfirm] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

  const handleLanguageChange = (code: string) => {
    if (code !== selectedLanguage) {
      setPendingLanguage(code);
      setShowLanguageConfirm(true);
    }
  };

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage);
      i18n.changeLanguage(pendingLanguage);
      setShowLanguageConfirm(false);
      setPendingLanguage(null);
    }
  };

  const cancelLanguageChange = () => {
    setShowLanguageConfirm(false);
    setPendingLanguage(null);
  };

  return (
    <div className="min-h-screen p-8" style={{ 
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg, #F7F5F2 0%, #FFFFFF 100%)',
      color: '#2C2C2C'
    }}>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2" style={{ 
          fontFamily: 'Cinzel, serif',
          letterSpacing: '0.1em',
          color: '#2C2C2C'
        }}>
          {t('settings.title') || 'Configuration Hub'}
        </h1>
        <p style={{ 
          fontSize: '14px',
          color: '#666',
          letterSpacing: '0.05em'
        }}>
          {t('settings.subtitle') || 'Personalize your experience'}
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        
        {/* Localization Card */}
        <div className="p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01]" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(232, 228, 222, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{
              background: 'rgba(212, 175, 55, 0.1)'
            }}>
              <Globe size={24} style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
              {t('settings.localization')}
            </h3>
          </div>
          
          {/* Segmented Pill Control */}
          <div className="flex gap-2" style={{ backgroundColor: '#F7F5F2', padding: '4px', borderRadius: '12px', border: '1px solid #E8E4DE' }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300"
                style={{
                  background: selectedLanguage === lang.code 
                    ? '#FFFFFF'
                    : 'transparent',
                  border: selectedLanguage === lang.code 
                    ? '1px solid #D4AF37'
                    : '1px solid transparent',
                  boxShadow: selectedLanguage === lang.code 
                    ? '0 0 12px rgba(212, 175, 55, 0.2)'
                    : 'none',
                  opacity: selectedLanguage === lang.code ? 1 : 0.6
                }}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Card */}
        <div className="p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01]" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(232, 228, 222, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{
              background: 'rgba(212, 175, 55, 0.1)'
            }}>
              <Bell size={24} style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
              {t('settings.notifications')}
            </h3>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: '#666' }}>
              {t('settings.enablePushNotifications')}
            </span>
            {/* iOS-style Premium Switch */}
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="relative w-14 h-8 rounded-full transition-all duration-300"
              style={{
                background: notificationsEnabled 
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)' 
                  : '#E8E4DE',
                boxShadow: notificationsEnabled 
                  ? '0 0 20px rgba(212, 175, 55, 0.4)' 
                  : 'none',
                border: notificationsEnabled 
                  ? 'none' 
                  : '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="absolute top-1 transition-all duration-300 rounded-full flex items-center justify-center"
                style={{
                  width: '24px',
                  height: '24px',
                  background: notificationsEnabled ? '#FFFFFF' : '#FFFFFF',
                  boxShadow: notificationsEnabled ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  left: notificationsEnabled ? 'calc(100% - 26px)' : '4px'
                }}
              >
                {notificationsEnabled && <Check size={14} style={{ color: '#D4AF37' }} />}
              </div>
            </button>
          </div>
        </div>

        {/* Support Card */}
        <div className="p-6 rounded-2xl transition-all duration-300 hover:scale-[1.01]" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(232, 228, 222, 0.8)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{
              background: 'rgba(212, 175, 55, 0.1)'
            }}>
              <Mail size={24} style={{ color: '#D4AF37' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
              {t('settings.support') || 'Support'}
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{
              background: 'rgba(247, 245, 242, 0.5)',
              border: '1px solid rgba(232, 228, 222, 0.5)'
            }}>
              <Mail size={18} style={{ color: '#D4AF37' }} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: '#999', fontFamily: 'Inter, sans-serif' }}>
                  {t('settings.email') || 'Email'}
                </p>
                <a 
                  href="mailto:mrmrscoiffeurr@gmail.com" 
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#2C2C2C', fontFamily: 'Inter, sans-serif' }}
                >
                  {t('settings.supportEmail') || 'mrmrscoiffeurr@gmail.com'}
                </a>
              </div>
            </div>
            
            {/* WhatsApp */}
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{
              background: 'rgba(247, 245, 242, 0.5)',
              border: '1px solid rgba(232, 228, 222, 0.5)'
            }}>
              <MessageCircle size={18} style={{ color: '#D4AF37' }} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: '#999', fontFamily: 'Inter, sans-serif' }}>
                  {t('settings.whatsapp') || 'WhatsApp'}
                </p>
                <a 
                  href="https://wa.me/917045464907" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#2C2C2C', fontFamily: 'Inter, sans-serif' }}
                >
                  {t('settings.supportWhatsapp') || '+91-7045464907'}
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Language Change Confirmation Dialog */}
      {showLanguageConfirm && pendingLanguage && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6" style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                <Globe size={24} style={{ color: '#D4AF37' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Cinzel, serif', color: '#2C2C2C' }}>
                {t('settings.confirmLanguageChange')}
              </h3>
            </div>
            <p className="text-sm mb-6" style={{ color: '#666', fontFamily: 'Inter, sans-serif' }}>
              {t('settings.confirmLanguageMessage', { language: languages.find(l => l.code === pendingLanguage)?.name })}
            </p>
            <p className="text-sm mb-6" style={{ color: '#D4AF37', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
              {languages.find(l => l.code === pendingLanguage)?.name}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLanguageChange}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-colors"
                style={{
                  backgroundColor: '#F7F5F2',
                  color: '#2C2C2C',
                  border: '1px solid #E8E4DE',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={confirmLanguageChange}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8962E 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {t('settings.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Version Badge */}
      <div className="fixed bottom-6 right-6">
        <div className="px-3 py-1 rounded-full" style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <span className="text-[10px] font-medium" style={{ 
            color: '#D4AF37',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.15em'
          }}>
            v1.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
