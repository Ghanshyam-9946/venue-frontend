import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Phone, Camera, Loader2, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || ''
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mobile) {
      return toast.error("Name and Mobile number are required.");
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobile', formData.mobile);
    if (avatar) {
      data.append('avatar', avatar);
    }

    try {
      const response = await api.put('/user/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(true); // Small delay for UX
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Decoration */}
        <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-800 flex items-end px-8 pb-4">
           <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
        </div>

        <div className="px-8 py-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={64} />
                    </div>
                  )}
                </div>
                
                <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-slate-200 cursor-pointer hover:bg-slate-50 hover:scale-110 transition active:scale-95">
                  <Camera className="w-5 h-5 text-blue-700" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
              <p className="mt-2 text-sm text-slate-500">Click the camera to change photo</p>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-1 opacity-70">
                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address (Fixed)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <p className="text-[11px] text-slate-400 ml-1 italic">* Mandatory field for booking updates</p>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
