import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, ArrowLeft, Scissors, Trash2 } from "lucide-react";
import { usersalonApi } from "../API/SalonsAPIs/UserSalonAPI";
import { Loader } from "../components/ui_components/Loader";
import { Card, CardContent } from "../components/ui_components/card";
import { Badge } from "../components/ui_components/badge";
import { useToast } from "../components/Toast";

export default function UserWishlist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userapiRequest } = usersalonApi();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const userId = parsedAuth?.user?.user?.id || parsedAuth?.user?.id;

      if (!userId) {
        navigate("/login");
        return;
      }

      const res = await userapiRequest<any>(`/wishlist/${userId}`);
      if (res.data) {
        setWishlist(res.data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      showToast({
        type: "error",
        title: t('wishlist.loginFailed'),
        message: error || t('wishlist.somethingWentWrong'),
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (salonId: string) => {
    try {
      const authData = localStorage.getItem("authState");
      const parsedAuth = authData ? JSON.parse(authData) : null;
      const userId = parsedAuth?.user?.user?.id || parsedAuth?.user?.id;

      if (!userId) return;

      // Hit the delete API
      await userapiRequest<any>(`/wishlist/${userId}/${salonId}`, {
        method: "DELETE",
      });

      // Update local state immediately for a snappy UI
      setWishlist((prev) => prev.filter((item) => item.id !== salonId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleSalonNavigate = (id: string) => {
    navigate(`/salons/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-sans">
      <Loader isVisible={loading} />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-sm font-bold tracking-widest text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>{t('wishlist.myWishlist')}</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((salon) => (
              <Card
                key={salon.id}
                className="group border-none shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white overflow-hidden rounded-3xl"
                onClick={() => handleSalonNavigate(salon.id)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={salon.branding?.coverImages?.[0] || "/placeholder.svg"}
                    alt={salon.salonName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Remove from Wishlist Button */}
                  <div className="absolute top-4 right-4">
                    <button
                      className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-red-500 text-[10px] font-bold uppercase tracking-wider shadow-lg hover:bg-red-500 hover:text-white transition-all active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(salon.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <Badge className="absolute bottom-4 left-4 bg-gradient-to-r from-[#D4AF37] to-[#F4C430] text-white border-none text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    {salon.salonType || t('wishlist.studio')}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900 truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {salon.salonName}
                    </h3>
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 px-2.5 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="text-xs font-bold text-amber-700">{salon.ratings?.average || "5.0"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-500 mb-6">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#1E4D8C]" />
                    <p className="text-xs leading-relaxed line-clamp-2 tracking-tight font-medium">
                      {salon.address?.street}, {salon.address?.city}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-[#1E4D8C] uppercase tracking-widest">
                      {t('wishlist.viewDetails')}
                    </span>
                    <div className="w-8 h-8 rounded-full border-2 border-[#1E4D8C] bg-white flex items-center justify-center group-hover:bg-[#1E4D8C] transition-all">
                      <Scissors className="w-4 h-4 text-[#1E4D8C] group-hover:text-white transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-light text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{t('wishlist.wishlistEmpty')}</p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-white bg-[#1E4D8C] rounded-full hover:bg-[#D4AF37] transition-all shadow-lg"
            >
              {t('wishlist.exploreSalons')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}