import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Calendar, MapPin, Clock, FileText, Info, X } from 'lucide-react';
import { format } from 'date-fns';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/booking/my');
      const transformedBookings = (res.data.bookings || []).map(b => ({
        ...b,
        venue: b.venue ? {
          ...b.venue,
          name: b.venue.name.toLowerCase() === "ec hall" ? "Impression" : b.venue.name
        } : b.venue
      }));
      setBookings(transformedBookings);
    } catch (error) {
      toast.error('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    const isBatch = booking.isGrouped && booking.items?.length > 1;
    const confirmMessage = isBatch 
      ? "Do you want to cancel the ENTIRE batch of bookings? This cannot be undone."
      : "Are you sure you want to cancel this booking? This cannot be undone.";

    if (!window.confirm(confirmMessage)) return;

    try {
      const id = isBatch ? booking.items[0]._id : booking._id;
      const res = await api.post(`/booking/cancel/${id}`, {
        cancelBatch: isBatch
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchMyBookings();
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const displayBookings = [];
  const batchGroups = {};

  bookings.forEach(req => {
    if (req.batchId) {
      const key = req.batchId;
      if (!batchGroups[key]) batchGroups[key] = [];
      batchGroups[key].push(req);
    } else {
      displayBookings.push({ isGrouped: false, ...req });
    }
  });

  Object.values(batchGroups).forEach(group => {
    displayBookings.push({
      isGrouped: true,
      ...group[0],
      items: group
    });
  });

  displayBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      'not approved': 'bg-gray-100 text-gray-800 border-gray-200',
      revoked: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-500 border-gray-200 italic'
    };

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${colors[status.toLowerCase()] || colors.pending} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white  p-4 sm:p-6">

      {/* 🔥 Background Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96  blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96  blur-[120px] rounded-full animate-pulse"></div>

      <div className="relative space-y-10 pb-10 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div className="animate-[fadeUp_0.5s_ease]">
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your requests in a smarter way
            </p>
          </div>

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (

          /* EMPTY STATE */
          <div className="relative text-center py-24 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-xl overflow-hidden animate-[scaleIn_0.4s_ease]">

            <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-400/20 blur-3xl"></div>

            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-2xl mb-5 shadow-md animate-bounce">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                No bookings yet
              </h3>

              <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
                Start booking venues and your requests will appear here.
              </p>
            </div>
          </div>

        ) : (

          /* GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">

            {displayBookings.map((booking, index) => (
              <div
                key={booking._id}
                className="relative group rounded-3xl p-[1px] 
            bg-gradient-to-br  to-blue-200/30 
            hover:from-blue-600/70 
            transition-all duration-500
            animate-[fadeUp_0.5s_ease]"
                style={{ animationDelay: `${index * 80}ms` }}
              >

                {/* CARD */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 h-full flex flex-col justify-between shadow-xl 
            group-hover:scale-[1.03] group-hover:-translate-y-1 transition-all duration-500">

                  {/* STATUS */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition line-clamp-1">
                      {booking.isGrouped 
                        ? [...new Set(booking.items.map(i => i.venue?.name))].join(", ") 
                        : (booking.venue?.name || "Unknown Venue")}
                    </h3>

                    {getStatusBadge(booking.status)}
                  </div>

                  {/* LOCATION */}
                  <div className="flex items-center text-slate-500 text-sm mt-1 mb-4">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="truncate line-clamp-1">
                      {booking.isGrouped
                        ? [...new Set(booking.items.map(i => i.venue?.location))].join(", ")
                        : (booking.venue?.location || "N/A")}
                    </span>
                  </div>

                  {/* MAIN INFO */}
                  <div className="flex flex-col gap-3">

                    {/* DATE */}
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 
                hover:shadow-sm transition">
                      <div className="flex items-center text-sm font-medium text-blue-900">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(booking.date), 'MMM dd')}
                      </div>
                      <span className="text-xs text-slate-500">
                        {format(new Date(booking.date), 'yyyy')}
                      </span>
                    </div>

                    {/* TIME */}
                    <div className="flex flex-col gap-2 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 hover:shadow-sm transition">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Time Slot(s)</p>
                      {booking.isGrouped ? (
                        [...new Set(booking.items.map(item => item.timeSlot))].map((slot, idx) => (
                          <div key={idx} className="flex items-center text-sm font-bold text-blue-900">
                            <Clock className="w-4 h-4 mr-2 text-blue-400" />
                            {slot}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center text-sm font-bold text-blue-900">
                          <Clock className="w-4 h-4 mr-2 text-blue-400" />
                          {booking.timeSlot}
                        </div>
                      )}
                    </div>

                    {/* PURPOSE */}
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 
                hover:bg-slate-100 transition">
                      <div className="flex items-start text-sm text-slate-600">
                        <FileText className="w-4 h-4 mr-2 mt-1 text-slate-400" />
                        <p className="line-clamp-2 text-justify">
                          {booking.purpose}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="mt-5 text-xs text-slate-400 flex justify-between items-center">
                    <span>
                      {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                    </span>

                    <div className="flex items-center gap-3">
                      {["pending", "approved"].includes(booking.status.toLowerCase()) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(booking);
                          }}
                          className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider bg-red-50 px-2 py-1 rounded-lg border border-red-100 hover:bg-red-100 cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="text-blue-600 text-xs font-semibold uppercase tracking-widest cursor-pointer hover:text-blue-800 transition-colors"
                      >
                        View →
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
      {/* MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-100">
            
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {selectedBooking.isGrouped 
                    ? [...new Set(selectedBooking.items.map(i => i.venue?.name))].join(", ")
                    : (selectedBooking.venue?.name || "Unknown Venue")}
                </h2>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                  {selectedBooking.isGrouped
                    ? [...new Set(selectedBooking.items.map(i => i.venue?.location))].join(", ")
                    : (selectedBooking.venue?.location || "N/A")}
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 font-medium">
                    {selectedBooking.isGrouped
                      ? [...new Set(selectedBooking.items.map(i => i.venue?.department?.name))].join(", ")
                      : (selectedBooking.venue?.department?.name || "No Dept")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl flex items-center">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 mr-3">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">Date</div>
                    <div className="font-semibold text-slate-900">{format(new Date(selectedBooking.date), 'MMM dd, yyyy')}</div>
                  </div>
                </div>

                <div className="flex-1 bg-indigo-50 p-4 rounded-2xl flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 mr-3">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">Time Slot(s)</div>
                    <div className="font-semibold text-slate-900">
                      {selectedBooking.isGrouped
                        ? [...new Set(selectedBooking.items.map(i => i.timeSlot))].join(", ")
                        : selectedBooking.timeSlot}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-2">Purpose</div>
                <div className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm leading-relaxed text-justify">
                  {selectedBooking.purpose}
                </div>
              </div>

              {selectedBooking.requirements && (
                <div>
                  <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-2">Requirements</div>
                  <div className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm leading-relaxed text-justify">
                    {selectedBooking.requirements}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600 uppercase">Status:</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                {selectedBooking.reason && (
                  <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg max-w-full">
                    <Info className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                    <span className="truncate">{selectedBooking.reason}</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
