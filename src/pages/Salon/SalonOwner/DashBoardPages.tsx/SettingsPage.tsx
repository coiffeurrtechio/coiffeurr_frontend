import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import SettingsPanel from '../../../../components/SettingsPanel';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
];

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const settingsSections = [
    {
      id: 'language',
      title: t('settings.language'),
      description: t('settings.selectLanguage'),
      icon: Globe,
      action: () => setShowLanguageModal(true)
    }
  ];

  return (
    <div className="space-y-6 animate-md3-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-md3-slide-up">
        <div className="p-3 bg-blue-100 rounded-xl elevation-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
          <p className="text-sm text-gray-500">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={section.action}
              className={`w-full glass-card rounded-xl p-6 elevation-1 hover:elevation-3 transition-all duration-300 group ripple-container animate-delay-${(index + 1) * 100}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{section.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{section.description}</span>
                      {section.id === 'language' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                          <span>{currentLanguage.flag}</span>
                          <span>{currentLanguage.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Language Selection Modal */}
      <SettingsPanel isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} />
    </div>
  );
};

export default SettingsPage;
