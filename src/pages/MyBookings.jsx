import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Loader2, Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/booking/my');
      setBookings(res.data.bookings || []);
    } catch (error) {
      toast.error('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
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

            {bookings.map((booking, index) => (
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
                    <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition">
                      {booking.venue?.name || "Unknown Venue"}
                    </h3>

                    {getStatusBadge(booking.status)}
                  </div>

                  {/* LOCATION */}
                  <div className="flex items-center text-slate-500 text-sm mt-1 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">
                      {booking.venue?.location || "N/A"}
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
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 
                hover:shadow-sm transition">
                      <div className="flex items-center text-sm font-medium text-blue-900">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.timeSlot}
                      </div>
                    </div>

                    {/* PURPOSE */}
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 
                hover:bg-slate-100 transition">
                      <div className="flex items-start text-sm text-slate-600">
                        <FileText className="w-4 h-4 mr-2 mt-1 text-slate-400" />
                        <p className="line-clamp-2">
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

                    <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all text-blue-600 text-xs">
                      View →
                    </span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
