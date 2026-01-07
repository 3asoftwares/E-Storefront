'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useProductReviews, useCreateReview, useMarkReviewHelpful } from '../lib/hooks/useReviews';
import { Button, Textarea } from '3a-ecommerce-ui-library';
import { Logger } from '3a-ecommerce-utils/client';

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export default function ProductReviews({
  productId,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  const { data: reviewsData, isLoading, error } = useProductReviews(productId);
  const createReviewMutation = useCreateReview();
  const markHelpfulMutation = useMarkReviewHelpful();

  const reviews = reviewsData?.reviews || [];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createReviewMutation.mutateAsync({
        productId,
        rating: newReview.rating,
        comment: newReview.comment,
      });

      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      alert('Review submitted successfully! It will appear after moderation.');
    } catch (err) {
      Logger.error('Failed to submit review', err, 'Reviews');
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpfulMutation.mutateAsync({ reviewId, productId });
    } catch (err) {
      Logger.error('Failed to mark review as helpful', err, 'Reviews');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div className="flex text-yellow-400 text-xl mr-2">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">({totalReviews} reviews)</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="!w-auto"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          Write a Review
        </Button>
      </div>

      {showReviewForm && (
        <form className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  size="lg"
                  variant="ghost"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`!w-auto !p-1 text-3xl ${
                    star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <FontAwesomeIcon icon={faStar} />
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            rows={5}
            label="Your Review"
            value={newReview.comment}
            placeholder="Share your experience with this product..."
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSubmitReview}
              disabled={createReviewMutation.isPending}
              className="!w-auto"
            >
              {createReviewMutation.isPending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
            <Button variant="outline" className="!w-auto" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-400" />
            <p className="text-gray-500 mt-2">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Failed to load reviews. Please try again.</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{review.userName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              <button
                onClick={() => handleMarkHelpful(review.id)}
                disabled={markHelpfulMutation.isPending}
                className="text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
              >
                Helpful ({review.helpful})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
