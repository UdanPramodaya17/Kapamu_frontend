import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, Edit, Trash2, Tag, DollarSign, Archive, Image as ImageIcon, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ImageUploader from '../../components/shared/ImageUploader';
import { productAPI } from '../../api';

const CATEGORIES = ['shampoo', 'conditioner', 'styling', 'tools', 'skincare', 'beard', 'accessories', 'other'];

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch only this vendor's own products (all statuses)
      const res = await productAPI.getMine({ limit: 100 });
      setProducts(res.data.data.products || []);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setProductImages([]);
    reset({
      name: '',
      description: '',
      price: '',
      salePrice: '', 
      category: 'other',
      inventory: {
        quantity: 0,
        lowStockThreshold: 5
      }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductImages(product.images || []);
    reset({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || '',
      category: product.category,
      inventory: {
        quantity: product.inventory?.quantity !== undefined ? product.inventory.quantity : 0,
        lowStockThreshold: product.inventory?.lowStockThreshold !== undefined ? product.inventory.lowStockThreshold : 5,
      }
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    if (productImages.length === 0) {
      return toast.error('Please upload at least one product image.');
    }

    try {
      const payload = {
        ...data,
        price: Number(data.price),
        salePrice: data.salePrice ? Number(data.salePrice) : null,
        inventory: {
          quantity: data.inventory?.quantity !== undefined && data.inventory.quantity !== '' ? Number(data.inventory.quantity) : 0,
          lowStockThreshold: data.inventory?.lowStockThreshold !== undefined && data.inventory.lowStockThreshold !== '' ? Number(data.inventory.lowStockThreshold) : 5
        },
        images: productImages
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, payload);
        toast.success('Product updated and resubmitted for review!');
      } else {
        await productAPI.create(payload);
        toast.success('Product submitted for admin approval! 🎉');
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? It will be deactivated.')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deactivated');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">My Products</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your product submissions</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Approval Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 font-bold text-sm">Products require admin approval before going live</p>
          <p className="text-amber-700 text-xs mt-0.5 font-medium">Once you submit a product, our admin team will review and approve it. Approved products automatically appear on the website.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 text-black border border-black/10 rounded-xl py-2.5 pl-10 pr-4 focus:border-black transition-colors text-sm"
          />
        </div>
        <select className="bg-white border border-black/10 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-black w-full sm:w-auto">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-black/10 border-dashed rounded-xl p-12 text-center shadow-sm">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-black mb-2">No Products Found</h3>
          <p className="text-gray-500 font-medium">Your store catalog is empty. Start adding your retail items!</p>
          <button onClick={openAddModal} className="mt-6 btn-secondary border-black/15 text-black hover:bg-gray-50">
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white border border-black/10 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:border-black/30 transition-all group">
              <div className="relative h-48 bg-gray-50 overflow-hidden border-b border-black/5">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  {product.status === 'approved' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300 shadow-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                      <CheckCircle size={10} /> LIVE
                    </span>
                  )}
                  {product.status === 'rejected' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 shadow-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                      <XCircle size={10} /> REJECTED
                    </span>
                  )}
                  {product.status === 'pending' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300 shadow-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                      <Clock size={10} /> PENDING
                    </span>
                  )}
                </div>
                {!product.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Deactivated</span>
                  </div>
                )}
                {product.inventory?.quantity <= (product.inventory?.lowStockThreshold || 5) && product.isActive && (
                  <div className="absolute top-2 right-2 bg-rose-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg backdrop-blur-sm">
                    Low Stock: {product.inventory?.quantity}
                  </div>
                )}
              </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-black text-lg leading-tight line-clamp-1">{product.name}</h3>
                    <span className="text-black font-extrabold text-lg whitespace-nowrap">
                      LKR {product.salePrice || product.price}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs bg-gray-50 text-gray-700 border border-black/10 rounded px-2 py-0.5 flex items-center gap-1 capitalize font-semibold font-condensed">
                      <Tag size={10}/> {product.category}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs bg-gray-50 text-gray-400 border border-gray-200 rounded px-2 py-0.5 line-through font-semibold font-condensed">
                        LKR {product.price}
                      </span>
                    )}
                  </div>
                  {/* Rejection reason */}
                  {product.status === 'rejected' && product.rejectionReason && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-semibold">Admin Feedback:</p>
                      <p className="text-xs text-red-600 mt-0.5">{product.rejectionReason}</p>
                    </div>
                  )}
                  
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-black/5">
                    <div className="text-sm text-gray-500 font-medium">
                      <span className="text-black font-bold">{product.inventory?.quantity || 0}</span> in stock
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-black rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-black/10 flex justify-between items-center shrink-0 bg-white">
                <h2 className="text-xl font-bold font-display text-black">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">✕</button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="productForm" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col: Info */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-1">Product Name *</label>
                      <input {...register('name', { required: true })} className="input-field" placeholder="e.g. Argan Oil Hair Serum" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 font-semibold mb-1">Price (LKR) *</label>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input {...register('price', { required: true, min: 0 })} type="number" step="0.01" className="input-field pl-9" placeholder="2999" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 font-semibold mb-1">Sale Price (LKR)</label>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input {...register('salePrice')} type="number" step="0.01" className="input-field pl-9" placeholder="2499 (Optional)" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-1">Category *</label>
                      <select {...register('category', { required: true })} className="input-field capitalize bg-white text-black">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 font-semibold mb-1">Description</label>
                      <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Describe the benefits, ingredients, and usage..." />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-black/10 space-y-4">
                      <h4 className="text-black font-bold flex items-center gap-2 align-middle font-display">
                        <Archive size={16} className="text-black"/> Inventory Management
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-700 font-semibold mb-1">Stock Quantity</label>
                          <input {...register('inventory.quantity')} type="number" min="0" className="input-field py-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-700 font-semibold mb-1">Low Stock Warning</label>
                          <input {...register('inventory.lowStockThreshold')} type="number" min="0" className="input-field py-2 text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: Images */}
                  <div>
                    <label className="block text-sm text-gray-700 font-semibold mb-2">Product Images *</label>
                    <p className="text-xs text-gray-500 mb-4 font-medium">
                      Upload high-quality images. The first image will be the primary display. (Max 4 images).
                    </p>
                    <div className="bg-gray-50 p-4 border border-black/10 rounded-xl">
                      <ImageUploader 
                        maxImages={4}
                        currentImages={productImages}
                        onUploadSuccess={setProductImages}
                        title="Product Photos"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-black/10 flex gap-3 justify-end shrink-0 bg-white">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-gray-500 hover:text-black transition">Cancel</button>
                <button form="productForm" type="submit" className="btn-primary min-w-[140px]">
                  {editingProduct ? 'Save & Resubmit' : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
