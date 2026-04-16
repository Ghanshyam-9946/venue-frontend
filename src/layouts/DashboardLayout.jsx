import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Building2,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  Users,
  Grid
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  let navItems = [];
  if (user?.role === 'superadmin') {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Manage Structure (Blocks)', path: '/admin/blocks', icon: Grid },
      { name: 'Users (Admins)', path: '/admin/users', icon: Users },
      { name: 'Booking Requests', path: '/admin/requests', icon: CalendarDays },
      { name: 'Booking History', path: '/admin/history', icon: CalendarDays },
      { name: 'Profile Management', path: '/profile', icon: Settings },
    ];
  } else if (user?.role === 'admin') {
    navItems = [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Booking Requests', path: '/admin/requests', icon: CalendarDays },
      { name: 'Booking History', path: '/admin/history', icon: CalendarDays },
      { name: 'Profile Management', path: '/profile', icon: Settings },
    ];
  } else {
    navItems = [
      { name: 'Available Venues', path: '/venues', icon: Building2 },
      { name: 'My Bookings', path: '/my-bookings', icon: CalendarDays },
      { name: 'My Profile', path: '/profile', icon: Settings },
    ];
  }

  const handleLogout = async () => {
    const isConfirm = window.confirm("Are you sure you want to logout?");
    if (isConfirm) {
      await logout();
      navigate('/');
    }
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
              ? 'bg-brand-50 text-brand-700 font-medium'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white fixed h-full z-30 shadow-2xl animate-fade-in">

        {/* LOGO */}
        <Link 
          to={user?.role === 'faculty' ? '/venues' : '/admin/dashboard'}
          className="h-16 flex items-center px-6 border-b border-white/10 hover:bg-white/10 transition group"
        >
          <img
            src="/images/SISTec_Logo.png"
            alt="logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-xl font-bold tracking-wide ml-2">VenueBook</span>
        </Link>

        {/* NAV */}
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">

          <div className="
        space-y-2
        [&>a]:flex [&>a]:items-center [&>a]:gap-3
        [&>a]:px-4 [&>a]:py-3
        [&>a]:rounded-xl
        [&>a]:text-blue-100
        [&>a]:transition-all [&>a]:duration-300

        [&>a:hover]:bg-white/20 
        [&>a:hover]:text-white
        [&>a:hover]:translate-x-1

        [&>a.active]:bg-white 
        [&>a.active]:text-blue-900
        [&>a.active]:shadow-lg
        [&>a.active]:scale-[1.02]
      ">
            <NavLinks />
          </div>

        </div>

        {/* USER */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">

          <Link to="/profile" className="flex items-center space-x-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-full bg-white/20 flex justify-center items-center overflow-hidden border border-white/10 group-hover:border-white/30 transition">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            <div className="truncate">
              <p className="text-sm font-medium truncate group-hover:text-blue-200 transition">{user?.name}</p>
              <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/20 rounded-lg transition hover:scale-110"
          >
            <LogOut className="w-5 h-5 text-white hover:text-red-300" />
          </button>
        </div>
      </aside>


      {/* MAIN */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10">

        {/* MOBILE HEADER */}
        <header className="md:hidden h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm animate-fade-in">

          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-blue-700 mr-2" />
            <span className="text-lg font-bold text-blue-900">VenueBook</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition hover:scale-110"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>


        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="absolute top-16 left-3 right-3 rounded-3xl 
          bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/40 
          p-4 space-y-4 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >

              {/* TOP */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h2 className="text-lg font-bold text-blue-900">Menu</h2>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* NAV */}
              <div className="
            [&>a]:flex [&>a]:items-center [&>a]:gap-3
            [&>a]:px-4 [&>a]:py-3
            [&>a]:rounded-xl
            [&>a]:text-slate-700
            [&>a]:transition-all

            [&>a:hover]:bg-blue-50
            [&>a:hover]:translate-x-1

            [&>a.active]:bg-blue-100
            [&>a.active]:text-blue-900
          ">
                <NavLinks />
              </div>

              {/* USER */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-xl p-3">

                <Link to="/profile" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-blue-700" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-red-100 transition hover:scale-110"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                </button>
              </div>

            </div>
          </div>
        )}


        {/* CONTENT */}
        <div className="flex-1 p-4 md:p-8">

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-4 md:p-6 shadow-xl border border-white/40 min-h-full animate-fade-in hover:shadow-2xl transition-all duration-300">
            <Outlet />
          </div>

        </div>
      </main>
    </div>
  );
}
