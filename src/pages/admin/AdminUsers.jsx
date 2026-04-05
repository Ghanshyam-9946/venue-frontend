import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, User, Edit2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Role Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState('faculty');
  const [editDept, setEditDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/departments')
      ]);
      setUsers(usersRes.data.users || []);
      setDepartments(deptsRes.data.departments || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDept(user.department?._id || '');
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { role: editRole, department: editDept || null };
      if (!editDept && editRole === 'admin') {
        toast.error('Department is required for admin role');
        setIsSubmitting(false);
        return;
      }

      const res = await api.put(`/admin/user/${selectedUser._id}/role`, payload);
      toast.success('User updated');
      setUsers(users.map(u => u._id === selectedUser._id ? res.data.user : u));
      fetchData(); // refresh full data to get populated dept
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-8 animate-fade-in">

  {/* 🌈 BACKGROUND GLOW */}
  <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-400/20 blur-[140px] rounded-full"></div>
  <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-indigo-400/20 blur-[140px] rounded-full"></div>

  {/* 🔷 HEADER */}
  <div className="relative z-10 bg-white/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/40 shadow-xl flex flex-col sm:flex-row justify-between gap-4">

    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 bg-clip-text text-transparent">
        Manage Users & Roles
      </h1>
      <p className="text-slate-500 text-sm mt-1">
        Assign sub-admins to departments
      </p>
    </div>

  </div>

  {/* 🔷 CONTENT */}
  {loading ? (
    <div className="flex justify-center py-20">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  ) : (
    <div className="relative z-10 p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/30 via-blue-300/20 to-blue-100/10">

      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl overflow-hidden">

        {/* ===== DESKTOP TABLE ===== */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">

            <thead className="bg-blue-50/80 backdrop-blur text-blue-900 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 text-left">User</th>
                <th className="px-5 py-4 text-left">Role</th>
                <th className="px-5 py-4 text-left">Department</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {users.map((u) => (
                <tr
                  key={u._id}
                  className="group hover:bg-blue-50/40 transition-all duration-300 hover:scale-[1.01]"
                >

                  {/* USER */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition">
                      {u.name}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {u.email}
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm transition-all
                        ${u.role === "superadmin"
                          ? "bg-purple-100 text-purple-700"
                          : u.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {u.role === "admin" ? "sub-admin" : u.role}
                    </span>
                  </td>

                  {/* DEPT */}
                  <td className="px-5 py-4 text-slate-600">
                    {u.department?.name || (
                      <span className="text-slate-400 italic">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="px-5 py-4 text-right">
                    {u.role !== "superadmin" && (
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all shadow-sm active:scale-95"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {/* ===== MOBILE VIEW ===== */}
        <div className="md:hidden p-4 space-y-4">

          {users.map((u) => (
            <div
              key={u._id}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >

              {/* TOP */}
              <div className="flex justify-between items-start gap-3">

                <div>
                  <h3 className="font-bold text-slate-900">
                    {u.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {u.email}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm
                  ${u.role === "superadmin"
                      ? "bg-purple-100 text-purple-700"
                      : u.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {u.role === "admin" ? "sub-admin" : u.role}
                </span>

              </div>

              {/* DEPARTMENT */}
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Department:</span>{" "}
                {u.department?.name || (
                  <span className="italic text-slate-400">Unassigned</span>
                )}
              </div>

              {/* ACTION */}
              {u.role !== "superadmin" && (
                <button
                  onClick={() => openEdit(u)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Role
                </button>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  )}

  {/* 🔷 MODAL (UNCHANGED LOGIC, JUST POLISH) */}
  {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

      <div className="w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/40 to-blue-200/20 animate-fade-in">

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">

          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-blue-900">
              Edit Role: {selectedUser?.name}
            </h3>
          </div>

          <form onSubmit={handleUpdate} className="p-6 space-y-5">

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="input-field"
              >
                <option value="faculty">Faculty</option>
                <option value="admin">Sub-Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                className="input-field"
                required={editRole === 'admin'}
              >
                <option value="">Select department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition active:scale-95"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Save"
                )}
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
