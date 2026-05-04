import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      toast.success('Login successful!');

      if (['admin', 'superadmin'].includes(response.data.user.role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/venues');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
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

      {/* HEADER */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <img
            src="/images/SISTec_Logo.png"
            alt="logo"
            className="h-24 sm:h-28 w-auto object-contain"
          />
        </div>

        <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your account
        </p>
      </div>

      {/* FORM CARD */}
      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full">
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-6 px-5 sm:py-8 sm:px-8 shadow-xl rounded-2xl text-white">

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-blue-100">
                Email address
              </label>

              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-blue-100">
                Password
              </label>

              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </div>

              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-200 hover:text-white"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-white text-blue-900 font-semibold hover:bg-blue-100 transition"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          {/* Register */}
          <div className="mt-5 text-center text-sm text-blue-200">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-white hover:underline"
            >
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
