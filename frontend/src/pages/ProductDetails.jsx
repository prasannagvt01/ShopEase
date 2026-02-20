import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { productsAPI, reviewsAPI } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [editingReview, setEditingReview] = useState(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const reviewsRes = await reviewsAPI.getByProduct(id, { size: 10 });
      setReviews(reviewsRes.data.data.content || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProduct(id, { size: 10 }),
        ]);
        const productData = productRes.data.data;
        setProduct(productData);
        setReviews(reviewsRes.data.data.content || []);
        setIsInWishlistState(isInWishlist(productData.id));
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isInWishlistState) {
      await removeFromWishlist(product.id);
      setIsInWishlistState(false);
    } else {
      await addToWishlist(product);
      setIsInWishlistState(true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        productId: id,
        ...newReview,
      });
      toast.success('Review submitted successfully');
      setNewReview({ rating: 5, title: '', comment: '' });
      setIsReviewModalOpen(false);
      fetchReviews();
      // Optionally refresh product to update average rating
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewEdit = async (review) => {
    setEditingReview(review);
    setNewReview({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || '',
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await reviewsAPI.delete(reviewId);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden mb-4">
            <img
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary-600' : 'border-transparent'
                    }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-primary-600 font-medium mb-2">{product.categoryName}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">{renderStars(product.averageRating)}</div>
            <span className="text-gray-500">
              ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4 mb-6">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{product.discountPrice.toLocaleString()}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  {discountPercentage}% OFF
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Brand */}
          {product.brand && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Brand: <span className="font-medium">{product.brand}</span>
            </p>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {product.stockQuantity > 0 ? (
              <span className="badge-success">
                In Stock ({product.stockQuantity} available)
              </span>
            ) : (
              <span className="badge-error">Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-700 dark:text-gray-300">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stockQuantity === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isInWishlistState ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWishlistState ? (
                <HeartIcon className="h-6 w-6 text-red-500 fill-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <TruckIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Free Delivery</p>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Warranty</p>
            </div>
            <div className="text-center">
              <ArrowPathIcon className="h-6 w-6 mx-auto mb-2 text-primary-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="border-b dark:border-gray-700">
          <div className="flex gap-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium capitalize transition-colors ${activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specs && Object.entries(product.specs).map(([key, value]) => (
                value && (
                  <div key={key} className="flex border-b dark:border-gray-700 pb-2">
                    <span className="text-gray-500 w-32 capitalize">{key}:</span>
                    <span className="text-gray-900 dark:text-white">{value}</span>
                  </div>
                )
              ))}
              {!product.specs && (
                <p className="text-gray-500">No specifications available.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Customer Reviews</h3>
                <button
                  onClick={() => isAuthenticated ? setIsReviewModalOpen(true) : navigate('/login')}
                  className="btn-secondary"
                >
                  Write a Review
                </button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b dark:border-gray-700 pb-6 group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="font-medium">{review.userName}</span>
                          {review.verified && (
                            <span className="badge-success text-xs">Verified Purchase</span>
                          )}
                        </div>
                        {user && (user.id === review.userId) && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleReviewEdit(review)}
                              className="text-xs text-primary-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleReviewDelete(review.id)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-gray-500 mb-4">
                    No reviews yet. Be the first to review this product!
                  </p>
                  <button
                    onClick={() => isAuthenticated ? setIsReviewModalOpen(true) : navigate('/login')}
                    className="btn-primary"
                  >
                    Write a Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingReview ? 'Edit Review' : 'Write a Review'}</h3>
              <button onClick={() => { setIsReviewModalOpen(false); setEditingReview(null); }} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSubmittingReview(true);
              try {
                if (editingReview) {
                  await reviewsAPI.update(editingReview.id, { productId: id, ...newReview });
                  toast.success('Review updated');
                } else {
                  await reviewsAPI.create({ productId: id, ...newReview });
                  toast.success('Review submitted');
                }
                setIsReviewModalOpen(false);
                setEditingReview(null);
                setNewReview({ rating: 5, title: '', comment: '' });
                fetchReviews();
              } catch (error) {
                toast.error(error.response?.data?.message || 'Action failed');
              } finally {
                setSubmittingReview(false);
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      {star <= newReview.rating ? (
                        <StarIconSolid className="h-8 w-8 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Review Title (Optional)</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="input-field"
                  placeholder="Summarize your experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="input-field min-h-[120px]"
                  placeholder="What did you like or dislike?"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 btn-primary"
                >
                  {submittingReview ? <LoadingSpinner size="sm" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
