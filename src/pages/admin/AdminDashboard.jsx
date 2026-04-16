import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Building2, CalendarDays, Loader2, BookOpen, Clock, UserPlus, Mail, Lock, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      let venuesUrl = '/admin/venues';
      if (user?.role === 'admin') venuesUrl += '?manage=true';

      const [venuesRes, requestsRes] = await Promise.all([
        api.get(venuesUrl),
        api.get('/admin/requests')
      ]);

      const venues = venuesRes.data.venues || [];
      const requests = requestsRes.data.requests || [];
      const pending = requests.filter(r => r.status === 'pending');

      setStats({
        totalVenues: venues.length,
        totalRequests: requests.length,
        pendingRequests: pending.length
      });
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-40">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Venues',
      value: stats.totalVenues,
      icon: Building2,
      color: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
      path: '/admin/venues'
    },
    {
      title: 'Total Bookings',
      value: stats.totalRequests,
      icon: BookOpen,
      color: 'bg-brand-100 text-brand-600',
      border: 'border-brand-200',
      path: '/admin/history'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      border: 'border-yellow-200',
      path: '/admin/requests'
    }
  ];

  return (
    <div className="relative space-y-8 px-4 sm:px-6 md:px-8 py-6 animate-fade-in overflow-hidden">

      {/* 🔥 BG GLOW (reduce for mobile) */}
      <div className="absolute -top-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-400/20 blur-[100px] rounded-full"></div>

      {/* HEADER */}
      <div className="relative z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-xs sm:text-sm md:text-base">
          System overview and statistics at a glance
        </p>
      </div>


      {/* 🔥 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.path}
              className="group relative p-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/40 to-blue-200/20 hover:from-blue-600/60 transition-all duration-500 block"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex flex-col justify-between h-full group-hover:scale-[1.02] transition">

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      {card.title}
                    </p>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-900 tracking-tight">
                      {card.value}
                    </h3>
                  </div>

                  <div className={`p-3 sm:p-4 rounded-xl ${card.color} shadow group-hover:scale-110 transition`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="mt-3 h-1 w-0 bg-blue-500 rounded-full group-hover:w-full transition-all duration-500"></div>

              </div>
            </Link>
          );
        })}
      </div>


    </div>
  );
}
