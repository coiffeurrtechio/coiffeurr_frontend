import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useApi } from '../../API/SalonsAPIs/ALLSalonAPI';
import { useParams } from 'react-router-dom';
import { getDefaultSalonImage } from '../../utils/defaultServiceImage';

interface Review {
  id: string;
  userId: string;
  userName: string;
  targetType: string;
  targetId: string;
  rating: number;
  text: string;
  reviewText: string;
  images: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  recentReviews: Review[];
}

interface SalonData {
  id: string;
  salonName: string;
  ownerName: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: number;
    country: string;
  };
  branding?: {
    logoUrl?: string;
  };
}

interface SalonReviewResponse {
  salonData: SalonData;
  reviewSummary: ReviewSummary;
}

const SalonReviewsPage = () => {
  const { salonId } = useParams<{ salonId: string }>();
  const { apiRequest } = useApi();
  const [loading, setLoading] = useState(true);
  const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, [salonId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<SalonReviewResponse>(
        `/salons/${salonId}/reviews?page=${currentPage}&limit=${reviewsPerPage}`
      );
      if (res.data) {
        setSalonData(res.data.salonData);
        setReviewSummary(res.data.reviewSummary);
        setReviews(res.data.reviewSummary.recentReviews || []);
        setTotalPages(Math.ceil((res.data.reviewSummary.totalReviews || 0) / reviewsPerPage));
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}
      />
    ));
  };

  const renderRatingDistribution = () => {
    if (!reviewSummary) return null;
    const distribution = reviewSummary.ratingDistribution || {};
    const total = reviewSummary.totalReviews || 1;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = (count / total) * 100;
          return (
            <div key={star} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16">
                <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-xs font-semibold text-gray-600">{star}</span>
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#C9A227]"
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <img
                src={salonData?.branding?.logoUrl || getDefaultSalonImage(salonData?.id || salonData?.salonName || '')}
                alt={salonData?.salonName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#D4AF37]/20"
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {salonData?.salonName}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {salonData?.address?.city}, {salonData?.address?.state}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Rating Summary */}
        {reviewSummary && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                  {reviewSummary.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {renderStars(Math.round(reviewSummary.averageRating))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Based on {reviewSummary.totalReviews} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Rating Distribution</h3>
                {renderRatingDistribution()}
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-3 sm:space-y-4">
          {reviews.length > 0 ? (
            <>
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs sm:text-sm">
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm sm:font-semibold text-gray-900">{review.userName}</h3>
                        <span className="text-[10px] sm:text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">{review.reviewText || review.text}</p>
                      {review.images?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {review.images.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <p className="text-gray-500">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonReviewsPage;
