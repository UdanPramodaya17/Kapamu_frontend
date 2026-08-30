import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Shield, Image as ImageIcon, Scissors } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { authAPI, saloonAPI } from '../../api';
import ImageUploader from '../../components/shared/ImageUploader';
import { selectCurrentUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import LocationPicker from './LocationPicker';

export default function SaloonAdminSettingsPage() {
  const user = useSelector(selectCurrentUser);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [mySaloon, setMySaloon] = useState(null);
  const [isUpdatingGallery, setIsUpdatingGallery] = useState(false);

  // Saloon profile states
  const [saloonName, setSaloonName] = useState('');
  const [saloonDescription, setSaloonDescription] = useState('');
  const [saloonPhone, setSaloonPhone] = useState('');
  const [saloonStreet, setSaloonStreet] = useState('');
  const [saloonCity, setSaloonCity] = useState('');
  const [selectedCoords, setSelectedCoords] = useState({ lat: 6.927079, lng: 79.861244 });
  const [isUpdatingSaloon, setIsUpdatingSaloon] = useState(false);

  React.useEffect(() => {
    const fetchSaloon = async () => {
      try {
        const res = await saloonAPI.getMy();
        if (res.data.success) {
          const sal = res.data.data.saloon;
          setMySaloon(sal);
          setSaloonName(sal.name || '');
          setSaloonDescription(sal.description || '');
          setSaloonPhone(sal.phone || '');
          setSaloonStreet(sal.address?.street || '');
          setSaloonCity(sal.address?.city || '');
          if (sal.location?.coordinates && sal.location.coordinates[0] !== 0) {
            setSelectedCoords({
              lng: sal.location.coordinates[0],
              lat: sal.location.coordinates[1]
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch saloon", err);
      }
    };
    fetchSaloon();
  }, []);

  const handleLocationSelect = ({ lat, lng }) => {
    setSelectedCoords({ lat, lng });
  };

  const onSaloonSubmit = async (e) => {
    e.preventDefault();
    if (!mySaloon) return;
    if (!saloonName.trim()) {
      toast.error('Saloon name is required');
      return;
    }
    if (!saloonPhone.trim() || !/^(?:\+94|94|0)\d{9}$/.test(saloonPhone)) {
      toast.error('Please enter a valid Sri Lankan phone number (e.g. 0112345678 or 0771234567)');
      return;
    }
    if (!saloonStreet.trim()) {
      toast.error('Street address is required');
      return;
    }
    if (!saloonCity.trim()) {
      toast.error('City is required');
      return;
    }
    setIsUpdatingSaloon(true);
    try {
      const res = await saloonAPI.update(mySaloon._id, {
        name: saloonName,
        description: saloonDescription,
        phone: saloonPhone,
        address: {
          street: saloonStreet,
          city: saloonCity
        },
        location: {
          type: 'Point',
          coordinates: [selectedCoords.lng, selectedCoords.lat]
        }
      });
      if (res.data.success) {
        toast.success('Saloon profile updated successfully!');
        setMySaloon(res.data.data.saloon);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update saloon details');
    } finally {
      setIsUpdatingSaloon(false);
    }
  };

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || '' }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword } = useForm();

  const onProfileSubmit = async (data) => {
    if (data.phone && !/^(?:\+94|94|0)7\d{8}$/.test(data.phone)) {
      toast.error('Please enter a valid Sri Lankan mobile number (e.g. 0771234567)');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      await authAPI.updateProfile(data);
      toast.success('Profile updated successfully! Refreshing...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setIsUpdatingPassword(true);
    try {
      await authAPI.updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onPhotosUploadSuccess = async (newImages) => {
    if (!mySaloon) return;
    setIsUpdatingGallery(true);
    try {
      const updatedImages = (newImages || []).slice(0, 5);
      const updatedCover = updatedImages.length > 0 ? updatedImages[0] : '';
      await saloonAPI.update(mySaloon._id, { 
        images: updatedImages, 
        coverImage: updatedCover 
      });
      setMySaloon(prev => ({ 
        ...prev, 
        images: updatedImages, 
        coverImage: updatedCover 
      }));
      toast.success(updatedImages.length > 0 ? 'Saloon photos updated!' : 'Saloon photos removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update saloon photos');
    } finally {
      setIsUpdatingGallery(false);
    }
  };

  const currentSaloonPhotos = React.useMemo(() => {
    if (!mySaloon) return [];
    const list = [];
    if (mySaloon.coverImage && typeof mySaloon.coverImage === 'string' && mySaloon.coverImage.trim()) {
      list.push(mySaloon.coverImage.trim());
    }
    if (Array.isArray(mySaloon.images)) {
      mySaloon.images.forEach(img => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list.slice(0, 5);
  }, [mySaloon?.coverImage, mySaloon?.images]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-black">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your salon admin profile and security</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Details Form */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <User size={20} className="text-black" /> Personal Information
            </h2>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-semibold">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...registerProfile('name', { required: 'Name is required' })} className="input-field pl-11" />
                </div>
                {profileErrors.name && <span className="text-xs text-red-500 font-semibold">{profileErrors.name.message}</span>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-semibold">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={user?.email} disabled className="input-field pl-11 opacity-50 cursor-not-allowed bg-gray-50" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-semibold">Phone Number *</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...registerProfile('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(?:\+94|94|0)7\d{8}$/,
                      message: 'Invalid Sri Lankan mobile number (e.g. 0771234567)'
                    }
                  })} className="input-field pl-11" placeholder="+94 77 XXX XXXX" />
                </div>
                {profileErrors.phone && <span className="text-xs text-red-500 font-semibold">{profileErrors.phone.message}</span>}
              </div>
              <button type="submit" disabled={isUpdatingProfile} className="btn-primary w-full mt-4">
                {isUpdatingProfile ? <div className="spinner w-4 h-4 mx-auto border-t-white" /> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <Shield size={20} className="text-black" /> Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-semibold">Current Password</label>
                <input {...registerPassword('currentPassword', { required: true })} type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div className="pt-2">
                <label className="block text-sm text-gray-600 mb-1 font-semibold">New Password</label>
                <input {...registerPassword('newPassword', { required: true, minLength: 6 })} type="password" placeholder="••••••••" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-semibold">Confirm New Password</label>
                <input {...registerPassword('confirmPassword', { required: true })} type="password" placeholder="••••••••" className="input-field" />
              </div>
              <button type="submit" disabled={isUpdatingPassword} className="btn-secondary w-full mt-4">
                {isUpdatingPassword ? <div className="spinner w-4 h-4 mx-auto border-t-black" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {mySaloon && (
          <>
            {/* Saloon Details Form */}
            <div className="mt-8 bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <Scissors size={20} className="text-black" /> Saloon Information
              </h2>
              <form onSubmit={onSaloonSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-semibold">Saloon Name *</label>
                    <input 
                      type="text" 
                      value={saloonName} 
                      onChange={(e) => setSaloonName(e.target.value)} 
                      required 
                      className="input-field" 
                      placeholder="My Saloon" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-semibold">Saloon Phone Number *</label>
                    <input 
                      type="tel" 
                      value={saloonPhone} 
                      onChange={(e) => setSaloonPhone(e.target.value)} 
                      required 
                      className="input-field" 
                      placeholder="+94 77 XXX XXXX" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-semibold">Street Address *</label>
                    <input 
                      type="text" 
                      value={saloonStreet} 
                      onChange={(e) => setSaloonStreet(e.target.value)} 
                      required 
                      className="input-field" 
                      placeholder="e.g. 45 Galle Road" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 font-semibold">City *</label>
                    <input 
                      type="text" 
                      value={saloonCity} 
                      onChange={(e) => setSaloonCity(e.target.value)} 
                      required 
                      className="input-field" 
                      placeholder="e.g. Colombo 03" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1 font-semibold">Description</label>
                    <textarea 
                      value={saloonDescription} 
                      onChange={(e) => setSaloonDescription(e.target.value)} 
                      rows={3} 
                      className="input-field py-2" 
                      placeholder="Enter saloon description details..." 
                      style={{ height: 'auto', resize: 'vertical' }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-2 font-semibold">Mark Location on Map</label>
                    <LocationPicker 
                      initialLocation={mySaloon.location?.coordinates || [79.861244, 6.927079]}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isUpdatingSaloon} className="btn-primary w-full sm:w-48">
                    {isUpdatingSaloon ? <div className="spinner w-4 h-4 mx-auto border-t-white" /> : 'Save Saloon Changes'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8">
              {/* Saloon Cover Photos (Up to 5) */}
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    <ImageIcon size={20} className="text-black" /> Saloon Cover Photos & Slider (Up to 5 Photos)
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-black/5 rounded-full text-gray-600 font-condensed uppercase tracking-wider w-fit">
                    Auto-Navigating Slider
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6 font-medium">
                  Upload up to 5 high-quality photos representing your saloon. These photos will automatically navigate as a smooth slider on your public salon page for customers.
                </p>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-black/5">
                  <ImageUploader 
                    maxImages={5} 
                    currentImages={currentSaloonPhotos}
                    onUploadSuccess={onPhotosUploadSuccess}
                    title="Saloon Photos (Max 5)"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}