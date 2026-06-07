import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Phone, Bell } from "lucide-react";
import { Button } from "../../components/ui_components/button";
import { motion } from "framer-motion";

interface SuperAdminSettings {
  whatsappNumber: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<SuperAdminSettings>({
    whatsappNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('super_admin_access_token');
      
      const response = await fetch(`${apiUrl}/api/v1/super-admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          whatsappNumber: data.whatsappNumber || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const handleSave = async () => {
    if (!settings.whatsappNumber.trim()) {
      setMessage({ type: "error", text: "WhatsApp number is required" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('super_admin_access_token');
      
      const response = await fetch(`${apiUrl}/api/v1/super-admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.detail || "Failed to save settings" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-yellow-400" />
          Super Admin Settings
        </h1>
        <p className="text-gray-400">Configure your super admin preferences and notifications</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border-green-500/50"
              : "bg-red-500/20 text-red-400 border-red-500/50"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* WhatsApp Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Phone className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">WhatsApp Notification Settings</h2>
              <p className="text-sm text-gray-400">Configure the WhatsApp number to receive booking notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Super Admin WhatsApp Number
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="+1234567890"
                className="w-full px-4 py-3 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                This number will receive WhatsApp notifications when a new booking is created. 
                Include country code (e.g., +1 for US)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/10 backdrop-blur-xl rounded-xl border border-blue-500/30 p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">How Notifications Work</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>When a user creates a new booking, a WhatsApp notification will be sent to this number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>The notification will include booking details: customer name, salon, service, date, and time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>You can use this information to manually verify or contact the customer if needed</span>
            </li>
          </ul>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30 px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
