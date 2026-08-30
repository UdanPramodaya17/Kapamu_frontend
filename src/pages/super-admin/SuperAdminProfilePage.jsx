import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { User, Lock, Mail, Phone, Shield } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { authAPI } from '../../api';
import { selectCurrentUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function SuperAdminProfilePage() {
    const user = useSelector(selectCurrentUser);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
        defaultValues: { name: user?.name, phone: user?.phone || '' }
    });

    const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

    const onProfileSubmit = async (data) => {
        setIsUpdatingProfile(true);
        try {
            await authAPI.updateProfile(data);
            toast.success('Profile updated successfully! Refreshing...');
            setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes globally
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
            toast.success('Password updated successfully');
            resetPassword();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-black">Account Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your super admin profile and security</p>
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
                                <label className="block text-sm text-gray-600 mb-1 font-semibold">Phone Number</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input {...registerProfile('phone')} className="input-field pl-11" placeholder="+94 77 XXX XXXX" />
                                </div>
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
            </div>
        </DashboardLayout>
    );
}