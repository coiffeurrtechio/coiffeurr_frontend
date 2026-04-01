import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, Clock, Phone, Mail, CheckCircle, Instagram, Scissors, Share2, X, Loader2 } from "lucide-react"; import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "../../components/ui_components/button";
import { Badge } from "../../components/ui_components/badge";
import { Loader } from "../../components/ui_components/Loader";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI"; // Adjust based on your export
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";

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
        targetType: "STAFF" // Changed to STAFF
    });

    const user = localStorage.getItem("authState");

    const parsedUser = user ? JSON.parse(user) : null;

    const isloggedin = parsedUser?.isAuthenticated;

    const { userapiRequest, userapiPost } = usersalonApi()


    // Add fetchReviews to your useEffect or call it within fetchStaffDetails
    const fetchReviews = async () => {
        try {
            // Note: Endpoint changed to STAFF and uses staffId
            const res = await apiRequest<any>(`/reviews/reviews/STAFF/${staffId}?page=1&limit=20`);
            if (res.data) setReviews(res.data);
        } catch (error) {
            console.error("Staff reviews fetch error:", error);
        }
    };

    const handlePostReview = async () => {
        if (!reviewData.reviewText.trim()) return alert("Please write a review.");

        setIsReviewSubmitting(true);
        setReviewError(null); // Reset error on new attempt

        try {
            const payload = {
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                targetType: "STAFF",
                targetId: staffId
            };

            const res = await userapiPost<any>(`/reviews/reviews`, payload);

            if (res.status === 400) {
                console.log("res?.data = ", res?.data);
                const errorMessage = res?.data?.detail || "An unexpected error occurred.";
                setReviewError(errorMessage);
                return;
            }

            if (res.data) {
                setReviewData({ ...reviewData, reviewText: "", rating: 5 });
                setIsReviewModalOpen(false);
                fetchReviews();
            }


        } catch (error: any) {
            // Look for the "detail" message in the 400 response
            const errorMessage = error.response?.data?.detail || "An unexpected error occurred.";
            setReviewError(errorMessage);
            console.error("Review failed:", error);
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    useEffect(() => {
        fetchStaffDetails();
        fetchReviews();
    }, [staffId]);

    const fetchStaffDetails = async () => {
        setLoading(true);
        try {
            // Fetching from your existing staff endpoint and filtering
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
                    <button className="p-2 hover:bg-slate-50 rounded-full">
                        {/* <Share2 className="w-5 h-5 text-slate-400" /> */}
                    </button>
                </div>
            </nav>

            <main className="pt-16 max-w-7xl mx-auto px-6 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* --- Left Side: Image Gallery --- */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="aspect-[4/5] bg-slate-100 overflow-hidden rounded-sm shadow-2xl">
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
                                <Badge className="bg-[#1E4D8C] text-white px-4 py-1 rounded-none text-[10px] tracking-widest">{staff.role}</Badge>
                                {staff.active && <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Available Today</span>}
                            </div>

                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter">{staff.name}</h1>

                            <div className="flex items-center gap-6 py-4">
                                <div className="text-center border-r border-slate-100 pr-6">
                                    <div className="flex items-center gap-1 text-xl font-medium">
                                        <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                                        {staff.rating?.average}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rating</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-medium">{staff.experienceYears}+</div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Years Exp</p>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Biography</h3>
                                <p className="text-slate-600 font-light leading-relaxed">
                                    With {staff.experienceYears} years in the industry, {staff.name} specializes in {staff.expertise?.join(", ")}.
                                    A dedicated professional known for precision and a bespoke approach to every client.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Credentials</h3>
                                <ul className="space-y-3">
                                    {staff.metadata?.certifications?.map((cert: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <CheckCircle className="w-4 h-4 text-[#1E4D8C] mt-0.5" />
                                            <span>{cert}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3 text-sm text-slate-600">
                                        <Scissors className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <span>Expertise: {staff.expertise?.join(", ")}</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-slate-50 p-8 space-y-6">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Direct Concierge</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">{staff.phone}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">{staff.email}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Instagram className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">{staff.instagramHandle}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">Speaks: {staff.languages?.join(", ")}</span>
                                </div>
                            </div>
                        </section>


                        <section className="space-y-10 pt-10 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Client Feedback</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        {/* <h4 className="text-4xl font-light">{staff?.rating?.average || "5.0"}</h4> */}
                                        <div>
                                            <div className="flex gap-0.5">
                                                {/* {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={12} className={s <= Math.round(staff?.rating?.average || 5) ? "fill-orange-400 text-orange-400" : "text-slate-200"} />
                                                ))} */}
                                            </div>
                                            <p className="text-[9px] font-bold uppercase text-slate-400 mt-1">{reviews.length} Reviews</p>
                                        </div>
                                    </div>
                                </div>
                                {isloggedin && (<Button variant="outline" className="rounded-none text-[10px] font-bold uppercase tracking-widest" onClick={() => setIsReviewModalOpen(true)}>
                                    Rate {staff.name.split(' ')[0]}
                                </Button>)}
                            </div>

                            {reviews.length > 0 ? (
                                <div className="grid gap-8">
                                    {reviews.map((rev, i) => (
                                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                                        {rev.userData?.username?.charAt(0).toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold">{rev.userData?.username || "Customer"}</h4>
                                                        <p className="text-[9px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= rev.rating ? "fill-slate-900 text-slate-900" : "text-slate-200"} />)}
                                                </div>
                                            </div>
                                            <p className="text-slate-600 font-light text-sm pl-11">{rev.reviewText}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center border border-dashed border-slate-100">
                                    <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </section>

                        {/* <div className="flex gap-4">
                            <Button className="flex-1 bg-black text-white rounded-none h-16 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                                Request Appointment
                            </Button>
                        </div> */}
                    </div>
                </div>
            </main>


            {isReviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-800">Rate {staff?.name}</h3>
                            <button onClick={() => {
                                setIsReviewModalOpen(false);
                                setReviewError(null); // Clear error when closing
                            }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>

                        {/* Error Message Display */}
                        {reviewError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                                <div className="bg-red-500 rounded-full p-1 mt-0.5">
                                    <X size={10} className="text-white" />
                                </div>
                                <p className="text-xs font-bold text-red-600 leading-tight">{reviewError}</p>
                            </div>
                        )}

                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={32}
                                    className={`cursor-pointer transition-all ${star <= reviewData.rating ? "fill-orange-400 text-orange-400 scale-110" : "text-gray-200"}`}
                                    onClick={() => {
                                        setReviewData({ ...reviewData, rating: star });
                                        setReviewError(null); // Clear error if they change the rating
                                    }}
                                />
                            ))}
                        </div>

                        <textarea
                            disabled={isReviewSubmitting}
                            className={`w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[120px] transition-colors ${reviewError ? 'border-red-200' : 'border-gray-100'}`}
                            placeholder={`How was your session with ${staff.name}?`}
                            value={reviewData.reviewText}
                            onChange={(e) => {
                                setReviewData({ ...reviewData, reviewText: e.target.value });
                                if (reviewError) setReviewError(null); // Clear error as they type
                            }}
                        />

                        <button
                            disabled={isReviewSubmitting}
                            onClick={handlePostReview}
                            className="w-full py-4 bg-[#1E4D8C] text-white rounded-2xl font-black text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isReviewSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
                            ) : (
                                "Submit Review"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}