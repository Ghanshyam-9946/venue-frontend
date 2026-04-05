import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-9xl font-bold text-brand-600">404</h1>
      <h2 className="text-3xl font-semibold text-slate-900 mt-4">Page Not Found</h2>
      <p className="text-slate-600 mt-2 max-w-md text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-8 btn btn-primary">
        Return Home
      </Link>
    </div>
  );
}
