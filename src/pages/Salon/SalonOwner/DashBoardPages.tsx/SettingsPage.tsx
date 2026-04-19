import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import SettingsPanel from '../../../../components/SettingsPanel';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-xl">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
          <p className="text-sm text-gray-500">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={section.action}
              className="w-full bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
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
