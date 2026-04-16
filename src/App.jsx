import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/AuthRoutes';
import { Toaster } from 'react-hot-toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VenuesList from './pages/VenuesList';
import BookingPage from './pages/BookingPage';
import MultiBookingPage from './pages/MultiBookingPage';
import MyBookings from './pages/MyBookings';
import AdminVenues from './pages/admin/AdminVenues';
import AdminRequests from './pages/admin/AdminRequests';
import AdminDashboard from './pages/admin/AdminDashboard'; 
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminHistory from './pages/admin/AdminHistory';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBlocks from './pages/admin/AdminBlocks';
import Profile from './pages/Profile';

import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ForceChangePassword from './pages/ForceChangePassword';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Root Redirect Logic */}
          <Route path="/" element={<Home />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Mandatory First Login */}
          <Route path="/force-change-password" element={<ProtectedRoute allowFirstLogin={true}><ForceChangePassword /></ProtectedRoute>} />

          {/* Protected Routes - Faculty and Admin sharing some layouts if structured that way */}
          <Route element={<DashboardLayout />}>
            {/* Protected Routes - Faculty and Admin sharing some layouts if structured that way */}
            <Route path="venues" element={<ProtectedRoute><VenuesList /></ProtectedRoute>} />
            <Route path="venues/:id/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="book-multiple" element={<ProtectedRoute><MultiBookingPage /></ProtectedRoute>} />
            <Route path="my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin specific */}
            <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="admin/departments" element={<ProtectedRoute requiredRole="superadmin"><AdminDepartments /></ProtectedRoute>} />
            <Route path="admin/blocks" element={<ProtectedRoute requiredRole="superadmin"><AdminBlocks /></ProtectedRoute>} />

            <Route path="admin/departments/:id/venues" element={<ProtectedRoute requiredRole="admin"><AdminVenues /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute requiredRole="superadmin"><AdminUsers /></ProtectedRoute>} />
            <Route path="admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/venues" element={<ProtectedRoute requiredRole="admin"><AdminVenues /></ProtectedRoute>} />
            <Route path="admin/requests" element={<ProtectedRoute requiredRole="admin"><AdminRequests /></ProtectedRoute>} />
            <Route path="admin/history" element={<ProtectedRoute requiredRole="admin"><AdminHistory /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
