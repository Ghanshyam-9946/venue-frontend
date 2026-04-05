import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Calendar, MapPin, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';

export default function AdminHistory() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchDepartments();
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [selectedDept, startDate, endDate]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.departments || []);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      let url = '/admin/history-statement?';
      const params = new URLSearchParams();
      if (selectedDept) params.append('departmentId', selectedDept);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await api.get(url + params.toString());
      setHistory(res.data.history || []);
    } catch (error) {
      toast.error('Failed to load history statement');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      revoked: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status.toLowerCase()] || colors.pending} capitalize flex items-center shrink-0 w-max`}>
        {status === 'pending' && <Clock className="w-3.5 h-3.5 mr-1" />}
        {status === 'approved' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
        {status === 'rejected' && <XCircle className="w-3.5 h-3.5 mr-1" />}
        {status}
      </span>
    );
  };

  return (
    <div className="relative space-y-8 animate-fade-in">
      {/* BACKGROUND */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-400/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-400/20 blur-[120px] rounded-full"></div>

      {/* HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg hover:shadow-xl transition">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            Booking History Statement
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete record of all venue bookings and their statuses
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-1.5 shadow-sm text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date"
              className="outline-none text-slate-600 bg-transparent w-full sm:w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-400">-</span>
            <input 
              type="date"
              className="outline-none text-slate-600 bg-transparent w-full sm:w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {user?.role === 'superadmin' && (
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1 shadow-sm w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 mr-2" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none w-full sm:w-48 py-1.5"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* LOADING OR EMPTY */}
      {loading ? (
        <div className="flex flex-col items-center py-20 relative z-10">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <p className="text-slate-500">Loading History...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed relative z-10">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No records found</h3>
        </div>
      ) : (
        /* TABLE CONTAINER */
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b border-blue-100 text-blue-900 text-sm">
                  <th className="p-4 font-semibold">Date / Slot</th>
                  <th className="p-4 font-semibold">Venue / Dept</th>
                  <th className="p-4 font-semibold">Faculty Requestor</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Purpose & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white/70 backdrop-blur-md">
                {history.map((record) => (
                  <tr key={record._id} className="hover:bg-blue-50/80 transition-all duration-300 hover:shadow-[inset_0_0_15px_rgba(59,130,246,0.05)] cursor-default">
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-800">
                        {format(new Date(record.date), 'dd MMM, yyyy')}
                      </div>
                      <div className="text-slate-500 flex items-center mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1 text-blue-400" />
                        {record.timeSlot}
                      </div>
                    </td>
                    
                    <td className="p-4 align-top group">
                      <div className="font-semibold text-blue-700 group-hover:text-blue-800 transition">
                        {record.venue?.name || 'Unknown Venue'}
                      </div>
                      <div className="text-slate-500 text-[11px] font-semibold mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {record.venue?.department?.name || 'No Dept'}
                      </div>
                      <div className="text-slate-400 flex items-center mt-1.5 text-xs">
                        <MapPin className="w-3 h-3 mr-1 text-red-400" />
                        {record.venue?.location || 'Unknown Location'}
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-800">{record.faculty?.name || 'Unknown'}</div>
                      <div className="text-slate-500 text-xs mt-1">{record.faculty?.email}</div>
                      <div className="text-slate-400 text-xs mt-1">Dept: {record.faculty?.department?.name || 'Unknown'}</div>
                    </td>

                    <td className="p-4 align-top">
                      {getStatusBadge(record.status)}
                      <div className="text-[10px] text-slate-400 mt-2">
                        Req: {format(new Date(record.createdAt), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </td>

                    <td className="p-4 align-top max-w-xs">
                      <div className="text-slate-700 mb-2">
                        <span className="font-semibold text-slate-800">Purpose: </span>
                        {record.purpose}
                      </div>
                      {record.reason && (
                        <div className="p-2 bg-slate-100 border-l-2 border-slate-400 rounded text-[13px] text-slate-600">
                          <span className="font-semibold">Remarks:</span> {record.reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
