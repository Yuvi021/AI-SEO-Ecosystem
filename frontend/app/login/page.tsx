'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setErrors({ general: err.message || 'An error occurred. Please try again.' });
      setLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20 transition-colors duration-300 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
          }}
        ></motion.div>
        <motion.div 
          className="absolute w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          style={{
            right: `${mousePosition.x / 25}px`,
            bottom: `${mousePosition.y / 25}px`,
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        ></motion.div>
      </div>

      {/* AI Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#60a5fa08_1px,transparent_1px),linear-gradient(to_bottom,#60a5fa08_1px,transparent_1px)] pointer-events-none z-0"></div>

      {/* Navigation */}
      <motion.nav 
        className="relative z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-blue-100/50 dark:border-blue-900/50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-2"
                  animate={{ 
                    boxShadow: [
                      "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                      "0 10px 40px -5px rgba(147, 51, 234, 0.4)",
                      "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Image src="/logo.svg" alt="AI SEO Ecosystem" width={64} height={64} className="w-full h-full object-contain" />
                </motion.div>
              </motion.div>
              <div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  AI SEO Ecosystem
                </motion.span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent AI</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/"
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Home
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border-2 border-cyan-100/50 dark:border-cyan-900/50 shadow-2xl p-8"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center mb-8">
              <motion.h1 
                className="text-3xl font-bold mb-2 text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Sign in to continue to your SEO analysis
              </motion.p>
            </div>

            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  required
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 dark:text-white transition-all ${
                    errors.email
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-cyan-100 dark:border-cyan-900 focus:ring-cyan-500 dark:focus:ring-cyan-400'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  required
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 dark:text-white transition-all ${
                    errors.password
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                      : 'border-cyan-100 dark:border-cyan-900 focus:ring-cyan-500 dark:focus:ring-cyan-400'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

