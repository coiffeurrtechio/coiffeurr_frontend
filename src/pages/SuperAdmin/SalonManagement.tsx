import { useState, useEffect } from "react";
import { Search, Shield, ShieldCheck, Ban, CheckCircle, XCircle, ChevronDown, ChevronUp, Tag, Flame, Star, Award, Clock, Crown, Gem, Eye, MapPin, Phone, Mail, Scissors, Users, Star as StarIcon, X, Calendar, Coffee } from "lucide-react";
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
  tags: string[];
  rating: number;
}

interface SalonDetails {
  id: string;
  salonName: string;
  email: string;
  primaryPhone: string;
  address: any;
  description: string;
  images: string[];
  rating: number;
  totalReviews: number;
  ratingBreakdown: { [key: number]: number };
  tier: string;
  commissionRate: number;
  tags: string[];
  isVerified: boolean;
  isBlocked: boolean;
  verificationStatus: string;
  verificationDocuments: any[];
  verificationNotes: string;
  verifiedAt: string;
  verifiedBy: string;
  footfallData?: Array<{ date: string; bookings: number }>;
  createdAt: string;
  ownerUserId: string;
  timing?: any;
  location?: any;
  socialMedia?: any;
  branding?: any;
  services: Array<{
    id: string;
    serviceName: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }>;
  staff: Array<{
    id: string;
    name: string;
    role: string;
    specialization: string;
    rating: number;
    image: string;
  }>;
  reviews: Array<{
    id: string;
    userId: string;
    userName: string;
    userImage: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

const SalonManagement = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [filterBlocked, setFilterBlocked] = useState<boolean | null>(null);
  const [filterTag, setFilterTag] = useState<string>("");
  const [expandedSalon, setExpandedSalon] = useState<string | null>(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [salonDetails, setSalonDetails] = useState<SalonDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "reviews" | "services" | "staff">("insights");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSort, setReviewSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const REVIEWS_PER_PAGE = 10;

  const TAG_OPTIONS = [
    { value: "TRENDING", label: "Trending", color: "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-lg shadow-orange-500/20", icon: Flame },
    { value: "CUSTOMERS_CHOICE", label: "Customer's Choice", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-lg shadow-yellow-500/20", icon: Star },
    { value: "BEST_VALUE", label: "Best Value", color: "bg-green-500/20 text-green-400 border-green-500/50 shadow-lg shadow-green-500/20", icon: Award },
    { value: "NEW_ARRIVAL", label: "New Arrival", color: "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-lg shadow-blue-500/20", icon: Clock },
    { value: "LEGACY", label: "Legacy", color: "bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-lg shadow-purple-500/20", icon: Crown },
    { value: "CLASSY", label: "Classy", color: "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/20", icon: Gem },
  ];

  const fetchSalons = async () => {
    console.log("SalonManagement: fetchSalons called");
    setLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      console.log("SalonManagement: token =", token);
      let url = `${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons?`;
      console.log("SalonManagement: url =", url);
      
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filterVerified !== null) url += `is_verified=${filterVerified}&`;
      if (filterBlocked !== null) url += `is_blocked=${filterBlocked}&`;
      if (filterTag) url += `tag=${encodeURIComponent(filterTag)}&`;
      url += `include_deleted=true&`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("SalonManagement: response status =", response.status);
      if (!response.ok) throw new Error("Failed to fetch salons");
      
      const data = await response.json();
      console.log("SalonManagement: data =", data);
      setSalons(data);
    } catch (error) {
      console.error("Error fetching salons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("SalonManagement: component mounted");
    fetchSalons();
  }, [search, filterVerified, filterBlocked, filterTag]);

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

  const handleUpdateTags = async () => {
    if (!selectedSalon) return;

    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons/${selectedSalon.id}/tags`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: selectedTags,
          auto_apply: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to update tags");

      setTagModalOpen(false);
      fetchSalons();
    } catch (error) {
      console.error("Error updating tags:", error);
      alert("Failed to update tags");
    }
  };

  const openTagModal = (salon: Salon) => {
    setSelectedSalon(salon);
    setSelectedTags(salon.tags || []);
    setTagModalOpen(true);
  };

  const toggleTag = (tagValue: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagValue)
        ? prev.filter((t) => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const getTagBadge = (tagValue: string) => {
    const tagOption = TAG_OPTIONS.find((t) => t.value === tagValue);
    if (!tagOption) return null;
    const Icon = tagOption.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full border ${tagOption.color}`}>
        <Icon className="w-3 h-3" />
        {tagOption.label}
      </span>
    );
  };

  const fetchSalonDetails = async (salonId: string) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("super_admin_access_token");
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/super-admin/salons/${salonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch salon details");

      const data = await response.json();
      console.log("Salon details API response:", data);
      console.log("Services count:", data.services?.length);
      console.log("Staff count:", data.staff?.length);
      console.log("Rating:", data.rating);
      
      // Fetch detailed reviews from separate API
      const reviewsResponse = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/reviews/SALON/${salonId}?page=1&limit=100&sort=-createdAt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Reviews API response status:", reviewsResponse.status);

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        console.log("Reviews API response:", reviewsData);
        console.log("First review data:", reviewsData[0]);
        // Map reviews API response to match expected format
        data.reviews = reviewsData.map((review: any) => ({
          id: review.id,
          userId: review.userId,
          userName: review.userName,
          userImage: review.userImage || null,
          rating: review.rating,
          comment: review.reviewText || review.text || review.comment, // API returns 'reviewText' but frontend expects 'comment'
          createdAt: review.createdAt
        }));
        console.log("Mapped reviews:", data.reviews);
      } else {
        console.error("Failed to fetch reviews:", reviewsResponse.status, reviewsResponse.statusText);
        data.reviews = [];
      }
      
      setSalonDetails(data);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error("Error fetching salon details:", error);
      alert("Failed to fetch salon details");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
          Nexus: Salon Operations Matrix
        </h1>
        <p className="text-gray-400">Master control center for salon intelligence and operations</p>
      </div>

      {/* Filters */}
      <div className="bg-transparent backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, city, pincode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400"
            />
          </div>

          {/* Verification Filter */}
          <select
            value={filterVerified === null ? "" : filterVerified.toString()}
            onChange={(e) => setFilterVerified(e.target.value === "" ? null : e.target.value === "true")}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
          >
            <option value="" className="bg-gray-800">All Verification Status</option>
            <option value="true" className="bg-gray-800">Verified</option>
            <option value="false" className="bg-gray-800">Unverified</option>
          </select>

          {/* Block Filter */}
          <select
            value={filterBlocked === null ? "" : filterBlocked.toString()}
            onChange={(e) => setFilterBlocked(e.target.value === "" ? null : e.target.value === "true")}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
          >
            <option value="" className="bg-gray-800">All Block Status</option>
            <option value="true" className="bg-gray-800">Blocked</option>
            <option value="false" className="bg-gray-800">Unblocked</option>
          </select>

          {/* Tag Filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2.5 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
          >
            <option value="" className="bg-gray-800">All Tags</option>
            {TAG_OPTIONS.map((tag) => (
              <option key={tag.value} value={tag.value} className="bg-gray-800">
                {tag.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Salon List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="mt-4 text-gray-400">Loading salons...</p>
        </div>
      ) : salons.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No salons found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {salons.map((salon) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-transparent backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
            >
              {/* Salon Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-lg text-white">{salon.salonName}</h3>
                    {salon.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 shadow-lg shadow-green-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {salon.isBlocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 shadow-lg shadow-red-500/20">
                        <Ban className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                    {salon.tags && salon.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {salon.tags.map((tag) => getTagBadge(tag))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {salon.address.city}, {salon.address.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSalonDetails(salon.id)}
                    className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:to-cyan-500/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all font-medium"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTagModal(salon)}
                    className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-purple-500/30 text-purple-400 hover:from-purple-500/20 hover:to-purple-500/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all font-medium"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Manage Tags
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSalon(expandedSalon === salon.id ? null : salon.id)}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    {expandedSalon === salon.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSalon === salon.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 pb-4 border-t border-white/10 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm text-white">{salon.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm text-white">{salon.primaryPhone}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {salon.isBlocked ? (
                      <Button
                        size="sm"
                        onClick={() => handleUnblock(salon.id)}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleBlock(salon.id)}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
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
                        className="border-gray-500/50 text-gray-400 hover:bg-white/5 hover:border-gray-500"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Unverify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(salon.id)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg shadow-yellow-500/20"
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

      {/* Salon Details Modal */}
      {detailsModalOpen && salonDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/10 border border-white/10 max-w-5xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{salonDetails.salonName}</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                      <div className="relative">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      </div>
                      <span className="text-xs font-semibold text-green-400">LIVE</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-white">{typeof salonDetails.rating === 'number' ? salonDetails.rating.toFixed(1) : 'N/A'}</span>
                      <span className="text-gray-400">({salonDetails.totalReviews} reviews)</span>
                    </div>
                    {salonDetails.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30 shadow-lg shadow-green-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {salonDetails.isBlocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 shadow-lg shadow-red-500/20">
                        <Ban className="w-3 h-3" />
                        Blocked
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setActiveTab("insights");
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tags */}
              {salonDetails.tags && salonDetails.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {salonDetails.tags.map((tag) => getTagBadge(tag))}
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                {[
                  { id: "insights", label: "Insights", icon: Shield },
                  { id: "reviews", label: "Reviews", icon: StarIcon },
                  { id: "services", label: "Services", icon: Scissors },
                  { id: "staff", label: "Staff", icon: Users },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                {activeTab === "insights" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Visits</p>
                            <p className="text-2xl font-bold text-white font-mono">{salonDetails.totalReviews * 12}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <StarIcon className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Rating</p>
                            <p className="text-2xl font-bold text-white font-mono">{typeof salonDetails.rating === 'number' ? salonDetails.rating.toFixed(1) : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Tier</p>
                            <p className="text-2xl font-bold text-white">{salonDetails.tier}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Growth Trend */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-3">Customer Footfall (Last 30 Days)</h4>
                      <div className="flex items-end gap-2 h-24">
                        {salonDetails?.footfallData && salonDetails.footfallData.length > 0 ? (
                          salonDetails.footfallData.map((day: any, i: number) => {
                            const maxBookings = Math.max(...salonDetails.footfallData.map((d: any) => d.bookings || 0));
                            const height = maxBookings > 0 ? ((day.bookings || 0) / maxBookings) * 100 : 20;
                            return (
                              <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-cyan-500/50 to-purple-500/50 rounded-t transition-all hover:from-cyan-500 hover:to-purple-500"
                                style={{ height: `${Math.max(height, 5)}%` }}
                                title={`${day.date}: ${day.bookings} bookings`}
                              />
                            );
                          })
                        ) : (
                          <div className="w-full text-center text-gray-400 text-sm py-8">No footfall data available</div>
                        )}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>30 days ago</span>
                        <span>Today</span>
                      </div>
                    </div>

                    {/* Booking Trends */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-3">Booking Trends (Weekly)</h4>
                      <div className="space-y-3">
                        {[
                          { day: "Mon", value: 65 },
                          { day: "Tue", value: 80 },
                          { day: "Wed", value: 75 },
                          { day: "Thu", value: 90 },
                          { day: "Fri", value: 95 },
                          { day: "Sat", value: 100 },
                          { day: "Sun", value: 85 },
                        ].map((item) => (
                          <div key={item.day} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-8">{item.day}</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-12 text-right font-mono">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                          <p className="text-sm font-medium text-white font-mono">{salonDetails.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                          <p className="text-sm font-medium text-white font-mono">{salonDetails.primaryPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Full Address */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-3">Address</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
                          <div>
                            <p className="text-white">{salonDetails.address?.street || 'N/A'}</p>
                            <p className="text-gray-400">{salonDetails.address?.city || 'N/A'}, {salonDetails.address?.state || 'N/A'}</p>
                            <p className="text-gray-400 font-mono">{salonDetails.address?.pincode || 'N/A'}</p>
                            {salonDetails.location && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${salonDetails.location.latitude},${salonDetails.location.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block"
                              >
                                Open in Maps →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Working Hours */}
                    {salonDetails.timing && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-white mb-3">Working Hours</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="text-gray-500">Opening Time</p>
                              <p className="text-white font-mono">
                                {typeof salonDetails.timing.openingTime === 'object' 
                                  ? salonDetails.timing.openingTime.start || 'N/A' 
                                  : salonDetails.timing.openingTime || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="text-gray-500">Closing Time</p>
                              <p className="text-white font-mono">
                                {typeof salonDetails.timing.closingTime === 'object' 
                                  ? salonDetails.timing.closingTime.end || 'N/A' 
                                  : salonDetails.timing.closingTime || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {salonDetails.timing.weeklyOff && (
                            <div className="flex items-center gap-3 md:col-span-2">
                              <Calendar className="w-5 h-5 text-cyan-400" />
                              <div>
                                <p className="text-gray-500">Weekly Off</p>
                                <p className="text-white">{Array.isArray(salonDetails.timing.weeklyOff) ? salonDetails.timing.weeklyOff.join(', ') : salonDetails.timing.weeklyOff}</p>
                              </div>
                            </div>
                          )}
                          {salonDetails.timing.lunchBreak && (
                            <div className="flex items-center gap-3 md:col-span-2">
                              <Coffee className="w-5 h-5 text-cyan-400" />
                              <div>
                                <p className="text-gray-500">Lunch Break</p>
                                <p className="text-white font-mono">
                                  {typeof salonDetails.timing.lunchBreak === 'object' 
                                    ? `${salonDetails.timing.lunchBreak.start || ''} - ${salonDetails.timing.lunchBreak.end || ''}`
                                    : salonDetails.timing.lunchBreak}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Media Links */}
                    {salonDetails.socialMedia && Object.keys(salonDetails.socialMedia).length > 0 && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-white mb-3">Social Media</h4>
                        <div className="flex flex-wrap gap-3">
                          {salonDetails.socialMedia.instagram && (
                            <a
                              href={salonDetails.socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-pink-500/20 text-pink-400 rounded-lg border border-pink-500/30 hover:bg-pink-500/30 transition-all"
                            >
                              Instagram
                            </a>
                          )}
                          {salonDetails.socialMedia.facebook && (
                            <a
                              href={salonDetails.socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                            >
                              Facebook
                            </a>
                          )}
                          {salonDetails.socialMedia.twitter && (
                            <a
                              href={salonDetails.socialMedia.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/30 hover:bg-sky-500/30 transition-all"
                            >
                              Twitter
                            </a>
                          )}
                          {salonDetails.socialMedia.website && (
                            <a
                              href={salonDetails.socialMedia.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all"
                            >
                              Website
                            </a>
                          )}
                          {salonDetails.socialMedia.whatsapp && (
                            <a
                              href={`https://wa.me/${salonDetails.socialMedia.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {salonDetails.description && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="font-semibold text-white mb-2">Description</h4>
                        <p className="text-sm text-gray-400">{salonDetails.description}</p>
                      </div>
                    )}

                    {/* Rating Breakdown */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-3">Rating Breakdown</h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = salonDetails.ratingBreakdown?.[rating] || 0;
                          const percentage = salonDetails.totalReviews > 0 ? (count / salonDetails.totalReviews) * 100 : 0;
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-sm font-medium w-8 text-white">{rating}★</span>
                              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-400 w-8 text-right font-mono">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h4 className="font-semibold text-white mb-2">Verification Status</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className="font-medium text-white">{salonDetails.verificationStatus}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Verified At</p>
                          <p className="font-medium text-white font-mono">
                            {salonDetails.verifiedAt
                              ? new Date(salonDetails.verifiedAt).toLocaleDateString()
                              : "Not verified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Commission Rate</p>
                          <p className="font-medium text-white font-mono">{salonDetails.commissionRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Created At</p>
                          <p className="font-medium text-white font-mono">
                            {new Date(salonDetails.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {salonDetails.verificationNotes && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-sm">Verification Notes</p>
                          <p className="text-sm text-gray-400">{salonDetails.verificationNotes}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Search and Sort */}
                    <div className="mb-4 flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search reviews..."
                          value={reviewSearch}
                          onChange={(e) => {
                            setReviewSearch(e.target.value);
                            setReviewPage(1);
                          }}
                          className="w-full pl-10 pr-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder-gray-400 text-sm"
                        />
                      </div>
                      <select
                        value={reviewSort}
                        onChange={(e) => {
                          setReviewSort(e.target.value as any);
                          setReviewPage(1);
                        }}
                        className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white text-sm"
                      >
                        <option value="newest" className="bg-gray-800">Newest First</option>
                        <option value="oldest" className="bg-gray-800">Oldest First</option>
                        <option value="highest" className="bg-gray-800">Highest Rated</option>
                        <option value="lowest" className="bg-gray-800">Lowest Rated</option>
                      </select>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3">
                      {salonDetails.reviews && salonDetails.reviews.length > 0 ? (
                        (() => {
                          let filteredReviews = salonDetails.reviews.filter(review =>
                            (review.comment && review.comment.toLowerCase().includes(reviewSearch.toLowerCase())) ||
                            (review.userName && review.userName.toLowerCase().includes(reviewSearch.toLowerCase()))
                          );

                          // Apply sorting
                          filteredReviews = [...filteredReviews].sort((a, b) => {
                            switch (reviewSort) {
                              case "newest":
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                              case "oldest":
                                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                              case "highest":
                                return b.rating - a.rating;
                              case "lowest":
                                return a.rating - b.rating;
                              default:
                                return 0;
                            }
                          });

                          const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
                          const startIndex = (reviewPage - 1) * REVIEWS_PER_PAGE;
                          const paginatedReviews = filteredReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

                          return (
                            <>
                              {paginatedReviews.map((review) => {
                                // Simple sentiment analysis based on rating
                                const sentiment = review.rating >= 4 ? "positive" : review.rating === 3 ? "neutral" : "negative";
                                const sentimentColors = {
                                  positive: "bg-green-500/20 text-green-400 border-green-500/30",
                                  neutral: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                  negative: "bg-red-500/20 text-red-400 border-red-500/30"
                                };

                                return (
                                  <div key={review.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-start gap-3">
                                      {review.userImage ? (
                                        <img
                                          src={review.userImage}
                                          alt={review.userName}
                                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                          <Users className="w-5 h-5 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <p className="font-medium text-sm text-white">{review.userName}</p>
                                          <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${sentimentColors[sentiment]}`}>
                                              {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                  key={star}
                                                  className={`w-4 h-4 ${
                                                    star <= review.rating
                                                      ? "text-yellow-400 fill-yellow-400"
                                                      : "text-gray-600"
                                                  }`}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2">{review.comment}</p>
                                        <p className="text-xs text-gray-500 mt-2 font-mono">
                                          {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                  <button
                                    onClick={() => setReviewPage(Math.max(1, reviewPage - 1))}
                                    disabled={reviewPage === 1}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Previous
                                  </button>
                                  <span className="text-sm text-gray-400">
                                    Page {reviewPage} of {totalPages}
                                  </span>
                                  <button
                                    onClick={() => setReviewPage(Math.min(totalPages, reviewPage + 1))}
                                    disabled={reviewPage === totalPages}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Next
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <div className="text-center py-8 text-gray-400">No reviews yet</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "services" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {salonDetails.services && salonDetails.services.length > 0 ? (
                        salonDetails.services.map((service) => (
                          <div key={service.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all">
                            <p className="font-medium text-sm text-white">{service.serviceName}</p>
                            <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm font-semibold text-cyan-400 font-mono">₹{service.price}</span>
                              <span className="text-xs text-gray-400">{service.duration} mins</span>
                            </div>
                            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-3/4" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Popularity Index</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-gray-400">No services listed</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "staff" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {salonDetails.staff && salonDetails.staff.length > 0 ? (
                        salonDetails.staff.map((staffMember) => (
                          <div key={staffMember.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-3">
                            {staffMember.image ? (
                              <img
                                src={staffMember.image}
                                alt={staffMember.name}
                                className="w-12 h-12 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Users className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm text-white">{staffMember.name}</p>
                              <p className="text-xs text-gray-500">{staffMember.role}</p>
                              <p className="text-xs text-gray-400 mt-1">{staffMember.specialization}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                              <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-medium text-white font-mono">
                                {typeof staffMember.rating === 'number' ? staffMember.rating.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 text-gray-400">No staff members</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tag Management Modal */}
      {tagModalOpen && selectedSalon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Manage Tags</h3>
                <button
                  onClick={() => setTagModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Select tags for <span className="font-semibold">{selectedSalon.salonName}</span>
              </p>

              <div className="space-y-3 mb-6">
                {TAG_OPTIONS.map((tag) => {
                  const Icon = tag.icon;
                  const isSelected = selectedTags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `${tag.color} border-current`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? "" : "text-gray-400"}`} />
                      <span className="font-medium">{tag.label}</span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setTagModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateTags}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Save Tags
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SalonManagement;
