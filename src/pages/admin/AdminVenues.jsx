import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { Loader2, Plus, Trash2, MapPin, Users, UploadCloud, Image as ImageIcon, Building2, Edit2, ArrowLeft, Camera } from 'lucide-react';

export default function AdminVenues() {
  const { user } = useContext(AuthContext);
  const { id: deptId } = useParams(); // For Superadmin accessing a specific department
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentDetails, setDepartmentDetails] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    description: '',
    type: 'Classroom',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    // Superadmin sanity check: if they somehow reach /admin/venues without a deptId, redirect them
    if (user?.role === 'superadmin' && !deptId && window.location.pathname === '/admin/venues') {
      navigate('/admin/departments', { replace: true });
      return;
    }
    fetchData();
  }, [deptId, user, navigate]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      let url = '/admin/venues';
      if (user?.role === 'superadmin' && deptId) {
        url += `?deptId=${deptId}`;
      } else if (user?.role === 'admin') {
        url += '?manage=true';
      }

      // Fetch Venues
      const venuesRes = await api.get(url);
      setVenues(venuesRes.data.venues || []);

      // Fetch Department Details (for Title display)
      if (user?.role === 'superadmin' && deptId) {
        const deptsRes = await api.get('/admin/departments');
        const dept = deptsRes.data.departments.find(d => d._id === deptId);
        if (dept) setDepartmentDetails(dept);
      }

    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await api.delete(`/admin/venue/${id}`);
      toast.success('Venue deleted successfully');
      setVenues(venues.filter(v => v._id !== id));
    } catch (error) {
      toast.error('Failed to delete venue');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedVenue(null);
    setFormData({ name: '', capacity: '', location: '', description: '', type: 'Classroom' });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (venue) => {
    setIsEditMode(true);
    setSelectedVenue(venue);
    setFormData({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location,
      description: venue.description,
      type: venue.type || 'Classroom',
    });
    setImageFile(null);
    setImagePreview(venue.image);
    setIsModalOpen(true);
  };

  const handleSubmitVenue = async (e) => {
    e.preventDefault();
    if (!isEditMode && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('capacity', formData.capacity);
      data.append('location', formData.location);
      data.append('description', formData.description);
      data.append('type', formData.type);

      if (user?.role === 'superadmin' && deptId) {
        data.append('department', deptId);
      }

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEditMode) {
        await api.put(`/admin/venue/${selectedVenue._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Venue updated successfully!');
      } else {
        await api.post('/admin/venue', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Venue created successfully!');
      }

      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-8 animate-fade-in">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 blur-[120px] rounded-full"></div>

      {/* 🔥 BACK BUTTON */}
      {user?.role === 'superadmin' && deptId && (
        <button
          onClick={() => navigate('/admin/departments')}
          className="relative z-10 flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
      )}

      {/* 🔥 HEADER */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-xl flex flex-col sm:flex-row justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            {user?.role === 'superadmin'
              ? `${departmentDetails ? departmentDetails.name : 'Department'} Venues`
              : 'My Department Venues'}
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage venues mapped to this department
          </p>
        </div>

        {/* DESKTOP BUTTON */}
        <button
          onClick={openCreateModal}
          className="hidden sm:flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Venue
        </button>
      </div>

      {/* 🔥 MOBILE FLOAT BUTTON */}
      <button
        onClick={openCreateModal}
        className="sm:hidden fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 🔥 LOADING */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : venues.length === 0 ? (

        /* 🔥 EMPTY STATE */
        <div className="relative z-10 text-center py-32 bg-white/70 backdrop-blur-xl rounded-3xl border border-dashed shadow-lg">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No Venues Yet</h3>
          <p className="text-slate-500 text-sm">Create your first venue 🚀</p>
        </div>

      ) : (

        /* 🔥 CARDS */
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {venues.map(venue => (
            <div
              key={venue._id}
              className="group rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >

              {/* IMAGE */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                {/* ACTION BUTTONS */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition">

                  <button
                    onClick={() => openEditModal(venue)}
                    className="p-2 rounded-full bg-white text-slate-700 hover:text-blue-600 shadow"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(venue._id)}
                    className="p-2 rounded-full bg-red-600 text-white shadow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-3">

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {venue.name}
                </h3>

                <div className="flex justify-between text-sm text-slate-600">

                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-blue-500" />
                    {venue.capacity}
                  </div>

                  <div className="flex items-center max-w-[50%]">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                    <span className="truncate">{venue.location}</span>
                  </div>

                </div>

                <p className="text-sm text-slate-500 line-clamp-2">
                  {venue.description || "No description"}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* 🔥 MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="w-full max-w-xl rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/40 to-blue-200/20 animate-fade-in">

            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

              {/* HEADER */}
              <div className="p-5 border-b">
                <h3 className="text-xl font-bold text-blue-900">
                  {isEditMode ? 'Edit Venue' : 'Add Venue'}
                </h3>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmitVenue} className="p-6 space-y-5">

                <input
                  type="text"
                  placeholder="Venue Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />

                <input
                  type="number"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  className="input-field"
                  required
                />

                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  required
                />

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
                {/* 🔥 IMAGE UPLOAD */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Venue Image {isEditMode && '(Optional)'}
                  </label>

                  {!imagePreview ? (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Camera Option */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current.click()}
                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition text-slate-500 hover:text-blue-600"
                      >
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-sm font-semibold">Take Photo</span>
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </button>

                      {/* Gallery Option */}
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current.click()}
                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition text-slate-500 hover:text-blue-600"
                      >
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm font-semibold">Gallery</span>
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden group">
                      <div className="relative aspect-video">
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition gap-3">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current.click()}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg flex items-center transition"
                            >
                              <Camera className="w-4 h-4 mr-2" /> Retake
                            </button>
                            <button
                              type="button"
                              onClick={() => galleryInputRef.current.click()}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg flex items-center transition"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" /> Change
                            </button>
                          </div>
                          
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
