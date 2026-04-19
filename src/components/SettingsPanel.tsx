import React, { useState } from 'react';
import { Settings, X, Globe, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Config from '../configs/config';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const changeLanguage = (lng: string) => {
    setPendingLanguage(lng);
    setShowConfirmDialog(true);
    // Temporarily change language to show confirmation in target language
    i18n.changeLanguage(lng);
  };

  const confirmLanguageChange = async () => {
    if (pendingLanguage) {
      setIsSaving(true);
      
      // Save to localStorage
      localStorage.setItem('selectedLanguage', pendingLanguage);
      
      // Check if user is logged in and save to backend
      const authState = localStorage.getItem('authState');
      const user = authState ? JSON.parse(authState) : null;
      
      if (user?.isAuthenticated && user?.user?.access_token) {
        try {
          const response = await fetch(`${Config.API_AUTH_URL}/update-profile`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.user.access_token}`
            },
            body: JSON.stringify({
              user_id: user.user.user?.id || user.user.id,
              language_preference: pendingLanguage
            })
          });

          if (!response.ok) {
            console.error('Failed to save language preference to backend');
          }
        } catch (error) {
          console.error('Error saving language preference:', error);
        }
      }
      
      // Language is already changed from the temporary change, just keep it
      setPendingLanguage(null);
      setShowConfirmDialog(false);
      setIsSaving(false);
      // Close the settings panel after confirmation
      onClose();
    }
  };

  const cancelLanguageChange = () => {
    // Revert to original language
    i18n.changeLanguage(localStorage.getItem('selectedLanguage') || 'en');
    setPendingLanguage(null);
    setShowConfirmDialog(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{t('settings.title')}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Language Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">{t('settings.language')}</h3>
                </div>
                <div className="space-y-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        i18n.language === language.code
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <span className="font-medium text-gray-800">{language.name}</span>
                      </div>
                      {i18n.language === language.code && (
                        <div className="p-1 bg-blue-500 rounded-full">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Language Display */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">{t('settings.selectLanguage')}:</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentLanguage.flag}</span>
                  <span className="font-semibold text-gray-800">{currentLanguage.name}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-[#1E4D8C] text-white rounded-xl font-semibold hover:bg-[#153a6b] transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{t('settings.confirmLanguageChange')}</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('settings.confirmLanguageMessage', { language: languages.find(l => l.code === pendingLanguage)?.name })}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelLanguageChange}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  onClick={confirmLanguageChange}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-[#1E4D8C] text-white rounded-xl font-semibold hover:bg-[#153a6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('settings.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
