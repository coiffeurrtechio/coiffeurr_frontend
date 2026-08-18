import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, Star, Scissors, X, Loader2, Award, Instagram, Clock, Facebook, ChevronRight,
    Image, Trash2,
    Sparkles,
    Gift,
    Check
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Loader } from "../../components/ui_components/Loader";
import { useApi } from "../../API/SalonsAPIs/ALLSalonAPI";
import { usersalonApi } from "../../API/SalonsAPIs/UserSalonAPI";
import { useTranslation } from 'react-i18next';
import { getDefaultStaffImage, getDefaultSalonImage } from '../../utils/defaultServiceImage';

// Styles
// @ts-ignore - Swiper CSS imports
import "swiper/css";
// @ts-ignore - Swiper pagination CSS
import "swiper/css/pagination";

export default function StaffDetailPage() {
    const { t } = useTranslation();
    const { salonId, staffId } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState<any>(null);
    const [salon, setSalon] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { apiRequest } = useApi();

    // Reviews State
    const [reviews, setReviews] = useState<any[]>([]);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [allReviews, setAllReviews] = useState<any[]>([]);
    const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
    const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsSortBy, setReviewsSortBy] = useState('latest');
    const reviewsPerPage = 10;
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isPolishing, setIsPolishing] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        reviewText: "",
        targetType: "STAFF"
    });
    const [reviewImages, setReviewImages] = useState<File[]>([]);
    const reviewImageInputRef = useRef<HTMLInputElement>(null);
    const [existingReview, setExistingReview] = useState<any>(null);
    const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);

    const user = localStorage.getItem("authState");
    const parsedUser = user ? JSON.parse(user) : null;
    const isloggedin = parsedUser?.isAuthenticated;
    const currentUserId = parsedUser?.user?.user?.id || parsedUser?.user?.id;
    const { userapiPost, apiCustomerPut } = usersalonApi();

    useEffect(() => {
        fetchStaffDetails();
        fetchReviews();
        fetchSalonDetails();
    }, [staffId]);

    const fetchReviews = async () => {
        try {
            const res = await apiRequest<any>(`/reviews/STAFF/${staffId}?page=1&limit=${reviewsPerPage}`);
            if (res.data) setReviews(res.data);
        } catch (error) {
            console.error("Staff reviews fetch error:", error);
        }
    };

    const fetchPaginatedReviews = async (page: number = 1, sortBy: string = reviewsSortBy) => {
        try {
            setReviewsLoading(true);
            let sortParam = '';
            if (sortBy === 'latest') {
                sortParam = '&sort=-createdAt';
            } else if (sortBy === 'oldest') {
                sortParam = '&sort=createdAt';
            } else if (sortBy === 'highest') {
                sortParam = '&sort=-rating';
            } else if (sortBy === 'lowest') {
                sortParam = '&sort=rating';
            }
            
            const res = await apiRequest<any>(
                `/reviews/STAFF/${staffId}?page=${page}&limit=${reviewsPerPage}${sortParam}`
            );
            if (res.data) {
                setAllReviews(res.data);
                // Calculate total pages based on review summary
                const summary = await apiRequest<any>(`/reviews/STAFF/${staffId}/summary`);
                if (summary.data) {
                    const totalReviews = summary.data.totalReviews || 0;
                    setReviewsTotalPages(Math.ceil(totalReviews / reviewsPerPage));
                }
            }
        } catch (err) {
            console.error('Error fetching paginated reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleViewAllReviews = () => {
        setIsReviewsModalOpen(true);
    };

    const handleReviewsPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= reviewsTotalPages) {
            setReviewsCurrentPage(newPage);
            fetchPaginatedReviews(newPage, reviewsSortBy);
        }
    };

    const handleSortChange = (newSort: string) => {
        setReviewsSortBy(newSort);
        setReviewsCurrentPage(1);
        fetchPaginatedReviews(1, newSort);
    };

    useEffect(() => {
        if (isReviewsModalOpen) {
            fetchPaginatedReviews(1);
            setReviewsCurrentPage(1);
        }
    }, [isReviewsModalOpen]);

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

    const findExistingReview = () => {
        if (!currentUserId) return null;
        return [...reviews, ...allReviews].find((r) => r.userId === currentUserId);
    };

    const uploadReviewImages = async (): Promise<string[]> => {
        if (!reviewImages.length) return [];
        const formData = new FormData();
        reviewImages.forEach((file) => formData.append('files', file));
        formData.append('salon_id', salonId || '');
        formData.append('staff_id', staffId || '');
        const uploadRes = await userapiPost<any>(`/upload/review-images`, formData);
        if (uploadRes.error || !uploadRes.data?.success) {
            throw new Error(uploadRes.error || uploadRes.data?.detail || "Image upload failed");
        }
        return uploadRes.data.data?.urls || [];
    };

    const handleUpdateReview = async () => {
        if (!existingReview) return;
        setIsReviewSubmitting(true);
        setReviewError(null);
        try {
            const imageUrls = await uploadReviewImages();
            const updatePayload: any = {
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
            };
            if (imageUrls.length) updatePayload.images = imageUrls;

            const res = await apiCustomerPut<any>(`/reviews/${existingReview.id}`, updatePayload);
            console.log("update res = ", res);

            if (res.status === 400 || res.error) {
                setReviewError(res?.data?.detail || res.error || "Update failed");
                return;
            }

            setReviewData({ ...reviewData, reviewText: "", rating: 5 });
            setReviewImages([]);
            setExistingReview(null);
            setIsUpdateConfirmOpen(false);
            setIsReviewModalOpen(false);
            setNotification({
                message: 'Yay! Review updated successfully!',
                type: 'success'
            });
            setTimeout(() => setNotification(null), 4000);
            fetchReviews();
        } catch (error: any) {
            console.log("update error = ", error);
            setReviewError(error.message || error.response?.data?.detail || "Update failed");
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    const handleAIPolish = async () => {
        if (!reviewData.reviewText.trim()) return;
        setIsPolishing(true);
        setReviewError(null);
        try {
            const res = await userapiPost<any>(`/ai/review-polish/`, {
                text: reviewData.reviewText,
                tone: "friendly and professional",
                max_length: 200
            });
            if (res.error || !res.data?.polished_text) {
                setReviewError(res.error || "AI polish failed");
                return;
            }
            setReviewData({ ...reviewData, reviewText: res.data.polished_text });
        } catch (error: any) {
            setReviewError(error.message || "AI polish failed");
            console.error("AI polish failed:", error);
        } finally {
            setIsPolishing(false);
        }
    };

    const handlePostReview = async () => {
        if (!reviewData.reviewText.trim()) return alert("Please write a review.");

        const existing = findExistingReview();
        if (existing) {
            setExistingReview(existing);
            setIsUpdateConfirmOpen(true);
            return;
        }

        setIsReviewSubmitting(true);
        setReviewError(null);
        try {
            const imageUrls = await uploadReviewImages();

            const payload = {
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                targetType: "STAFF",
                targetId: staffId,
                images: imageUrls
            };

            const res = await userapiPost<any>(`/reviews`, payload);
            console.log("res = ", res);

            if (res.status === 400) {
                const errorMessage = res?.data?.detail || "Something went wrong. Please try again.";
                setReviewError(errorMessage);
                return;
            }
            if (res.data) {
                const points = res.data.pointsEarned || 0;
                setReviewData({ ...reviewData, reviewText: "", rating: 5 });
                setReviewImages([]);
                setIsReviewModalOpen(false);
                setNotification({
                    message: points ? `Yay! You won ${points} points!` : 'Review posted successfully!',
                    type: 'success'
                });
                setTimeout(() => setNotification(null), 4000);
                fetchReviews();
            }


        } catch (error: any) {
            console.log("response = ", error?.response);
            console.log("response = ", error?.response?.body);
            console.log("response = ", error?.response?.data);

            const errorMessage = error.message || error.response?.data?.detail || "An unexpected error occurred.";
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{t('common.stylistProfile')}</span>
                    <div className="w-10" />
                </div>
            </nav>

            {notification && (
                <div onClick={(e) => e.stopPropagation()} className={`fixed top-20 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 bg-white border-l-4 ${notification.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                    {notification.type === 'success' && <Check size={20} className="text-black" />}
                    <span className="text-sm font-semibold text-center text-black whitespace-nowrap">{notification.message}</span>
                </div>
            )}

            <main className="">
                {/* --- Full-Width Image Carousel --- */}
                <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] relative overflow-hidden">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 5000 }}
                        className="h-full w-full"
                    >
                        {(staff.images?.length > 0 ? staff.images : [getDefaultStaffImage(staff.staff_id || staff.name || '')]).map((img: string, i: number) => (
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
                        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em]">{t('common.masterArtisan')}</span>
                    </div>

                    {/* --- Glassmorphism Header Card --- */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-2xl">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                            <div className="flex flex-col md:flex-row md:items-end gap-3 sm:gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">{staff.role}</span>
                                        <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                                            <Award className="w-3 h-3" />
                                            Verified Artist
                                        </span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-gray-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{staff.name}</h1>
                                    <div className="flex items-center gap-4 mt-2">
                                        {staff?.instagramHandle && (
                                            <a
                                                href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 group"
                                            >
                                                <Instagram className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] group-hover:text-[#D4AF37] group-hover:underline decoration-[#D4AF37] decoration-2 underline-offset-2 transition-all">
                                                    @{staff.instagramHandle.replace('@', '')}
                                                </span>
                                            </a>
                                        )}
                                        {staff?.facebookHandle && (
                                            <a
                                                href={`https://facebook.com/${staff.facebookHandle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 group"
                                            >
                                                <Facebook className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] group-hover:text-[#D4AF37] group-hover:underline decoration-[#D4AF37] decoration-2 underline-offset-2 transition-all">
                                                    @{staff.facebookHandle.replace('@', '')}
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* --- Stats Row with Gold Stars --- */}
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="text-center border-r border-slate-200 pr-4 sm:pr-6">
                                        <div className="flex items-center gap-1 text-lg sm:text-xl font-black">
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#D4AF37] text-[#D4AF37]" />
                                            <span className="text-[#D4AF37]">{staff.rating?.average}</span>
                                        </div>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('common.rating')}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg sm:text-xl font-black text-gray-900">{staff.experienceYears}+</div>
                                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('common.yearsExp')}</p>
                                    </div>
                                    {staff?.instagramHandle && (
                                        <a
                                            href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-full hover:opacity-90 transition-opacity"
                                        >
                                            <Instagram className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{t('common.follow')}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Content Section --- */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16 -mt-8 sm:-mt-12 rounded-t-[30px] sm:rounded-t-[40px] bg-white relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">

                        {/* --- Signature Services --- */}
                        <section className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-serif text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    {staff.name.split(' ')[0]}
                                </h2>
                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                                    Signature Services
                                </p>
                            </div>

                            {/* Contextual Booking Text with Salon Info */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img 
                                    src={salon?.branding?.coverImages?.[0] || getDefaultSalonImage(salon?.id || salon?.salonName || '')} 
                                    alt={salon?.salonName}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover"
                                />
                                <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                                    Visit <span className="font-bold text-slate-700">{salon?.salonName || 'the salon'}</span> to book {staff.name.split(' ')[0]} for your transformation
                                </p>
                            </div>

                            <div className="space-y-3">
                                {staff.services?.map((service: any, i: number) => (
                                    <div
                                        key={i}
                                        className="p-3 sm:p-4 bg-[#F9F9F9] rounded-2xl shadow-sm border border-slate-100 hover:border-[#D4AF37] hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border-2 border-[#D4AF37] flex items-center justify-center">
                                                    <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-gray-800 group-hover:tracking-[0.05em] transition-all duration-300">
                                                    {service.serviceName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                    <span className="text-[10px] sm:text-xs font-bold">{service.durationMinutes}m</span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-[#2C2C2C]">
                                                    ₹{service.price}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-200 pt-2 sm:pt-3 flex items-center justify-between">
                                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">Available at this salon</span>
                                            <button
                                                onClick={() => navigate(`/salons/${salonId}`)}
                                                className="text-[9px] sm:text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all"
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
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">{t('common.specialties')}</h3>
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
                            {(staff?.instagramHandle || staff?.facebookHandle || staff?.otherLinks) && (
                                <div className="pt-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{t('common.visualArchive')}</h4>
                                    <div className="flex gap-3 flex-wrap">
                                        {staff?.instagramHandle && (
                                            <a
                                                href={`https://instagram.com/${staff.instagramHandle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                                            >
                                                <Instagram className="w-3 h-3" />
                                                Instagram
                                            </a>
                                        )}
                                        {staff?.facebookHandle && (
                                            <a
                                                href={`https://facebook.com/${staff.facebookHandle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                                            >
                                                <Facebook className="w-3 h-3" />
                                                Facebook
                                            </a>
                                        )}
                                        {staff?.otherLinks && (
                                            <a
                                                href={staff.otherLinks.startsWith('http') ? staff.otherLinks : `https://${staff.otherLinks}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-2 border border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                Other
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Credentials */}
                            {staff.metadata?.certifications && staff.metadata.certifications.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">{t('common.verifiedCredentials')}</h3>
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
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('common.truthsAbout')} {staff.name.split(' ')[0]}</h3>
                                <p className="text-[8px] font-normal text-slate-400 uppercase tracking-[0.2em]">{reviews.length} Verified Reviews</p>
                            </div>

                            <div className="grid gap-8">
                                {reviews.length > 0 ? (
                                    reviews.slice(0, reviewsPerPage).map((rev, i) => (
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
                                                {rev.images?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4 pl-16">
                                                        {rev.images.map((url: string, idx: number) => (
                                                            <img
                                                                key={idx}
                                                                src={url}
                                                                alt=""
                                                                className="w-16 h-16 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-90"
                                                                onClick={() => window.open(url, '_blank')}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                                        <p className="text-xs text-slate-400 font-bold italic">{t('common.noReviewsYet')}</p>
                                    </div>
                                )}
                            </div>

                            {/* View All Reviews Button */}
                            {reviews.length > 0 && (
                                <div className="text-center pt-8">
                                    <button
                                        onClick={handleViewAllReviews}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20"
                                    >
                                        View All Reviews
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )}

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
                            disabled={isReviewSubmitting || isPolishing}
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

                        {/* AI Polish */}
                        <button
                            type="button"
                            disabled={!reviewData.reviewText.trim() || isPolishing || isReviewSubmitting}
                            onClick={handleAIPolish}
                            className="w-full py-2.5 border border-[#D4AF37]/40 text-[#B8952E] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isPolishing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Polishing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Write with AI
                                </>
                            )}
                        </button>

                        {/* Review Image Upload */}
                        <input
                            ref={reviewImageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={isReviewSubmitting}
                            onChange={(e) => {
                                const files = e.target.files ? Array.from(e.target.files) : [];
                                if (files.length) setReviewImages((prev) => [...prev, ...files].slice(0, 5));
                            }}
                        />
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-600">Add up to 5 photos</p>
                                <button
                                    type="button"
                                    disabled={reviewImages.length >= 5 || isReviewSubmitting}
                                    onClick={() => reviewImageInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-50 transition-all"
                                >
                                    <Image size={12} />
                                    Add Photos
                                </button>
                            </div>
                            {reviewImages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {reviewImages.map((file, i) => (
                                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setReviewImages(reviewImages.filter((_, idx) => idx !== i))}
                                                className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Potential Points */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl">
                            <Gift size={16} className="text-[#D4AF37]" />
                            <span className="text-xs font-semibold text-[#B8952E]">
                                {reviewImages.length > 0
                                    ? `Earn ${10 + Math.min(reviewImages.length, 5) * 10} points: 5 for rating, 5 for review, and ${Math.min(reviewImages.length, 5) * 10} for your photos`
                                    : 'Earn 10 points: 5 for rating + 5 for your review'}
                            </span>
                        </div>

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

            {/* Update Existing Review Confirmation */}
            {isUpdateConfirmOpen && existingReview && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-8 space-y-6 relative animate-in zoom-in duration-300">
                        <button
                            onClick={() => setIsUpdateConfirmOpen(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        <h3 className="text-2xl font-serif font-semibold text-slate-900 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                            You already shared your thoughts
                        </h3>

                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={16}
                                        className={s <= existingReview.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}
                                    />
                                ))}
                                <span className="text-xs text-gray-500">Your previous rating</span>
                            </div>
                            <p className="text-sm text-gray-700 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                "{existingReview.reviewText || existingReview.text}"
                            </p>
                        </div>

                        <p className="text-sm text-slate-600 text-center">
                            Would you like to update this review with your new feedback?
                        </p>

                        {reviewError && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 text-center">
                                {reviewError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsUpdateConfirmOpen(false)}
                                className="flex-1 py-3 border border-slate-900 text-slate-900 rounded-full font-semibold text-sm tracking-wider hover:bg-slate-50 transition-all"
                            >
                                Keep as is
                            </button>
                            <button
                                disabled={isReviewSubmitting}
                                onClick={handleUpdateReview}
                                className="flex-1 py-3 bg-[#D4AF37] text-white rounded-full font-semibold text-sm tracking-wider shadow-lg disabled:opacity-70 hover:bg-[#C9A227] transition-all"
                            >
                                {isReviewSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    "Update review"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Modal (View All) */}
            {isReviewsModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0a0a0a]/60 backdrop-blur-sm">
                    <div className="bg-white/90 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-gradient-to-r from-gray-50/80 to-white/80">
                            <div>
                                <h3 className="text-xl font-black text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', serif" }}>{t('common.allReviews')}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Page {reviewsCurrentPage} of {reviewsTotalPages}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    value={reviewsSortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="text-xs font-semibold text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Rated</option>
                                    <option value="lowest">Lowest Rated</option>
                                </select>
                                <button
                                    onClick={() => setIsReviewsModalOpen(false)}
                                    className="p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white/80 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh] relative custom-scrollbar mt-2">
                            {reviewsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {allReviews.length > 0 ? (
                                            allReviews.map((review: any, idx: number) => (
                                                <div key={review.id || idx} className="bg-white/95 rounded-2xl p-4 border border-white/10 hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C9A227]/20 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-bold text-[#D4AF37]">
                                                                {review.userName?.charAt(0).toUpperCase() || 'A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{review.userName || 'Anonymous'}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        size={12}
                                                                        className={i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 flex-shrink-0">
                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{review.text || review.reviewText || 'No review text'}</p>
                                                    {review.images?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {review.images.map((url: string, idx: number) => (
                                                                <img
                                                                    key={idx}
                                                                    src={url}
                                                                    alt=""
                                                                    className="w-14 h-14 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                                                                    onClick={() => window.open(url, '_blank')}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-gray-400 italic" style={{ fontFamily: "'Playfair Display', serif" }}>No reviews yet.</p>
                                            </div>
                                        )}
                                    </div>
                                    {reviewsTotalPages > 1 && (
                                        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200/50">
                                            <button
                                                onClick={() => handleReviewsPageChange(reviewsCurrentPage - 1)}
                                                disabled={reviewsCurrentPage === 1}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight size={20} className="text-gray-600 rotate-180" />
                                            </button>
                                            <span className="text-sm font-semibold text-gray-700">
                                                Page {reviewsCurrentPage} of {reviewsTotalPages}
                                            </span>
                                            <button
                                                onClick={() => handleReviewsPageChange(reviewsCurrentPage + 1)}
                                                disabled={reviewsCurrentPage === reviewsTotalPages}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight size={20} className="text-gray-600" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}