import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Grid } from 'lucide-react';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/departments');
      setDepartments(res.data.departments || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/admin/department', formData);
      toast.success('Department created');
      setDepartments([...departments, res.data.department]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/admin/department/${id}`);
      toast.success('Deleted');
      setDepartments(departments.filter(d => d._id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 animate-fade-in">

  {/* HEADER */}
  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 
      bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 
      text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

    {/* Glow */}
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-2xl rounded-full"></div>

    <div className="relative z-10">
      <h1 className="text-xl sm:text-2xl font-bold">Departments</h1>
      <p className="text-blue-100 text-xs sm:text-sm mt-1">
        Manage institutional departments
      </p>
    </div>

    <button
      onClick={() => setIsModalOpen(true)}
      className="relative z-10 flex items-center justify-center gap-2 
      px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl 
      bg-white/20 hover:bg-white/30 backdrop-blur-md 
      text-white text-sm font-medium transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" />
      Add
    </button>
  </div>

  {/* LOADING */}
  {loading ? (
    <div className="flex justify-center py-20">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
  ) : departments.length === 0 ? (

    /* EMPTY STATE */
    <div className="text-center py-20 rounded-2xl border border-dashed bg-white/60 backdrop-blur-xl">
      <Grid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 className="text-base font-medium text-slate-800">
        No Departments
      </h3>
    </div>

  ) : (

    /* GRID */
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">

      {departments.map((dept) => (
        <div
          key={dept._id}
          className="group relative rounded-2xl p-[1px] 
          bg-gradient-to-br from-blue-200 to-blue-400/40 
          hover:from-blue-400 transition-all duration-300"
        >

          {/* CARD */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 h-full flex flex-col justify-between shadow-md">

            {/* TOP */}
            <div className="flex justify-between items-start gap-2">

              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-blue-900">
                  {dept.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                  {dept.description || "No description provided."}
                </p>
              </div>

              {/* DELETE */}
              <button
                onClick={() => handleDelete(dept._id)}
                className="p-2 rounded-lg bg-red-50 text-red-500 
                opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* BUTTON */}
            <div className="mt-4">
              <button
                onClick={() =>
                  window.location.href = `/admin/departments/${dept._id}/venues`
                }
                className="w-full py-2.5 rounded-xl text-sm font-medium 
                bg-gradient-to-r from-blue-700 to-blue-500 text-white 
                hover:scale-[1.03] active:scale-95 transition-all shadow-md"
              >
                Manage Venues →
              </button>
            </div>
          </div>
        </div>
      ))}

    </div>
  )}

  {/* MODAL */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-[fadeInUp_0.3s_ease]">

        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-blue-900">
            New Department
          </h3>

          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">

          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
              placeholder="Computer Science"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm"
              rows="3"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 rounded-lg bg-slate-100 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg bg-blue-700 text-white text-sm flex justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )}
</div>
  );
}
