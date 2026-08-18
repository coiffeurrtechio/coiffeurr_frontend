import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Loader2, X, Store, Scissors, Calendar, Clock, User, CheckCircle, Image, Trash2, Sparkles, Gift } from "lucide-react";

function ReviewImageUpload({
  label,
  images,
  setImages,
  disabled,
}: {
  label: string;
  images: File[];
  setImages: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) setImages([...images, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-600">{label}</p>
        <button
          type="button"
          disabled={disabled || images.length >= 5}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-50 transition-all"
        >
          <Image size={12} />
          Add Photos
        </button>
      </div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((file, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0 right-0 p-0.5 bg-black/50 text-white rounded-bl"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FeedbackData {
  userId: string;
  userName: string;
  bookingId: string;
  salonId: string;
  salonName: string;
  staffId?: string;
  staffName?: string;
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  price: number;
  status: string;
  salonReview?: any;
  staffReview?: any;
}

export default function FeedbackPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);

  const [salonRating, setSalonRating] = useState(5);
  const [salonReviewText, setSalonReviewText] = useState("");
  const [salonSubmitted, setSalonSubmitted] = useState(false);
  const [salonError, setSalonError] = useState<string | null>(null);

  const [staffRating, setStaffRating] = useState(5);
  const [staffReviewText, setStaffReviewText] = useState("");
  const [staffSubmitted, setStaffSubmitted] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  const [salonImages, setSalonImages] = useState<File[]>([]);
  const [staffImages, setStaffImages] = useState<File[]>([]);
  const [polishingTarget, setPolishingTarget] = useState<'SALON' | 'STAFF' | null>(null);
  const [salonPointsEarned, setSalonPointsEarned] = useState(0);
  const [staffPointsEarned, setStaffPointsEarned] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedbackData();
  }, [bookingId]);

  const fetchFeedbackData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/feedback/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }
      const data = await response.json();
      setFeedbackData(data);

      if (data.salonReview) {
        setSalonRating(data.salonReview.rating);
        setSalonReviewText(data.salonReview.reviewText || "");
        setSalonSubmitted(true);
      }

      if (data.staffReview) {
        setStaffRating(data.staffReview.rating);
        setStaffReviewText(data.staffReview.reviewText || "");
        setStaffSubmitted(true);
      }
    } catch (err) {
      setError('Unable to load feedback page. Please check your link or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const uploadReviewImages = async (files: File[], targetType: 'SALON' | 'STAFF'): Promise<string[]> => {
    if (!files.length || !feedbackData) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('salon_id', feedbackData.salonId);
    if (targetType === 'STAFF' && feedbackData.staffId) {
      formData.append('staff_id', feedbackData.staffId);
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/upload/review-images`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.detail || 'Image upload failed');
    return data.data?.urls || [];
  };

  const polishText = async (
    target: 'SALON' | 'STAFF',
    currentText: string,
    setText: (value: string) => void,
    setErrorFn: (e: string | null) => void
  ) => {
    if (!currentText.trim()) return;
    setPolishingTarget(target);
    setErrorFn(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ai/review-polish/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          tone: 'friendly and professional',
          max_length: 200
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'AI polish failed');
      setText(data.polished_text || currentText);
    } catch (error: any) {
      setErrorFn(error.message || 'AI polish failed');
    } finally {
      setPolishingTarget(null);
    }
  };

  const submitReview = async (
    targetType: 'SALON' | 'STAFF',
    targetId: string,
    rating: number,
    reviewText: string,
    images: File[],
    setErrorFn: (e: string | null) => void
  ) => {
    if (!reviewText.trim()) {
      setErrorFn('Please write a review');
      return;
    }

    setSubmitting(true);
    setErrorFn(null);
    try {
      let imageUrls: string[] = [];
      if (images.length) {
        imageUrls = await uploadReviewImages(images, targetType);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/feedback/${bookingId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          rating,
          reviewText,
          images: imageUrls
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorFn(data.detail || "An unexpected error occurred.");
        return;
      }

      if (data.success) {
        const points = data.review?.pointsEarned || 0;
        if (targetType === 'SALON') {
          setSalonSubmitted(true);
          setSalonPointsEarned(points);
          setSalonReviewText("");
          setSalonRating(5);
          setSalonImages([]);
        } else {
          setStaffSubmitted(true);
          setStaffPointsEarned(points);
          setStaffReviewText("");
          setStaffRating(5);
          setStaffImages([]);
        }
      }
    } catch (error: any) {
      setErrorFn(error.message || error.response?.data?.detail || "Review failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (error || !feedbackData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{error || 'Unable to load feedback page'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold text-sm tracking-[0.1em] hover:bg-[#D4AF37] transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            How was your experience?
          </h1>
          <p className="text-slate-600">
            Hi {feedbackData.userName}! Help us improve by sharing your feedback
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-100">
            <h2 className="text-xl font-serif font-semibold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Booking Details
            </h2>
            <p className="text-slate-500 text-sm mt-1">Service completed on {feedbackData.serviceDate}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Store size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Salon</p>
                <p className="font-semibold text-slate-900">{feedbackData.salonName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scissors size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Service</p>
                <p className="font-semibold text-slate-900">{feedbackData.serviceName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Date</p>
                <p className="font-semibold text-slate-900">{feedbackData.serviceDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Time</p>
                <p className="font-semibold text-slate-900">{feedbackData.serviceTime}</p>
              </div>
            </div>

            {feedbackData.staffName && (
              <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                <User size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Artist</p>
                  <p className="font-semibold text-slate-900">{feedbackData.staffName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-serif font-semibold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Rate the Salon
              </h3>
              <p className="text-slate-500 text-sm mt-1">How was your experience at {feedbackData.salonName}?</p>
            </div>
            {salonSubmitted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={18} />
                <span className="font-medium text-sm">{salonPointsEarned > 0 ? `Yay! +${salonPointsEarned} pts` : 'Submitted'}</span>
              </div>
            )}
          </div>

          {salonError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 mb-6">
              <div className="bg-red-500 rounded-full p-1 mt-0.5 shrink-0">
                <X size={10} className="text-white" />
              </div>
              <p className="text-xs font-bold text-red-600 leading-tight">{salonError}</p>
            </div>
          )}

          {!salonSubmitted && (
            <>
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={36}
                    className={`cursor-pointer transition-all duration-300 ${
                      star <= salonRating
                        ? "fill-[#D4AF37] text-[#D4AF37] scale-110 drop-shadow-lg"
                        : "text-gray-200 hover:scale-125"
                    }`}
                    onClick={() => {
                      setSalonRating(star);
                      setSalonError(null);
                    }}
                  />
                ))}
              </div>

              <textarea
                disabled={submitting || polishingTarget === 'SALON'}
                className={`w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 min-h-[120px] transition-all ${
                  salonError ? 'border-red-200' : 'border-gray-200'
                }`}
                placeholder="Describe your experience at the salon..."
                value={salonReviewText}
                onChange={(e) => {
                  setSalonReviewText(e.target.value);
                  if (salonError) setSalonError(null);
                }}
              />

              <button
                type="button"
                disabled={!salonReviewText.trim() || polishingTarget === 'SALON' || submitting}
                onClick={() => polishText('SALON', salonReviewText, setSalonReviewText, setSalonError)}
                className="w-full py-2.5 border border-[#D4AF37]/40 text-[#B8952E] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {polishingTarget === 'SALON' ? (
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

              <ReviewImageUpload label="Add up to 5 salon photos" images={salonImages} setImages={setSalonImages} disabled={submitting} />

              <div className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl">
                <Gift size={16} className="text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#B8952E]">
                  {salonImages.length > 0
                    ? `Earn ${10 + Math.min(salonImages.length, 5) * 10} points: 5 for rating, 5 for review, and ${Math.min(salonImages.length, 5) * 10} for your photos`
                    : 'Earn 10 points: 5 for rating + 5 for your review'}
                </span>
              </div>

              <button
                disabled={submitting || salonRating === 0}
                onClick={() => submitReview('SALON', feedbackData.salonId, salonRating, salonReviewText, salonImages, setSalonError)}
                className="w-full py-4 bg-slate-900 text-white rounded-full font-semibold text-sm tracking-[0.1em] shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-all hover:bg-[#D4AF37] hover:shadow-xl mt-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Salon Review"
                )}
              </button>
            </>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-serif font-semibold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                Rate the Artist
              </h3>
              <p className="text-slate-500 text-sm mt-1">How was {feedbackData.staffName || 'the artist'}'s service?</p>
            </div>
            {staffSubmitted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={18} />
                <span className="font-medium text-sm">{staffPointsEarned > 0 ? `Yay! +${staffPointsEarned} pts` : 'Submitted'}</span>
              </div>
            )}
          </div>

          {staffError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 mb-6">
              <div className="bg-red-500 rounded-full p-1 mt-0.5 shrink-0">
                <X size={10} className="text-white" />
              </div>
              <p className="text-xs font-bold text-red-600 leading-tight">{staffError}</p>
            </div>
          )}

          {!staffSubmitted && (
            <>
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={36}
                    className={`cursor-pointer transition-all duration-300 ${
                      star <= staffRating
                        ? "fill-[#D4AF37] text-[#D4AF37] scale-110 drop-shadow-lg"
                        : "text-gray-200 hover:scale-125"
                    }`}
                    onClick={() => {
                      setStaffRating(star);
                      setStaffError(null);
                    }}
                  />
                ))}
              </div>

              <textarea
                disabled={submitting || polishingTarget === 'STAFF'}
                className={`w-full p-4 bg-gray-50 border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/20 min-h-[120px] transition-all ${
                  staffError ? 'border-red-200' : 'border-gray-200'
                }`}
                placeholder="Describe your experience with the artist..."
                value={staffReviewText}
                onChange={(e) => {
                  setStaffReviewText(e.target.value);
                  if (staffError) setStaffError(null);
                }}
              />

              <button
                type="button"
                disabled={!staffReviewText.trim() || polishingTarget === 'STAFF' || submitting}
                onClick={() => polishText('STAFF', staffReviewText, setStaffReviewText, setStaffError)}
                className="w-full py-2.5 border border-[#D4AF37]/40 text-[#B8952E] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {polishingTarget === 'STAFF' ? (
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

              <ReviewImageUpload label="Add up to 5 artist photos" images={staffImages} setImages={setStaffImages} disabled={submitting} />

              <div className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-2xl">
                <Gift size={16} className="text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#B8952E]">
                  {staffImages.length > 0
                    ? `Earn ${10 + Math.min(staffImages.length, 5) * 10} points: 5 for rating, 5 for review, and ${Math.min(staffImages.length, 5) * 10} for your photos`
                    : 'Earn 10 points: 5 for rating + 5 for your review'}
                </span>
              </div>

              <button
                disabled={submitting || staffRating === 0 || !feedbackData.staffId}
                onClick={() => feedbackData.staffId ? submitReview('STAFF', feedbackData.staffId, staffRating, staffReviewText, staffImages, setStaffError) : null}
                className={`w-full py-4 rounded-full font-semibold text-sm tracking-[0.1em] shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-all mt-6 ${
                  !feedbackData.staffId ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-[#D4AF37] hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  feedbackData.staffId ? "Submit Artist Review" : "No artist assigned"
                )}
              </button>
            </>
          )}
        </div>

        {salonSubmitted && staffSubmitted && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-center">
            <CheckCircle size={48} className="text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Thank You!
            </h2>
            <p className="text-slate-300 mb-6">
              Your feedback helps us improve and helps others make better choices.
            </p>
            <div className="mb-6 text-[#D4AF37]">
              <p className="text-sm font-semibold">Yay! You won {salonPointsEarned + staffPointsEarned} points!</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-white text-slate-900 rounded-full font-semibold text-sm tracking-[0.1em] hover:bg-[#D4AF37] transition-all"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
