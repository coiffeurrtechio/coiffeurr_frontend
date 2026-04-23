import { useState, useEffect } from "react";
import { Search, Shield, ShieldCheck, Ban, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui_components/button";
import { motion } from "framer-motion";

interface Salon {
  id: string;
  salonName: string;
  email: string;
  primaryPhone: string;
  address: {
    city: string;
    pincode: string;
  };
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

const SalonManagement = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [filterBlocked, setFilterBlocked] = useState<boolean | null>(null);
  const [expandedSalon, setExpandedSalon] = useState<string | null>(null);

  const fetchSalons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons?`;
      
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filterVerified !== null) url += `is_verified=${filterVerified}&`;
      if (filterBlocked !== null) url += `is_blocked=${filterBlocked}&`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch salons");
      
      const data = await response.json();
      setSalons(data);
    } catch (error) {
      console.error("Error fetching salons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, [search, filterVerified, filterBlocked]);

  const handleBlock = async (salonId: string) => {
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons/${salonId}/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to block salon");
      
      fetchSalons();
    } catch (error) {
      console.error("Error blocking salon:", error);
      alert("Failed to block salon");
    }
  };

  const handleUnblock = async (salonId: string) => {
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons/${salonId}/unblock`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to unblock salon");
      
      fetchSalons();
    } catch (error) {
      console.error("Error unblocking salon:", error);
      alert("Failed to unblock salon");
    }
  };

  const handleVerify = async (salonId: string) => {
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons/${salonId}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to verify salon");
      
      fetchSalons();
    } catch (error) {
      console.error("Error verifying salon:", error);
      alert("Failed to verify salon");
    }
  };

  const handleUnverify = async (salonId: string) => {
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons/${salonId}/unverify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to unverify salon");
      
      fetchSalons();
    } catch (error) {
      console.error("Error unverifying salon:", error);
      alert("Failed to unverify salon");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Salon Management</h1>
        <p className="text-gray-600">Manage all salons - block, unblock, verify, and unverify</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, city, pincode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
            />
          </div>

          {/* Verification Filter */}
          <select
            value={filterVerified === null ? "" : filterVerified.toString()}
            onChange={(e) => setFilterVerified(e.target.value === "" ? null : e.target.value === "true")}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          {/* Block Filter */}
          <select
            value={filterBlocked === null ? "" : filterBlocked.toString()}
            onChange={(e) => setFilterBlocked(e.target.value === "" ? null : e.target.value === "true")}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
          >
            <option value="">All Block Status</option>
            <option value="true">Blocked</option>
            <option value="false">Unblocked</option>
          </select>
        </div>
      </div>

      {/* Salon List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Loading salons...</p>
        </div>
      ) : salons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No salons found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {salons.map((salon) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Salon Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-900">{salon.salonName}</h3>
                    {salon.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {salon.isBlocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        <Ban className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {salon.address.city}, {salon.address.pincode}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedSalon(expandedSalon === salon.id ? null : salon.id)}
                >
                  {expandedSalon === salon.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>

              {/* Expanded Details */}
              {expandedSalon === salon.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4 border-t border-gray-100 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm text-gray-900">{salon.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-gray-900">{salon.primaryPhone}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {salon.isBlocked ? (
                      <Button
                        size="sm"
                        onClick={() => handleUnblock(salon.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleBlock(salon.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Block
                      </Button>
                    )}

                    {salon.isVerified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnverify(salon.id)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(salon.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalonManagement;
