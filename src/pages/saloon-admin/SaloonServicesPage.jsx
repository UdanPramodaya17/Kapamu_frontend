import React, { useEffect, useState } from 'react';
import { Plus, Scissors, Clock, DollarSign, Edit, Trash2, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { serviceAPI, saloonAPI } from '../../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['haircut', 'shave', 'beard', 'color', 'treatment', 'massage', 'facial', 'other'];

export default function SaloonServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saloonId, setSaloonId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', duration: '', category: 'haircut', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    saloonAPI.getMy()
      .then(res => {
        const sid = res.data.data.saloon._id;
        setSaloonId(sid);
        return saloonAPI.getServices(sid);
      })
      .then(res => setServices(res.data.data.services || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditService(null);
    setForm({ name: '', price: '', duration: '', category: 'haircut', description: '' });
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditService(svc);
    setForm({ name: svc.name, price: svc.price, duration: svc.duration, category: svc.category, description: svc.description || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) {
      toast.error('Name, price, and duration are required');
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, price: Number(form.price), duration: Number(form.duration) };
      if (editService) {
        const res = await serviceAPI.update(editService._id, data);
        setServices(prev => prev.map(s => s._id === editService._id ? res.data.data.service : s));
        toast.success('Service updated');
      } else {
        const res = await serviceAPI.create(data);
        setServices(prev => [...prev, res.data.data.service]);
        toast.success('Service created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await serviceAPI.delete(id);
      setServices(prev => prev.filter(s => s._id !== id));
      toast.success('Service deactivated');
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-black">Services</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your salon's service menu</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 w-full sm:w-auto">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#000000' }} />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-white border border-black/10 rounded-2xl shadow-sm">
          <Scissors size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4 font-medium">No services yet</p>
          <button onClick={openAdd} className="btn-primary text-sm py-2 px-5">Add Your First Service</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(svc => (
            <div key={svc._id} className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm hover:border-black/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-black/5 border border-black/10 rounded-xl flex items-center justify-center">
                  <Scissors size={18} className="text-black" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(svc)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 text-black flex items-center justify-center transition-all">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => handleDelete(svc._id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-600 flex items-center justify-center transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <h3 className="text-black font-bold text-lg mb-1">{svc.name}</h3>
              {svc.description && <p className="text-gray-600 text-xs mb-3 line-clamp-2">{svc.description}</p>}
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <div className="flex items-center gap-1 text-black font-extrabold">
                  <DollarSign size={14} /> LKR {svc.price}
                </div>
                <div className="flex items-center gap-1 text-gray-500 font-semibold">
                  <Clock size={12} /> {svc.duration} min
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-full capitalize font-bold font-condensed tracking-wider">{svc.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black/10 rounded-3xl p-6 w-full max-w-md animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-black font-bold font-display text-lg">{editService ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-700 font-semibold mb-1.5">Service Name</label>
                <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" placeholder="e.g. Haircut" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5">Price (LKR )</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} className="input-field" placeholder="199" />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1.5">Duration (min)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} className="input-field" placeholder="30" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-700 font-semibold mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="input-field bg-white text-black">
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-white capitalize text-black">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-700 font-semibold mb-1.5">Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="input-field resize-none" rows={2} placeholder="Brief description..." />
              </div>
              <div className="flex gap-3 pt-2 border-t border-black/10">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 text-sm py-2.5">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-sm py-2.5">
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="spinner w-4 h-4 border-t-white" /> Saving...</span> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
