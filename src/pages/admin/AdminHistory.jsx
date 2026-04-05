import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2, Calendar, MapPin, CheckCircle, XCircle, Clock, Search, Filter, User, BookOpen, Info, ChevronRight, Hash } from 'lucide-react';
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
      <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded-full border ${colors[status.toLowerCase()] || colors.pending} uppercase tracking-wider flex items-center shrink-0 w-max shadow-sm`}>
        {status === 'pending' && <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
        {status === 'approved' && <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
        {status === 'rejected' && <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
        {status}
      </span>
    );
  };

  return (
    <div className="relative space-y-6 sm:space-y-8 pb-10 sm:pb-20 animate-in fade-in duration-700">
      
      {/* DECORATIVE ELEMENTS */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-400/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-indigo-400/10 blur-[120px] rounded-full -z-10"></div>

      {/* HEADER SECTION */}
      <div className="sticky top-0 z-40 lg:relative lg:top-auto">
        <div className="relative z-10 bg-white/70 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] border border-white/40 shadow-xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:bg-blue-600/10 transition-colors duration-700"></div>
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
            <div className="max-w-xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Activity & Booking History
              </h1>
              <p className="text-slate-500 text-sm sm:text-base mt-2 font-medium leading-relaxed">
                Seamlessly track and audit all venue usage across {user?.role === 'superadmin' ? 'the organization' : 'your department'}.
              </p>
            </div>

            {/* QUICK FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:flex items-center gap-4 w-full xl:w-auto">
              
              {/* DATE RANGE PICKER */}
              <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-2xl p-2 pr-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex items-center text-xs font-bold text-slate-800">
                  <input 
                    type="date"
                    className="bg-transparent outline-none w-[110px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                  <input 
                    type="date"
                    className="bg-transparent outline-none w-[110px]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* DEPARTMENT SELECTOR */}
              {user?.role === 'superadmin' && (
                <div className="flex items-center gap-2 bg-white/80 border border-slate-200 rounded-2xl p-2 pr-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                    <Filter className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none pr-4 w-full min-w-[150px]"
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
        </div>
      </div>

      {/* STATS OVERVIEW (SMALL ACCENT) */}
      {!loading && history.length > 0 && (
        <div className="flex items-center gap-2 px-4">
           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
           <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400">
             Analyzing {history.length} database records
           </span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold tracking-wide italic">Curating historical data...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-32 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-dashed border-slate-300 shadow-xl overflow-hidden animate-in zoom-in-95">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hash className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-slate-800">No records found</h3>
             <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Try adjusting your date range or filters to discover past activities.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* DESKTOP TABLE VIEW (Visible on tablet/desktop) */}
            <div className="hidden lg:block bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-200/60 transition-all hover:shadow-2xl hover:shadow-blue-500/5 duration-500">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Venue & Location</th>
                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Schedule</th>
                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Requestor</th>
                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="p-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Audit Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-sans">
                  {history.map((record, i) => (
                    <tr key={record._id} className="group hover:bg-blue-50/30 transition-all duration-300 cursor-default" style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="p-6 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-lg">{record.venue?.name || 'Unknown Venue'}</span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 mb-2 bg-blue-50 self-start px-2 py-0.5 rounded-lg border border-blue-100/50">{record.venue?.department?.name || 'Shared'}</span>
                          <div className="flex items-center text-slate-400 font-medium text-xs">
                             <MapPin className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                             {record.venue?.location || 'General Site'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-6 align-top">
                        <div className="bg-white/50 border border-slate-100 p-3 rounded-2xl shadow-sm group-hover:shadow-md transition-all">
                           <div className="flex items-center font-extrabold text-slate-800 mb-1">
                              <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                              {format(new Date(record.date), 'dd MMM, yyyy')}
                           </div>
                           <div className="flex items-center text-xs font-bold text-slate-500">
                              <Clock className="w-4 h-4 mr-2 text-blue-400" />
                              {record.timeSlot}
                           </div>
                        </div>
                      </td>

                      <td className="p-6 align-top">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-white text-slate-400 shadow-sm">
                              <User className="w-5 h-5" />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">{record.faculty?.name || 'System User'}</span>
                              <span className="text-xs text-slate-400 font-medium">{record.faculty?.email}</span>
                           </div>
                        </div>
                      </td>

                      <td className="p-6 align-top text-center">
                        <div className="flex flex-col items-center gap-2">
                           {getStatusBadge(record.status)}
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Verified</span>
                        </div>
                      </td>

                      <td className="p-6 align-top max-w-sm">
                        <div className="space-y-3">
                           <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-[13px] leading-relaxed text-slate-600 font-medium italic group-hover:bg-white transition-colors">
                              <span className="font-black text-[10px] uppercase tracking-widest text-slate-400 block mb-1 not-italic">Purpose:</span>
                              "{record.purpose}"
                           </div>
                           {record.reason && (
                             <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl text-[12px] text-indigo-700 italic">
                               <Info className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />
                               {record.reason}
                             </div>
                           )}
                           <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-3 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> Requested: {format(new Date(record.createdAt), 'dd/MM/yy HH:mm')}
                           </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW (Visible only on small screens) */}
            <div className="lg:hidden grid grid-cols-1 gap-6">
              {history.map((record, i) => (
                <div 
                  key={record._id} 
                  className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 relative overflow-hidden group active:scale-[0.98] transition-all"
                  style={{ animation: `fadeUp 0.5s ease ${i * 50}ms both` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -z-10 group-hover:bg-blue-100 transition-colors animate-pulse"></div>
                  
                  {/* STATUS & DATE BAR */}
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Schedule</span>
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-800">{format(new Date(record.date), 'dd MMM yyyy')}</span>
                        </div>
                     </div>
                     {getStatusBadge(record.status)}
                  </div>

                  {/* VENUE INFO */}
                  <div className="space-y-4">
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <BookOpen className="w-4 h-4 text-blue-500" />
                           <h3 className="text-xl font-black text-slate-800 line-clamp-1">{record.venue?.name || 'Venue'}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 ml-6 text-xs font-bold text-slate-400">
                           <MapPin className="w-3.5 h-3.5 text-red-400" />
                           {record.venue?.location}
                        </div>
                     </div>

                     {/* USER & DEPT */}
                     <div className="grid grid-cols-2 gap-4 py-4 px-4 bg-slate-50/80 rounded-[2rem] border border-slate-100/50">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Requestor</span>
                           <span className="text-xs font-bold text-slate-700 truncate">{record.faculty?.name}</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-200 pl-4">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Slot</span>
                           <span className="text-xs font-bold text-slate-700 truncate">{record.timeSlot}</span>
                        </div>
                     </div>

                     {/* PURPOSE */}
                     <div className="space-y-3 pt-2">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 pl-1">Reasoning</span>
                           <div className="bg-white border border-slate-100 p-4 rounded-3xl text-sm italic font-medium text-slate-600 leading-relaxed shadow-inner">
                              "{record.purpose}"
                           </div>
                        </div>
                        {record.reason && (
                           <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-3xl text-xs font-bold text-indigo-800 shadow-sm">
                              <span className="uppercase tracking-widest text-[9px] block mb-1 opacity-50">Admin Remarks:</span>
                              {record.reason}
                           </div>
                        )}
                     </div>

                     {/* FOOTER METADATA */}
                     <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-50">
                        <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/50 font-mono">
                           ID: {record._id.slice(-6)}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 italic">
                           Req: {format(new Date(record.createdAt), 'dd/MM/yy')}
                        </span>
                     </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
