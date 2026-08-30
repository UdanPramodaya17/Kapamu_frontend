import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Package, Scissors, Star } from 'lucide-react';
import { productAPI } from '../../api';
import { addToCart } from '../../features/cart/cartSlice';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import Navbar from '../../components/layout/Navbar';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/format';

const categories = ['all', 'shampoo', 'conditioner', 'styling', 'tools', 'skincare', 'beard', 'accessories'];

export default function ShopPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    productAPI.getAll()
      .then(res => {
        setProducts(res.data.data.products || []);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        toast.error('Failed to load products');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const displayedProducts = filteredProducts;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000' }}>
      <Navbar />

      {/* ─── PAGE HERO ─── */}
      <section style={{
        paddingTop: '100px',
        paddingBottom: '3.5rem',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.005), transparent)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.2)' }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>
              Grooming · Essentials · Premium
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(3rem, 5vw, 5rem)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: '#000000',
              margin: 0,
            }}>
              Grooming<br /><em style={{ fontStyle: 'italic', color: 'rgba(0,0,0,0.45)' }}>Shop</em>
            </h1>
            <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '320px', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Premium grooming products from trusted brands, curated for the modern gentleman.
            </p>
          </div>

          {/* Search & Category Pills Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '0.65rem 1.25rem',
              borderRadius: '50px',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
            }}>
              <Search size={16} color="rgba(0,0,0,0.4)" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#000000', fontSize: '0.85rem', flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.45rem 1.25rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: '1px solid',
                    borderColor: category === cat ? '#000000' : 'rgba(0,0,0,0.08)',
                    background: category === cat ? '#000000' : 'transparent',
                    color: category === cat ? '#ffffff' : 'rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    borderRadius: '50px',
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT GRID ─── */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 2rem 8rem' }}>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="comic-panel-section">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <div
                  key={product._id}
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
                    to={`/shop/${product._id}`}
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    {/* Image area */}
                    <div style={{ height: '350px', background: '#f8f8f8', position: 'relative', overflow: 'hidden' }}>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          className="product-card-image"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', background: '#f3f4f6' }}>
                          <Package size={36} color="rgba(0,0,0,0.3)" />
                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', fontWeight: 700 }}>{product.category}</span>
                        </div>
                      )}

                      {product.salePrice && (
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

                    {/* Product Info */}
                    <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
                      <h3 style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '1.025rem',
                        color: '#1e293b',
                        lineHeight: 1.3,
                        margin: '0 0 0.5rem 0',
                      }}>{product.name}</h3>

                      {/* Price row: Old Price (line-through gray) + New Price (bold green) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        {product.salePrice ? (
                          <>
                            <span style={{ 
                              color: '#94a3b8', 
                              fontSize: '0.9rem', 
                              textDecoration: 'line-through', 
                              fontWeight: 500, 
                              fontFamily: "'Plus Jakarta Sans', sans-serif" 
                            }}>
                              LKR {formatPrice(product.price)}
                            </span>
                            <span style={{ 
                              color: '#16a34a', 
                              fontWeight: 700, 
                              fontSize: '1rem', 
                              fontFamily: "'Plus Jakarta Sans', sans-serif" 
                            }}>
                              LKR {formatPrice(product.salePrice)}
                            </span>
                          </>
                        ) : (
                          <span style={{ 
                            color: '#16a34a', 
                            fontWeight: 700, 
                            fontSize: '1rem', 
                            fontFamily: "'Plus Jakarta Sans', sans-serif" 
                          }}>
                            LKR {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '0.5rem 1.25rem 1.25rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error('Please login to add items to your cart! 🛒');
                          navigate('/login');
                        } else {
                          handleAddToCart(product);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #000000',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#16a34a';
                        e.currentTarget.style.borderColor = '#16a34a';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
