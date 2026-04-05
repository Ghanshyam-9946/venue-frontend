import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Reset link sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request. Please try again.');
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

  {/* 🔥 Overlay for readability */}
  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm -z-10"></div>

  {/* Header */}
  <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-[fadeIn_0.6s_ease-in-out]">
    <div className="flex justify-center">
      <div className="w-20 h-20 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
        <KeyRound className="w-10 h-10 text-white" />
      </div>
    </div>

    <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
      Forgot Password
    </h2>

    <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
      {isSent
        ? "We've sent a password reset link to your email address."
        : "Enter your email and we'll send you a reset link."}
    </p>
  </div>

  {/* Card */}
  <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full animate-[slideUp_0.6s_ease-in-out]">
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 py-6 px-5 sm:py-8 sm:px-8 shadow-xl rounded-2xl text-white">

      {!isSent ? (
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-blue-100">
              Email address
            </label>

            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white text-slate-900 border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none transition duration-200"
              />
            </div>
          </div>

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-white text-blue-900 font-semibold hover:bg-blue-100 hover:scale-105 active:scale-95 transition duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </button>
          </div>
        </form>
      ) : (

        /* Success State */
        <div className="text-center animate-[fadeIn_0.5s_ease-in-out]">
          <div className="rounded-lg bg-white/10 backdrop-blur-sm p-4 border border-blue-300/30 mb-5">
            <h3 className="text-sm font-semibold text-white">
              Check your email
            </h3>
            <p className="mt-2 text-sm text-blue-100">
              We've sent a reset link to <strong>{email}</strong>
            </p>
          </div>

          <button
            onClick={() => setIsSent(false)}
            className="text-sm font-medium text-blue-200 hover:text-white transition"
          >
            Try another email
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-blue-200 border-t border-blue-800 pt-5">
        <Link
          to="/login"
          className="font-semibold text-white hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>

    </div>
  </div>
</div>
  );
}
