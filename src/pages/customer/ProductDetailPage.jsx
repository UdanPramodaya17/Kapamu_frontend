import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingBag, Star, ShieldCheck, Check, ArrowLeft, Package, 
  ChevronRight, ChevronLeft, Heart, Share2, Sparkles, AlertTriangle, 
  Truck, ArrowUpRight, Award, RotateCcw, Info, CheckCircle2, Zap
} from 'lucide-react';
import { productAPI } from '../../api';
import { addToCart } from '../../features/cart/cartSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice';
import Navbar from '../../components/layout/Navbar';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const reviewsSectionRef = useRef(null);

  // Check wishlist state from localStorage
  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('salon_wishlist') || '[]');
      setIsWishlisted(savedWishlist.includes(id));
    } catch {
      setIsWishlisted(false);
    }
  }, [id]);

  const toggleWishlist = () => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('salon_wishlist') || '[]');
      let updated;
      if (savedWishlist.includes(id)) {
        updated = savedWishlist.filter(item => item !== id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        updated = [...savedWishlist, id];
        setIsWishlisted(true);
        toast.success('Added to wishlist ❤️');
      }
      localStorage.setItem('salon_wishlist', JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Salon Product',
      text: `Check out ${product?.name} on Kapamu!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product link copied to clipboard! 📋');
  };

  const fetchProductAndReviews = async () => {
    try {
      const res = await productAPI.getById(id);
      const prod = res.data.data.product;
      setProduct(prod);
      if (prod?.category) {
        productAPI.getAll({ category: prod.category }).then(relRes => {
          const items = relRes.data.data.products || [];
          setRelatedProducts(items.filter(item => item._id !== id).slice(0, 4));
        });
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      toast.error('Failed to load product details');
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await productAPI.getReviews(id);
      setReviews(res.data.data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Promise.all([fetchProductAndReviews(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
    setQuantity(1);
    setActiveImage(0);
    setActiveTab('details');
    setSelectedRatingFilter(null);
  }, [id]);

  const hasReviewed = reviews.some(r => {
    const reviewCustId = r.customer?._id || r.customer;
    return reviewCustId === currentUser?._id;
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      return toast.error('Please write a comment.');
    }
    setSubmittingReview(true);
    try {
      await productAPI.createReview(id, {
        rating: newRating,
        comment: newComment,
      });
      toast.success('Thank you! Review submitted.');
      setNewComment('');
      setNewRating(5);
      await Promise.all([fetchProductAndReviews(), fetchReviews()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    toast.success(`${quantity} × ${product.name} added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    navigate('/checkout');
  };

  const scrollToReviews = () => {
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,0,0,0.06)', borderTopColor: '#000000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
        <Navbar />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 2rem 8rem', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '2rem', marginBottom: '1rem' }}>Product Not Found</h2>
          <Link to="/shop" style={{ color: '#000000', textDecoration: 'underline', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.inventory?.quantity === 0;
  const isLowStock = product.inventory?.quantity > 0 && product.inventory?.quantity <= 5;
  const discountPercent = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  const filteredReviews = selectedRatingFilter 
    ? reviews.filter(r => r.rating === selectedRatingFilter)
    : reviews;

  const currentImages = product.images && product.images.length > 0 ? product.images : [];

  const handlePrevImage = () => {
    if (currentImages.length <= 1) return;
    setActiveImage((prev) => (prev === 0 ? currentImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (currentImages.length <= 1) return;
    setActiveImage((prev) => (prev === currentImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', position: 'relative' }} className="pb-24 sm:pb-0">
      <Navbar />

      {/* ─── BREADCRUMBS ─── */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa', paddingTop: '80px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0.85rem clamp(1rem, 4vw, 2rem)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', flexWrap: 'wrap', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
          <Link to="/" style={{ color: 'rgba(0,0,0,0.45)', textDecoration: 'none' }} className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={11} />
          <Link to="/shop" style={{ color: 'rgba(0,0,0,0.45)', textDecoration: 'none' }} className="hover:text-black transition-colors">Shop</Link>
          <ChevronRight size={11} />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category}`} style={{ color: 'rgba(0,0,0,0.45)', textDecoration: 'none', textTransform: 'capitalize' }} className="hover:text-black transition-colors">
                {product.category}
              </Link>
              <ChevronRight size={11} />
            </>
          )}
          <span style={{ color: '#000000', fontWeight: 700, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </span>
        </div>
      </div>

      {/* ─── MAIN PRODUCT SECTION ─── */}
      <section style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) 0 clamp(2.5rem, 6vw, 4rem)', position: 'relative', zIndex: 1, background: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column: Thumbnails + Large Main Image */}
            <div className="col-span-12 lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Thumbnail List (Only rendered when 2 or more images exist) */}
              {currentImages.length > 1 && (
                <div className="flex flex-row sm:flex-col gap-2.5 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 sm:w-20 shrink-0 hide-scrollbar">
                  {currentImages.map((img, index) => (
                    <button 
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border p-1 shrink-0 overflow-hidden transition-all bg-white cursor-pointer ${
                        activeImage === index ? 'border-black ring-2 ring-black/20 scale-105 shadow-sm' : 'border-black/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              )}

              {/* Large Main Product Image Box */}
              <div className="flex-1 relative bg-neutral-50/70 border border-black/10 rounded-2xl min-h-[320px] sm:min-h-[440px] lg:min-h-[500px] flex items-center justify-center overflow-hidden group select-none">
                {currentImages.length > 0 ? (
                  <img 
                    src={currentImages[activeImage] || currentImages[0]} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '520px', padding: 'clamp(1rem, 3vw, 2rem)' }} 
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.2)' }}>
                    <Package size={64} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>No image available</span>
                  </div>
                )}

                {/* Left / Right Chevrons when multiple images */}
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      aria-label="Previous Image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-black/10 flex items-center justify-center text-black shadow-md hover:bg-black hover:text-white transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      aria-label="Next Image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-black/10 flex items-center justify-center text-black shadow-md hover:bg-black hover:text-white transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Top Left: Sale Badge */}
                {product.salePrice && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    zIndex: 5,
                  }}>
                    SALE {discountPercent > 0 ? `-${discountPercent}%` : ''}
                  </div>
                )}

                {/* Top Right: Image Counter Badge */}
                {currentImages.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    letterSpacing: '0.05em',
                    padding: '4px 10px',
                    borderRadius: '50px',
                    zIndex: 5,
                  }}>
                    {activeImage + 1} / {currentImages.length}
                  </div>
                )}

                {/* Bottom Floating Quick Actions (Wishlist & Share) */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
                  <button 
                    onClick={toggleWishlist}
                    aria-label="Add to Wishlist"
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur border transition-all cursor-pointer shadow-sm ${
                      isWishlisted 
                        ? 'bg-red-50 border-red-200 text-red-500' 
                        : 'bg-white/90 border-black/10 text-neutral-600 hover:text-black hover:bg-white'
                    }`}
                  >
                    <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : 'currentColor'} />
                  </button>
                  <button 
                    onClick={handleShare}
                    aria-label="Share Product"
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 backdrop-blur border border-black/10 text-neutral-600 hover:text-black hover:bg-white transition-all cursor-pointer shadow-sm"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column: Product Info & Actions */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-start">
              
              {/* Category & Salon Partner Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.65rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '0.3rem 0.85rem', border: '1px solid #e2e8f0',
                  borderRadius: '50px',
                  color: '#475569',
                  background: '#f8fafc',
                }}>
                  {product.category || 'Grooming'}
                </span>
                
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Curated by <span style={{ color: '#000000', fontWeight: 700 }}>{product.vendorId?.storeName || product.vendorId?.name || 'Kapamu Partner Salon'}</span>
                </span>
              </div>

              {/* Product Title */}
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                color: '#000000',
                margin: '0 0 0.65rem 0',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
              }}>
                {product.name}
              </h1>

              {/* Rating & Review Counter with jump-to-reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={15} 
                      fill={star <= Math.round(product.ratings || 5) ? '#fbbf24' : '#e2e8f0'} 
                      color={star <= Math.round(product.ratings || 5) ? '#fbbf24' : '#cbd5e1'} 
                    />
                  ))}
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#000000' }}>
                  {product.ratings ? product.ratings.toFixed(1) : '5.0'}
                </span>
                <button 
                  onClick={scrollToReviews}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#64748b',
                    textDecoration: 'underline',
                  }}
                  className="hover:text-black transition-colors"
                >
                  ({product.totalReviews || reviews.length || 0} reviews)
                </button>
              </div>

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {product.salePrice ? (
                  <>
                    <span style={{ 
                      color: '#94a3b8', 
                      fontSize: '1.2rem', 
                      textDecoration: 'line-through', 
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 500,
                    }}>
                      LKR {formatPrice(product.price)}
                    </span>
                    <span style={{ 
                      color: '#16a34a', 
                      fontWeight: 800, 
                      fontSize: 'clamp(1.6rem, 4vw, 2rem)', 
                      fontFamily: "'Plus Jakarta Sans', sans-serif" 
                    }}>
                      LKR {formatPrice(product.salePrice)}
                    </span>
                    {discountPercent > 0 && (
                      <span style={{
                        background: 'rgba(22, 163, 74, 0.1)',
                        color: '#16a34a',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '50px',
                        border: '1px solid rgba(22, 163, 74, 0.2)',
                      }}>
                        Save {discountPercent}%
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ 
                    color: '#000000', 
                    fontWeight: 800, 
                    fontSize: 'clamp(1.6rem, 4vw, 2rem)', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif" 
                  }}>
                    LKR {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stock Status & Delivery Guarantee */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: '0.68rem',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '50px',
                  border: '1px solid',
                  borderColor: isOutOfStock ? '#fca5a5' : isLowStock ? '#fde68a' : '#bbf7d0',
                  background: isOutOfStock ? '#fef2f2' : isLowStock ? '#fffbeb' : '#f0fdf4',
                  color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a',
                }}>
                  {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock (${product.inventory?.quantity} left)` : 'In Stock'}
                </span>

                {!isOutOfStock && (
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600, fontSize: '0.78rem',
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}>
                    <Truck size={14} color="#059669" /> Islandwide Delivery Available
                  </span>
                )}
              </div>

              {/* Product Brief Description */}
              <div style={{ marginBottom: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.75, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {product.description || 'Premium salon-grade product designed to deliver exceptional professional results. Formulated with top-tier ingredients for maximum effectiveness and everyday care.'}
                </p>

                {/* Tags if available */}
                {product.tags && product.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem' }}>
                    {product.tags.map((tag, i) => (
                      <span key={i} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                  Quantity
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  height: '44px',
                  background: '#ffffff',
                  overflow: 'hidden',
                }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    aria-label="Decrease quantity"
                    style={{ width: '44px', height: '100%', background: '#f8fafc', border: 'none', color: '#0f172a', cursor: 'pointer', opacity: isOutOfStock ? 0.3 : 1, fontSize: '1.2rem', fontWeight: 700 }}
                  >-</button>
                  <span style={{ width: '48px', textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(isOutOfStock ? 1 : Math.min(product.inventory?.quantity || 10, quantity + 1))}
                    disabled={isOutOfStock}
                    aria-label="Increase quantity"
                    style={{ width: '44px', height: '100%', background: '#f8fafc', border: 'none', color: '#0f172a', cursor: 'pointer', opacity: isOutOfStock ? 0.3 : 1, fontSize: '1.2rem', fontWeight: 700 }}
                  >+</button>
                </div>
              </div>

              {/* Action Buttons: ADD TO CART & BUY NOW */}
              {isAuthenticated ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '2.25rem' }}>
                  <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    style={{
                      flex: '1 1 180px',
                      minWidth: '140px',
                      height: '52px',
                      background: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}
                    className="hover:opacity-90 active:scale-[0.98]"
                  >
                    <ShoppingBag size={18} />
                    ADD TO CART
                  </button>

                  <button 
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    style={{
                      flex: '1 1 180px',
                      minWidth: '140px',
                      height: '52px',
                      background: '#ea580c', // High conversion orange
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                    }}
                    className="hover:opacity-90 active:scale-[0.98]"
                  >
                    <Zap size={18} />
                    BUY NOW
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  marginBottom: '2.25rem',
                  lineHeight: 1.6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  Please <Link to="/login" style={{ color: '#000000', fontWeight: 800, textDecoration: 'underline' }}>Login</Link> to purchase this salon product.
                </div>
              )}

              {/* Luxury Trust Badges */}
              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={17} color="#000000" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    100% Authentic
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={17} color="#000000" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Islandwide Delivery
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <RotateCcw size={17} color="#000000" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    7-Day Returns
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ─── EXPANDED PRODUCT INFORMATION TABS ─── */}
          <div style={{ marginTop: 'clamp(2.5rem, 6vw, 4.5rem)', borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
              {[
                { id: 'details', label: 'Product Specifications' },
                { id: 'usage', label: 'How to Use' },
                { id: 'guarantee', label: 'Salon Quality Promise' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    fontSize: '0.85rem',
                    color: activeTab === tab.id ? '#000000' : '#64748b',
                    background: activeTab === tab.id ? '#f8fafc' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #000000' : '2px solid transparent',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '1.75rem 0' }}>
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem', color: '#0f172a' }}>Specifications</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b' }}>Category</span>
                        <span style={{ fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{product.category || 'Professional Grooming'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b' }}>Stock Availability</span>
                        <span style={{ fontWeight: 700, color: isOutOfStock ? '#dc2626' : '#16a34a' }}>{product.inventory?.quantity || 0} Units In Stock</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b' }}>Partner Salon</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{product.vendorId?.storeName || product.vendorId?.name || 'Kapamu Certified Salon'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Product SKU / ID</span>
                        <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.75rem' }}>{product._id}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.9rem', marginBottom: '1rem', color: '#0f172a' }}>Key Highlights</h4>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: '#334155', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" /> 100% genuine formulation certified by professional stylists
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" /> Paraben-free and safe for regular daily grooming
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" /> Recommended by top barber salons across Sri Lanka
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" /> Securely packed and tamper-proof delivery
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'usage' && (
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f1f5f9', maxWidth: '800px' }}>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem', color: '#0f172a' }}>
                    Directions for Maximum Effectiveness
                  </h4>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <li>Cleanse or damp the target area thoroughly with warm water before application.</li>
                    <li>Dispense a dime-to-nickel sized amount into your palm and warm between hands.</li>
                    <li>Work gently and evenly through hair, beard, or skin using smooth circular motions.</li>
                    <li>Style or let absorb naturally as recommended by your barber. Store in a cool, dry place away from direct sunlight.</li>
                  </ol>
                </div>
              )}

              {activeTab === 'guarantee' && (
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #f1f5f9', maxWidth: '800px' }}>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem', color: '#0f172a' }}>
                    Kapamu Salon Authenticity Guarantee
                  </h4>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.65, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Every grooming product sold on Kapamu is directly supplied by verified professional salons and licensed distributors in Sri Lanka. We guarantee 100% original, sealed, and salon-grade cosmetics.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>
                    <ShieldCheck size={18} /> Verified Partner Store Fulfillment
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ─── PRODUCT REVIEWS SECTION ─── */}
      <section ref={reviewsSectionRef} style={{ borderTop: '1px solid rgba(0,0,0,0.07)', padding: 'clamp(2.5rem, 6vw, 4.5rem) 0', background: '#fafafa', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.35rem' }}>
              Feedback & Ratings
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 5vw, 2.25rem)', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>
              Customer Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* Left: Ratings Summary Breakdown */}
            <div className="col-span-12 lg:col-span-4">
              <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1rem, 3.5vw, 1.75rem)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: 'clamp(3rem, 7vw, 4rem)', fontWeight: 900, color: '#000000', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                    {product.ratings > 0 ? product.ratings.toFixed(1) : '0.0'}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '0.75rem 0 0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        fill={star <= Math.round(product.ratings || 0) ? '#d97706' : 'none'}
                        color={star <= Math.round(product.ratings || 0) ? '#d97706' : 'rgba(0,0,0,0.15)'}
                      />
                    ))}
                  </div>
                  <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
                  </p>
                </div>

                {/* Rating bars breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {[5, 4, 3, 2, 1].map((starsCount) => {
                    const count = reviews.filter((r) => r.rating === starsCount).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    const isFilterActive = selectedRatingFilter === starsCount;
                    return (
                      <button 
                        key={starsCount} 
                        onClick={() => setSelectedRatingFilter(isFilterActive ? null : starsCount)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          fontSize: '0.8rem', 
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          background: isFilterActive ? '#fef3c7' : 'transparent',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <span style={{ width: '45px', fontWeight: 700, color: isFilterActive ? '#b45309' : 'rgba(0,0,0,0.5)', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          {starsCount} <Star size={11} fill={isFilterActive ? '#b45309' : 'rgba(0,0,0,0.4)'} color="none" />
                        </span>
                        <div style={{ flex: 1, height: '7px', background: 'rgba(0,0,0,0.06)', borderRadius: '50px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#d97706', borderRadius: '50px' }} />
                        </div>
                        <span style={{ width: '35px', textAlign: 'right', fontWeight: 800, color: '#000000', flexShrink: 0 }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedRatingFilter && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => setSelectedRatingFilter(null)}
                      style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear rating filter ({selectedRatingFilter} Stars)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Review list & Write form */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              
              {/* Write Review Form */}
              {isAuthenticated ? (
                hasReviewed ? (
                  <div style={{ padding: '1.25rem clamp(1rem, 3vw, 2rem)', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', color: 'rgba(0,0,0,0.55)', textAlign: 'center', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#16a34a" /> You have already submitted a review for this product.
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1rem, 3.5vw, 2rem)', boxShadow: '0 8px 30px rgba(0,0,0,0.015)' }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#000000', margin: '0 0 1rem' }}>
                      Share Your Experience
                    </h3>
                    <form onSubmit={handleSubmitReview}>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Choose Rating
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                              aria-label={`Rate ${star} star`}
                            >
                              <Star
                                size={26}
                                fill={star <= newRating ? '#d97706' : 'none'}
                                color={star <= newRating ? '#d97706' : 'rgba(0,0,0,0.18)'}
                                style={{ transition: 'transform 0.1s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Your Comments
                        </label>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write about the quality, fragrance, packaging, or hair styling results..."
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '0.85rem 1rem',
                            border: '1px solid rgba(0,0,0,0.12)',
                            borderRadius: '10px',
                            background: '#ffffff',
                            color: '#000000',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'none',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        style={{
                          padding: '0.75rem 2rem',
                          borderRadius: '50px',
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          cursor: submittingReview ? 'not-allowed' : 'pointer',
                          opacity: submittingReview ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )
              ) : (
                <div style={{ padding: '1.5rem clamp(1rem, 3vw, 2rem)', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', color: 'rgba(0,0,0,0.5)', textAlign: 'center', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Please <Link to="/login" style={{ color: '#000000', fontWeight: 800, textDecoration: 'underline' }}>Login</Link> to share your review for this product.
                </div>
              )}

              {/* Reviews List Container */}
              <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', padding: 'clamp(1.5rem, 4vw, 2.25rem) clamp(1rem, 3.5vw, 2rem)', boxShadow: '0 8px 30px rgba(0,0,0,0.015)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#000000', margin: 0 }}>
                    Reviews ({filteredReviews.length})
                  </h3>
                  {selectedRatingFilter && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                      Showing {selectedRatingFilter} Star reviews
                    </span>
                  )}
                </div>

                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ width: '28px', height: '28px', border: '2px solid rgba(0,0,0,0.06)', borderTopColor: '#000000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'rgba(0,0,0,0.45)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600 }}>
                    {selectedRatingFilter 
                      ? `No ${selectedRatingFilter}-star reviews yet for this product.`
                      : 'No reviews yet. Be the first to share your thoughts!'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filteredReviews.map((r) => (
                      <div key={r._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                          
                          {/* Author Avatar & Name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, overflow: 'hidden', flexShrink: 0 }}>
                              {r.customer?.avatar ? (
                                <img src={r.customer.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                r.customer?.name?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: 750, color: '#000000', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {r.customer?.name || 'Verified Customer'}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, marginTop: '1px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating & Verified Badge */}
                          <div className="flex flex-col items-start sm:items-end gap-1">
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  fill={star <= r.rating ? '#d97706' : 'none'}
                                  color={star <= r.rating ? '#d97706' : 'rgba(0,0,0,0.15)'}
                                />
                              ))}
                            </div>
                            {r.isVerified && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '50px', padding: '2px 8px', fontSize: '0.62rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                <ShieldCheck size={10} /> Verified Buyer
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Review text with full width */}
                        {r.comment && (
                          <p style={{ color: 'rgba(0,0,0,0.75)', fontSize: '0.88rem', lineHeight: 1.65, margin: '0.25rem 0 0 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RELATED PRODUCTS (RECOMMENDATIONS) ─── */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(0,0,0,0.07)', padding: 'clamp(2.5rem, 6vw, 4.5rem) 0 clamp(4rem, 8vw, 6rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.35rem' }}>Recommendations</span>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>You May Also Like</h2>
              </div>
              <Link to={`/shop?category=${product.category}`} style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.72rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', color: '#000000',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s',
                borderBottom: '1px solid #000000', paddingBottom: '3px'
              }}
                className="hover:opacity-70"
              >
                View Category <ArrowUpRight size={13} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 'clamp(1rem, 2.5vw, 1.75rem)' }}>
              {relatedProducts.map(rel => {
                const relDiscount = rel.salePrice ? Math.round(((rel.price - rel.salePrice) / rel.price) * 100) : 0;
                return (
                  <div 
                    key={rel._id} 
                    className="product-card group" 
                    style={{ 
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <Link
                      to={`/shop/${rel._id}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div style={{ height: '220px', background: '#f8f8f8', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {rel.images?.[0] ? (
                          <img 
                            src={rel.images[0]} 
                            alt={rel.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem', transition: 'transform 0.5s ease' }} 
                            className="group-hover:scale-105"
                          />
                        ) : (
                          <Package size={32} color="rgba(0,0,0,0.3)" />
                        )}

                        {rel.salePrice && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#16a34a',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                          }}>
                            SALE {relDiscount > 0 ? `-${relDiscount}%` : ''}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '1rem 1.15rem 1.15rem' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                          {rel.category || 'Grooming'}
                        </span>
                        <h3 style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#0f172a',
                          margin: '0 0 0.5rem 0',
                          lineHeight: '1.3',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{rel.name}</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {rel.salePrice ? (
                            <>
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem', textDecoration: 'line-through', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                LKR {formatPrice(rel.price)}
                              </span>
                              <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.95rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                LKR {formatPrice(rel.salePrice)}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: '#000000', fontWeight: 800, fontSize: '0.95rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              LKR {formatPrice(rel.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── STICKY BOTTOM ACTION BAR (MOBILE ONLY) ─── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Price</span>
          <div className="flex items-center gap-1.5">
            {product.salePrice ? (
              <>
                <span className="text-xs text-slate-400 line-through">
                  LKR {formatPrice(product.price)}
                </span>
                <span className="text-base font-extrabold text-emerald-600 font-['Plus_Jakarta_Sans']">
                  LKR {formatPrice(product.salePrice * quantity)}
                </span>
              </>
            ) : (
              <span className="text-base font-extrabold text-black font-['Plus_Jakarta_Sans']">
                LKR {formatPrice(product.price * quantity)}
              </span>
            )}
          </div>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="h-11 px-3.5 bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm active:scale-95 disabled:opacity-40"
            >
              <ShoppingBag size={14} /> Add
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="h-11 px-4 bg-orange-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm active:scale-95 disabled:opacity-40"
            >
              <Zap size={14} /> Buy
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="h-11 px-5 bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center uppercase tracking-wider"
          >
            Login to Buy
          </Link>
        )}
      </div>

    </div>
  );
}
