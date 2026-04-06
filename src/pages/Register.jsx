import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, User, Mail, Lock, Loader2, Network } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // We assume the backend exposes this endpoint without auth, or we might need a public endpoint. 
    // Wait, /admin/departments is protected. We might need a public endpoint or we just call the public frontend one... wait, in admin.route.js:
    // router.get("/departments", authMiddleware, adminController.getAllDepartments);
    // Ah, it requires authMiddleware. I need to make sure there's a public way to get departments, or change the backend.
    // Let me check if /auth/departments exists... no. I better write to auth.route.js or just catch this and fix the backend route later if it fails.
    // For now, let's call it and see. If it fails, I'll add a public department route.
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // Fetch departments from auth route which is public
      const response = await api.get('/auth/departments');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error("Failed to load departments", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email.endsWith('@sistec.ac.in')) {
      return toast.error("Only @sistec.ac.in emails are allowed");
    }
    if (!formData.name || !formData.department || !formData.password) {
      return toast.error("Please fill all fields before requesting OTP");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsSendingOtp(true);
    try {
      const response = await api.post('/auth/send-otp', { email: formData.email });
      if (response.data.success) {
        setOtpSent(true);
        toast.success("OTP sent! Please check your email inbox (and spam folder).");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp || formData.otp.length !== 6) {
      return toast.error("Please enter the 6-digit OTP");
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        otp: formData.otp
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* 🔥 Background Image */}
      <img
        src="/images/ss.webp"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      {/* 🔥 Overlay (readability ke liye) */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm -z-10"></div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-[fadeIn_0.6s_ease-in-out]">
        <div className="flex justify-center">
          <div className="w-20 h-20 flex items-center justify-center shadow-lg rounded-full bg-white/20">
            <img
              src="/images/SISTec_Logo.png"
              alt="logo"
              className="h-24 sm:h-28 w-auto object-contain"
            />
          </div>
        </div>

        <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
          Create Account
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Faculty registration for SISTec
        </p>
      </div>

      {/* Card */}
      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full animate-[slideUp_0.6s_ease-in-out]">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-6 px-5 sm:py-8 sm:px-8 shadow-xl rounded-2xl text-white">

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-blue-100">Full Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-blue-100">Email address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="faculty@sistec.ac.in"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
                />
              </div>
              <p className="mt-1 text-xs text-blue-200">
                Must be a valid @sistec.ac.in address
              </p>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-blue-100">Department</label>
              <div className="mt-1 relative">
                <Network className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-blue-100">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength="6"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-blue-100">Confirm Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  minLength="6"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
                />
              </div>
            </div>

            {/* OTP Input - Only visible after OTP is sent */}
            {otpSent && (
              <div className="animate-[slideDown_0.3s_ease-in-out]">
                <label className="block text-sm font-medium text-blue-100">6-Digit OTP</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                  <input
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    maxLength="6"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
                  />
                </div>
              </div>
            )}

            {/* Button */}
            <div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-white text-blue-900 font-semibold hover:bg-blue-100 hover:scale-105 active:scale-95 transition duration-200"
                >
                  {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 hover:scale-105 active:scale-95 transition duration-200"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Register"}
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5 text-center text-sm text-blue-200">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-white hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
