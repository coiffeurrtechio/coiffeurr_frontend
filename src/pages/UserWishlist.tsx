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
      showToast({
        type: "success",
        title: t('wishlist.loginSuccessful'),
        message: t('wishlist.successfullyRemoved'),
        duration: 5000,
      });
      setWishlist((prev) => prev.filter((item) => item.id !== salonId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleSalonNavigate = (id: string) => {
    navigate(`/salons/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Loader isVisible={loading} />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-sm font-bold uppercase tracking-widest text-slate-800">{t('wishlist.myWishlist')}</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((salon) => (
              <Card
                key={salon.id}
                className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white overflow-hidden rounded-3xl"
                onClick={() => handleSalonNavigate(salon.id)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={salon.branding?.coverImages?.[0] || "/placeholder.svg"}
                    alt={salon.salonName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* DELETE OPTION (Heart Button) */}
                  <div className="absolute top-4 right-4">
                    <button
                      className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation(); // Stop navigation to details page
                        handleRemoveFromWishlist(salon.id);
                      }}
                      title={t('wishlist.removeFromWishlist')}
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover/trash:scale-110" />
                    </button>
                  </div>

                  <Badge className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white border-none text-[10px] uppercase tracking-tighter">
                    {salon.salonType || t('wishlist.studio')}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-light tracking-tight text-slate-900 truncate">
                      {salon.salonName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{salon.ratings?.average || "5.0"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-slate-400 mb-6">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed line-clamp-2 uppercase tracking-tighter font-medium">
                      {salon.address?.street}, {salon.address?.city}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-[#1E4D8C] uppercase tracking-widest">
                      {t('wishlist.viewDetails')}
                    </span>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                      <Scissors className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-light text-lg">{t('wishlist.wishlistEmpty')}</p>
            <button
              onClick={() => navigate("/")}
              className="text-xs font-bold uppercase tracking-widest text-[#1E4D8C] border-b border-[#1E4D8C] pb-1"
            >
              {t('wishlist.exploreSalons')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}