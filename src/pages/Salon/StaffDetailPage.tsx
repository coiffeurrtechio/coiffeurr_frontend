import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    ArrowLeft, Star, Clock, Phone, Mail, CheckCircle,
    Instagram, Scissors, X, Loader2, ChevronRight, Briefcase
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "../../components/ui_components/button";
import { Badge } from "../../components/ui_components/badge";
import { Loader } from "../../components/ui_components/Loader";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";

// Styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function StaffDetailPage() {
    const { salonId, staffId } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState<any>(null);
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
    }, [staffId]);

    const fetchReviews = async () => {
        try {
            const res = await apiRequest<any>(`/reviews/reviews/STAFF/${staffId}?page=1&limit=20`);
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

            <main className="pt-16 max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* --- Left Side: Image Gallery --- */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="aspect-[4/5] bg-slate-100 overflow-hidden rounded-3xl shadow-2xl">
                                <Swiper
                                    modules={[Pagination, Autoplay, EffectFade]}
                                    effect="fade"
                                    pagination={{ clickable: true }}
                                    autoplay={{ delay: 5000 }}
                                    className="h-full w-full"
                                >
                                    {staff.images?.map((img: string, i: number) => (
                                        <SwiperSlide key={i}>
                                            <img src={img} alt={staff.name} className="w-full h-full object-cover" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Side: Content --- */}
                    <div className="lg:col-span-7 space-y-12">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge className="bg-[#1E4D8C] text-white px-4 py-1 rounded-full text-[10px] tracking-widest uppercase">{staff.role}</Badge>
                                {staff.active && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Available Today
                                    </span>
                                )}
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900">{staff.name}</h1>

                            <div className="flex items-center gap-6 py-4">
                                <div className="text-center border-r border-slate-100 pr-6">
                                    <div className="flex items-center gap-1 text-xl font-black">
                                        <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                                        {staff.rating?.average}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rating</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-black">{staff.experienceYears}+</div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Years Exp</p>
                                </div>
                            </div>
                        </section>

                        {/* --- UPDATED: HORIZONTAL SERVICES SECTION --- */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                    <Scissors className="w-4 h-4 text-[#1E4D8C]" />
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        Services by {staff.name.split(' ')[0]}
                                    </h3>
                                </div>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                    Scroll to view
                                </span>
                            </div>

                            {/* Horizontal Scroll Container */}
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
                                {staff.services?.map((service: any) => (
                                    <Link
                                        to={`/salon/${salonId}/service/${service.service_id}`}
                                        state={{ serviceData: service }}
                                        key={service.service_id}
                                        className="group flex-shrink-0 w-64 bg-slate-50 hover:bg-white rounded-3xl p-4 transition-all border border-transparent hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5"
                                    >
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm">
                                            <img
                                                src={service.imageUrl}
                                                alt={service.serviceName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                                <Clock size={10} className="text-[#1E4D8C]" />
                                                <span className="text-[9px] font-black">{service.durationMinutes}m</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1 px-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-black text-gray-800 truncate leading-tight">
                                                    {service.serviceName}
                                                </h4>
                                                <span className="text-sm font-black text-[#1E4D8C]">
                                                    ₹{service.price}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    Book Experience
                                                </span>
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#1E4D8C] group-hover:text-white transition-colors">
                                                    <ChevronRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}

                                {/* Placeholder for visual balance if list is short */}
                                <div className="flex-shrink-0 w-4" />
                            </div>
                        </section>

                        {/* Biography & Credentials */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Biography</h3>
                                <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                    With {staff.experienceYears} years in the industry, {staff.name} specializes in {staff.expertise?.join(", ")}.
                                    A dedicated professional known for precision and a bespoke approach to every client.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Credentials</h3>
                                <ul className="space-y-3">
                                    {staff.metadata?.certifications?.map((cert: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                                            <CheckCircle className="w-4 h-4 text-[#1E4D8C] mt-0.5 shrink-0" />
                                            <span>{cert}</span>
                                        </li>
                                    ))}
                                    {staff?.expertise.length > 0 && <li className="flex items-start gap-3 text-sm text-slate-600 font-bold">
                                        <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <span>Expertise: {staff.expertise?.join(", ")}</span>
                                    </li>}
                                </ul>
                            </div>
                        </section>

                        {/* Concierge Info */}
                        <section className="bg-slate-50 p-8 rounded-3xl space-y-6 border border-slate-100">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Direct Concierge</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {staff?.phone && <ContactItem icon={<Phone size={14} />} label={staff.phone} />}
                                {staff?.email && <ContactItem icon={<Mail size={14} />} label={staff.email} />}
                                {staff?.instagramHandle && <ContactItem icon={<Instagram size={14} />} label={staff.instagramHandle} />}
                                {staff?.languages.length > 0 && <ContactItem icon={<Clock size={14} />} label={`Speaks: ${staff.languages?.join(", ")}`} />}
                            </div>
                        </section>

                        {/* Reviews Section */}
                        <section className="space-y-10 pt-10 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Client Feedback</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-400 mt-1">{reviews.length} Verified Reviews</p>
                                </div>
                                {isloggedin && (
                                    <Button variant="outline" className="rounded-full px-6 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-50" onClick={() => setIsReviewModalOpen(true)}>
                                        Rate {staff.name.split(' ')[0]}
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-8">
                                {reviews.length > 0 ? (
                                    reviews.map((rev, i) => (
                                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black ring-2 ring-white shadow-sm">
                                                        {rev?.userName?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-800">{rev?.userName || "Customer"}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= rev.rating ? "fill-orange-400 text-orange-400" : "text-slate-200"} />)}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 font-medium text-sm pl-13">{rev.reviewText}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                                        <p className="text-xs text-slate-400 font-bold italic">No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-800 tracking-tight">Rate {staff?.name}</h3>
                            <button onClick={() => { setIsReviewModalOpen(false); setReviewError(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>

                        {reviewError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                <X size={14} className="text-red-500 mt-0.5" />
                                <p className="text-xs font-bold text-red-600 leading-tight">{reviewError}</p>
                            </div>
                        )}

                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={36}
                                    className={`cursor-pointer transition-all ${star <= reviewData.rating ? "fill-orange-400 text-orange-400 scale-110" : "text-gray-100"}`}
                                    onClick={() => { setReviewData({ ...reviewData, rating: star }); setReviewError(null); }}
                                />
                            ))}
                        </div>

                        <textarea
                            disabled={isReviewSubmitting}
                            className="w-full p-5 bg-gray-50 border-none rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-50 min-h-[140px] font-medium"
                            placeholder={`How was your session with ${staff.name.split(' ')[0]}?`}
                            value={reviewData.reviewText}
                            onChange={(e) => { setReviewData({ ...reviewData, reviewText: e.target.value }); if (reviewError) setReviewError(null); }}
                        />

                        <button
                            disabled={isReviewSubmitting}
                            onClick={handlePostReview}
                            className="w-full py-4 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {isReviewSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Post Review"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper Component for UI consistency
const ContactItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-4 group">
        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-[#1E4D8C] transition-colors">{icon}</div>
        <span className="text-sm font-black text-slate-600 truncate">{label || "N/A"}</span>
    </div>
);