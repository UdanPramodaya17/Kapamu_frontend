import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingBag, Star, ShieldCheck, Check, ArrowLeft, Package, 
  ChevronRight, Heart, Share2, Sparkles, AlertTriangle, Play, Truck, Scissors, ArrowUpRight
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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

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
    Promise.all([fetchProductAndReviews(), fetchReviews()]).finally(() => {
      setLoading(false);
    });
    setQuantity(1);
    setActiveImage(0);
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
    toast.success(`${quantity} ${product.name} added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addToCart({ ...product, quantity }));
    navigate('/checkout');
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

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', position: 'relative' }}>
      <Navbar />

      {/* ─── BREADCRUMBS ─── */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafafa', paddingTop: '90px' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0.85rem 2rem', display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.72rem', color: 'rgba(0,0,0,0.45)', flexWrap: 'wrap', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
          <Link to="/shop" style={{ color: 'rgba(0,0,0,0.45)', textDecoration: 'none' }} className="hover:text-black">Shop</Link>
          <ChevronRight size={10} />
          <Link to={`/shop?category=${product.category}`} style={{ color: 'rgba(0,0,0,0.45)', textDecoration: 'none' }} className="hover:text-black">{product.category}</Link>
          <ChevronRight size={10} />
          <span style={{ color: '#000000', fontWeight: 700 }}>{product.name}</span>
        </div>
      </div>

      {/* ─── MAIN PRODUCT SECTION ─── */}
      <section style={{ padding: '2.5rem 0 5rem', position: 'relative', zIndex: 1, background: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Thumbnails + Large Main Image */}
            <div className="col-span-12 lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
              
              {/* Thumbnail List */}
              <div className="flex flex-row sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 sm:w-20 shrink-0 no-scrollbar">
                {(product.images?.length > 0 ? product.images : [null, null, null, null]).map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg border p-0.5 shrink-0 overflow-hidden transition-all bg-white ${
                      activeImage === index ? 'border-black ring-2 ring-black/10' : 'border-black/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {img ? (
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                        <Package size={20} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Large Main Product Image */}
              <div className="flex-1 relative bg-gray-50 border border-black/10 rounded-2xl min-h-[300px] sm:min-h-[460px] lg:min-h-[520px] max-h-[640px] flex items-center justify-center overflow-hidden">
                {product.images?.length > 0 ? (
                  <img 
                    src={product.images[activeImage] || product.images[0]} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.2)' }}>
                    <Package size={64} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>No image available</span>
                  </div>
                )}

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
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    zIndex: 5,
                  }}>
                    SALE
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Product Details & Actions */}
            <div className="col-span-12 lg:col-span-6 flex flex-col justify-start">
              
              {/* Category & Vendor Badge Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
                
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Curated by <span style={{ color: '#0f172a', fontWeight: 700 }}>{product.vendorId?.storeName || product.vendorId?.name || 'Kapamu Store'}</span>
                </span>
              </div>

              {/* Product Title */}
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.9rem',
                color: '#0f172a',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.25,
              }}>
                {product.name}
              </h1>

              {/* Rating Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={14} 
                      fill={star <= (product.ratings || 5) ? '#f97316' : '#e2e8f0'} 
                      color={star <= (product.ratings || 5) ? '#f97316' : '#cbd5e1'} 
                    />
                  ))}
                </div>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: '#64748b' }}>
                  {product.ratings ? product.ratings.toFixed(1) : '5.0'} ({product.totalReviews || 12} reviews)
                </span>
              </div>

              {/* Price Row: Strike-through Gray Old Price + Bold Green Sale Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
                      fontSize: '1.6rem', 
                      fontFamily: "'Plus Jakarta Sans', sans-serif" 
                    }}>
                      LKR {formatPrice(product.salePrice)}
                    </span>
                  </>
                ) : (
                  <span style={{ 
                    color: '#16a34a', 
                    fontWeight: 800, 
                    fontSize: '1.6rem', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif" 
                  }}>
                    LKR {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Product Availability & Stock Status */}
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
                    fontWeight: 600, fontSize: '0.75rem',
                    color: '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}>
                    <Truck size={13} color="#64748b" /> Islandwide Delivery Available
                  </span>
                )}
              </div>

              {/* Product Description */}
              <div style={{ marginBottom: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  color: '#1e293b',
                  margin: '0 0 0.65rem 0',
                }}>
                  Product Details
                </h3>
                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.75, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {product.description || 'Premium salon-grade product designed to deliver exceptional professional results. Formulated with top-tier ingredients for maximum effectiveness and everyday care.'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.65rem' }}>
                  Quantity
                </label>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  height: '42px',
                  background: '#ffffff',
                  overflow: 'hidden',
                }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    style={{ width: '40px', height: '100%', background: '#f8fafc', border: 'none', color: '#0f172a', cursor: 'pointer', opacity: isOutOfStock ? 0.3 : 1, fontSize: '1.1rem', fontWeight: 700 }}
                  >-</button>
                  <span style={{ width: '44px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(isOutOfStock ? 1 : Math.min(product.inventory?.quantity || 10, quantity + 1))}
                    disabled={isOutOfStock}
                    style={{ width: '40px', height: '100%', background: '#f8fafc', border: 'none', color: '#0f172a', cursor: 'pointer', opacity: isOutOfStock ? 0.3 : 1, fontSize: '1.1rem', fontWeight: 700 }}
                  >+</button>
                </div>
              </div>

              {/* Action Buttons: ADD TO CART & BUY NOW */}
              {isAuthenticated ? (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                  <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    style={{
                      flex: 1,
                      height: '48px',
                      background: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#262626'}
                    onMouseLeave={e => e.currentTarget.style.background = '#000000'}
                  >
                    <ShoppingBag size={15} />
                    ADD TO CART
                  </button>

                  <button 
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    style={{
                      flex: 1,
                      height: '48px',
                      background: '#ea580c', // Bright Orange
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#c2410c'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ea580c'}
                  >
                    BUY NOW
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  marginBottom: '2.5rem',
                  lineHeight: 1.6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  Please <Link to="/login" style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'underline' }}>Login</Link> to purchase this item.
                </div>
              )}

              {/* Muted Footer Guarantees */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', color: '#64748b', fontSize: '0.82rem', lineHeight: 1.8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div>✓ 100% Authentic quality guaranteed.</div>
                <div>✓ Cash on delivery available.</div>
                <div>✓ Easy return and exchange policy within 7 days.</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT REVIEWS SECTION ─── */}
      <section style={{ borderTop: '1px solid rgba(0,0,0,0.07)', padding: '5rem 0 5rem', background: '#fafafa', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.5rem' }}>
              Feedback
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '2.25rem', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>
              Customer Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Ratings Summary */}
            <div className="col-span-12 lg:col-span-4">
              <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.015)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '4.5rem', fontWeight: 900, color: '#000000', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[5, 4, 3, 2, 1].map((starsCount) => {
                    const count = reviews.filter((r) => r.rating === starsCount).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={starsCount} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <span style={{ width: '45px', fontWeight: 700, color: 'rgba(0,0,0,0.5)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {starsCount} <Star size={10} fill="rgba(0,0,0,0.4)" color="none" />
                        </span>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.04)', borderRadius: '50px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#d97706', borderRadius: '50px' }} />
                        </div>
                        <span style={{ width: '35px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Review list & Write form */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              {/* Write Review Form */}
              {isAuthenticated ? (
                hasReviewed ? (
                  <div style={{ padding: '1.5rem 2rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', color: 'rgba(0,0,0,0.45)', textAlign: 'center', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                    You have already written a review for this product.
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.015)' }}>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#000000', margin: '0 0 1.5rem' }}>
                      Share Your Experience
                    </h3>
                    <form onSubmit={handleSubmitReview}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Choose Rating
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Star
                                size={28}
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

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Your Comments
                        </label>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write about the quality, smell, packaging, or texture of the product..."
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '1rem',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '12px',
                            background: '#ffffff',
                            color: '#000000',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            resize: 'none',
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn-primary"
                        style={{
                          padding: '0.75rem 2rem',
                          borderRadius: '50px',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )
              ) : (
                <div style={{ padding: '1.5rem 2rem', background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '20px', color: 'rgba(0,0,0,0.5)', textAlign: 'center', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Please <Link to="/login" style={{ color: '#000000', fontWeight: 700, textDecoration: 'underline' }}>Login</Link> to share your review for this product.
                </div>
              )}

              {/* Reviews List Container */}
              <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '24px', padding: '2rem 2.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.015)' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#000000', margin: '0 0 1.5rem' }}>
                  Reviews ({reviews.length})
                </h3>

                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ width: '28px', height: '28px', border: '2px solid rgba(0,0,0,0.06)', borderTopColor: '#000000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(0,0,0,0.45)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600 }}>
                    No reviews yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {reviews.map((r) => (
                      <div key={r._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, overflow: 'hidden' }}>
                              {r.customer?.avatar ? (
                                <img src={r.customer.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                r.customer?.name?.[0]?.toUpperCase()
                              )}
                            </div>
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 750, color: '#000000', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {r.customer?.name}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600, marginTop: '2px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '1px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={11}
                                  fill={star <= r.rating ? '#d97706' : 'none'}
                                  color={star <= r.rating ? '#d97706' : 'rgba(0,0,0,0.15)'}
                                />
                              ))}
                            </div>
                            {r.isVerified && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #b9f6ca', borderRadius: '50px', padding: '1px 6px', fontSize: '0.6rem', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                <ShieldCheck size={9} /> Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>

                        {r.comment && (
                          <p style={{ color: 'rgba(0,0,0,0.65)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0, paddingLeft: '2.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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

      {/* ─── RELATED PRODUCTS ─── */}
      {relatedProducts.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(0,0,0,0.07)', padding: '5rem 0 8rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2rem' }}>
            <div className="comic-panel-section" style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', display: 'block', marginBottom: '0.5rem' }}>Recommendations</span>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: '2.25rem', color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>You May Also Like</h2>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem' }}>
                {relatedProducts.map(rel => (
                  <div 
                    key={rel._id} 
                    className="product-card" 
                    style={{ 
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <Link
                      to={`/shop/${rel._id}`}
                      style={{ display: 'block', textDecoration: 'none' }}
                    >
                      <div style={{ height: '320px', background: '#f8f8f8', position: 'relative', overflow: 'hidden' }}>
                        {rel.images?.[0] ? (
                          <img 
                            src={rel.images[0]} 
                            alt={rel.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                            className="product-card-image"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                            <Package size={32} color="rgba(0,0,0,0.3)" />
                          </div>
                        )}
                        {rel.salePrice && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: '#16a34a',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
                          }}>
                            SALE
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                        <h3 style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: '1.025rem',
                          color: '#1e293b',
                          margin: '0 0 0.5rem 0',
                          lineHeight: '1.3',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{rel.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          {rel.salePrice ? (
                            <>
                              <span style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'line-through', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                LKR {formatPrice(rel.price)}
                              </span>
                              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                LKR {formatPrice(rel.salePrice)}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                              LKR {formatPrice(rel.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
