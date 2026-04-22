import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, Star, Scissors, X, Loader2, Award, Instagram, Clock
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Loader } from "../../components/ui_components/Loader";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";

// Styles
// @ts-ignore - Swiper CSS imports
import "swiper/css";
// @ts-ignore - Swiper pagination CSS
import "swiper/css/pagination";

export default function StaffDetailPage() {
    const { salonId, staffId } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState<any>(null);
    const [salon, setSalon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { apiRequest } = useApi();

    // Reviews State
    const [reviews, setReviews] = useState<any[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        reviewText: "",
        targetType: "STAFF"
    });

    const user = localStorage.getItem("authState");
    const parsedUser = user ? JSON.parse(user) : null;
    const isloggedin = parsedUser?.isAuthenticated;
    const { userapiPost } = usersalonApi();

    useEffect(() => {
        fetchStaffDetails();
        fetchReviews();
        fetchSalonDetails();
    }, [staffId]);

    const fetchReviews = async () => {
        try {
            const res = await apiRequest<any>(`/reviews/STAFF/${staffId}?page=1&limit=20`);
            if (res.data) setReviews(res.data);

        } catch (error) {
            console.error("Staff reviews fetch error:", error);
        }
    };

    const fetchStaffDetails = async () => {
        setLoading(true);
        try {
            const res = await apiRequest<any>(`/salons/${salonId}/staff`);
            if (res.data) {
                const member = res.data.find((s: any) => s.staff_id === staffId);
                setStaff(member);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalonDetails = async () => {
        try {
            const res = await apiRequest<any>(`/salons/${salonId}`);
            if (res.data) {
                setSalon(res.data);
            }
        } catch (error) {
            console.error("Error fetching salon:", error);
        }
    };

    const handlePostReview = async () => {
        if (!reviewData.reviewText.trim()) return alert("Please write a review.");
        setIsReviewSubmitting(true);
        setReviewError(null);
        try {
            const payload = {
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                targetType: "STAFF",
                targetId: staffId
            };

            const res = await userapiPost<any>(`/reviews/reviews`, payload);
            console.log("res = ", res);

            if (res.status === 400) {
                const errorMessage = res?.data?.detail || "Something went wrong. Please try again.";
                setReviewError(errorMessage);
                return;
            }
            if (res.data) {
                setReviewData({ ...reviewData, reviewText: "", rating: 5 });
                setIsReviewModalOpen(false);
                fetchReviews();
            }


        } catch (error: any) {
            console.log("response = ", error?.response);
            console.log("response = ", error?.response?.body);
            console.log("response = ", error?.response?.data);

            const errorMessage = error.response?.data?.detail || "An unexpected error occurred.";
            setReviewError(errorMessage);
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    if (loading) return <Loader isVisible={true} />;
    if (!staff) return <div className="p-20 text-center font-light">Stylist not found.</div>;

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* --- Navigation --- */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Stylist Profile</span>
                    <div className="w-10" />
                </div>
            </nav>

            <main className="">
                {/* --- Full-Width Image Carousel --- */}
                <div className="w-full h-[60vh] md:h-[70vh] relative overflow-hidden">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 5000 }}
                        className="h-full w-full"
                    >
                        {staff.images?.map((img: string, i: number) => (
                            <SwiperSlide key={i}>
                                <div className="relative w-full h-full">
                                    <img 
                                        src={img} 
                                        alt={staff.name} 
                                        className="w-full h-full object-cover animate-[kenBurns_20s_ease-in-out_infinite]" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* --- Glassmorphic MASTER ARTISAN Badge --- */}
                    <div className="absolute bottom-8 left-6 bg-white/10 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl">
                        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em]">Master Artisan</span>
                    </div>

                    {/* --- Glassmorphism Header Card --- */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">{staff.role}</span>
                                        <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                                            <Award className="w-3 h-3" />
                                            Verified Artist
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-serif text-gray-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{staff.name}</h1>
                                    {staff?.instagramHandle && (
                                        <a
                                            href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-2 group"
                                        >
                                            <Instagram className="w-3 h-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] group-hover:text-[#D4AF37] group-hover:underline decoration-[#D4AF37] decoration-2 underline-offset-2 transition-all">
                                                @{staff.instagramHandle.replace('@', '')}
                                            </span>
                                        </a>
                                    )}
                                </div>

                                {/* --- Stats Row with Gold Stars --- */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center border-r border-slate-200 pr-6">
                                        <div className="flex items-center gap-1 text-xl font-black">
                                            <Star className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                                            <span className="text-[#D4AF37]">{staff.rating?.average}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rating</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-black text-gray-900">{staff.experienceYears}+</div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Years Exp</p>
                                    </div>
                                    {staff?.instagramHandle && (
                                        <a
                                            href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-full hover:opacity-90 transition-opacity"
                                        >
                                            <Instagram className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Follow</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Content Section --- */}
                <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 -mt-12 rounded-t-[40px] bg-white relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">

                        {/* --- Signature Services --- */}
                        <section className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-serif text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {staff.name.split(' ')[0]}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                                    Signature Services
                                </p>
                            </div>

                            {/* Contextual Booking Text with Salon Info */}
                            <div className="flex items-center gap-3">
                                {salon?.branding?.coverImages?.[0] && (
                                    <img 
                                        src={salon.branding.coverImages[0]} 
                                        alt={salon.salonName}
                                        className="w-10 h-10 rounded-xl object-cover"
                                    />
                                )}
                                <p className="text-xs text-slate-500 font-normal">
                                    Visit <span className="font-bold text-slate-700">{salon?.salonName || 'the salon'}</span> to book {staff.name.split(' ')[0]} for your transformation
                                </p>
                            </div>

                            <div className="space-y-3">
                                {staff.services?.map((service: any, i: number) => (
                                    <div
                                        key={i}
                                        className="p-4 bg-[#F9F9F9] rounded-2xl shadow-sm border border-slate-100 hover:border-[#D4AF37] hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#D4AF37] flex items-center justify-center">
                                                    <Scissors className="w-5 h-5 text-[#D4AF37]" />
                                                </div>
                                                <span className="text-sm font-black text-gray-800 group-hover:tracking-[0.05em] transition-all duration-300">
                                                    {service.serviceName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs font-bold">{service.durationMinutes}m</span>
                                                </div>
                                                <span className="text-sm font-black text-[#2C2C2C]">
                                                    ₹{service.price}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-normal">Available at this salon</span>
                                            <button
                                                onClick={() => navigate(`/salons/${salonId}`)}
                                                className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
                                            >
                                                Go to Salon →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Ghost Button for Salon Navigation */}
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={() => navigate(`/salons/${salonId}`)}
                                    className="px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border border-[#D4AF37] text-[#D4AF37] rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
                                >
                                    View Salon & Book
                                </button>
                            </div>
                        </section>

                        {/* Expertise */}
                        <section className="space-y-8">
                            {staff?.expertise && staff.expertise.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Specialties</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {staff.expertise.map((exp: string, i: number) => (
                                            <span
                                                key={i}
                                                className="px-4 py-2 rounded-full text-xs font-bold text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50"
                                            >
                                                {exp}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* The Visual Archive */}
                            {staff?.instagramHandle && (
                                <div className="pt-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">The Visual Archive</h4>
                                    <a
                                        href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                                    >
                                        <Instagram className="w-3 h-3" />
                                        View Portfolio
                                    </a>
                                </div>
                            )}

                            {/* Credentials */}
                            {staff.metadata?.certifications && staff.metadata.certifications.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Verified Credentials</h3>
                                    <ul className="space-y-3">
                                        {staff.metadata.certifications.map((cert: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-bold">
                                                <Award className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                <span>{cert}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>

                        {/* Reviews Section */}
                        <section className="space-y-10 pt-10 border-t border-slate-100">
                            <div className="space-y-1">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Truths about {staff.name.split(' ')[0]}</h3>
                                <p className="text-[8px] font-normal text-slate-400 uppercase tracking-[0.2em]">{reviews.length} Verified Reviews</p>
                            </div>

                            <div className="grid gap-8">
                                {reviews.length > 0 ? (
                                    reviews.map((rev, i) => (
                                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2 relative">
                                            {/* Large Quote Mark Background */}
                                            <div className="absolute top-0 left-0 text-[60px] font-serif leading-none opacity-5 text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                "
                                            </div>
                                            
                                            <div className="relative z-10 pl-8">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-black ring-2 ring-white shadow-sm">
                                                            {rev?.userName?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-serif text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>{rev?.userName || "Customer"}</h4>
                                                            <p className="text-[10px] text-slate-400 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= rev.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-slate-200"} />)}
                                                    </div>
                                                </div>
                                                <p className="text-slate-700 italic font-serif text-base leading-relaxed pl-16" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                    "{rev.reviewText}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                                        <p className="text-xs text-slate-400 font-bold italic">No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>

                            {isloggedin && (
                                <div className="flex justify-center pt-8">
                                    <button 
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-900 rounded-full hover:bg-slate-900 hover:text-white transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <span className="relative z-10">Share your transformation story</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[shimmer_2s_infinite]" />
                                    </button>
                                </div>
                            )}
                        </section>
                </div>
            </main>

            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[10px]">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-8 space-y-6 relative">
                        {/* Close Button - Top Right */}
                        <button
                            onClick={() => {
                                setIsReviewModalOpen(false);
                                setReviewError(null);
                            }}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        {/* Title - Serif Font */}
                        <h3 className="text-2xl font-serif font-semibold text-slate-900 text-center mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>How was your transformation?</h3>

                        {/* Error Message Alert */}
                        {reviewError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <div className="bg-red-500 rounded-full p-1 mt-0.5 shrink-0">
                                    <X size={10} className="text-white" />
                                </div>
                                <p className="text-xs font-bold text-red-600 leading-tight">{reviewError}</p>
                            </div>
                        )}

                        {/* Champagne Gold Star Rating */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={36}
                                    className={`cursor-pointer transition-all duration-300 ${
                                        star <= reviewData.rating 
                                            ? "fill-[#D4AF37] text-[#D4AF37] scale-110 drop-shadow-lg" 
                                            : "text-gray-200 hover:scale-125"
                                    }`}
                                    onClick={() => {
                                        setReviewData({ ...reviewData, rating: star });
                                        setReviewError(null);
                                    }}
                                />
                            ))}
                        </div>

                        {/* Textarea - Inter Font */}
                        <textarea
                            disabled={isReviewSubmitting}
                            className={`w-full p-[15px] bg-gray-50 border rounded-2xl text-sm font-sans outline-none focus:ring-2 focus:ring-[#D4AF37]/20 min-h-[120px] transition-all ${
                                reviewError ? 'border-red-200' : 'border-gray-200'
                            }`}
                            placeholder="Describe the magic of your visit..."
                            value={reviewData.reviewText}
                            onChange={(e) => {
                                setReviewData({ ...reviewData, reviewText: e.target.value });
                                if (reviewError) setReviewError(null);
                            }}
                        />

                        {/* Pill Button with Gold Hover */}
                        <button
                            disabled={isReviewSubmitting}
                            onClick={handlePostReview}
                            className="w-full py-4 bg-slate-900 text-white rounded-full font-semibold text-sm tracking-[0.1em] shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-all hover:bg-[#D4AF37] hover:shadow-xl"
                        >
                            {isReviewSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Posting...</span>
                                </>
                            ) : (
                                "Share with the Community"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}