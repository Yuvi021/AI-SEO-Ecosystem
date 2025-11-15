'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/analyze', label: 'SEO Analysis', icon: '📊' },
    { href: '/keyword-research', label: 'Keyword Research', icon: '🔍' },
    { href: '/blog-generator', label: 'Blog Generator', icon: '✍️' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.nav 
      className="relative z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-blue-100/50 dark:border-blue-900/50 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-2"
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
                  <Image src="/logo.svg" alt="AI SEO Ecosystem" width={48} height={48} className="w-full h-full object-contain" />
                </motion.div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
              </motion.div>
              <div>
                <motion.span 
                  className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  AI SEO Ecosystem
                </motion.span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Multi-Agent AI</p>
              </div>
            </Link>
          </motion.div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                    isActive(link.href)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Side - Auth & Theme */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                <span className="hidden md:block text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                  {user?.email}
                </span>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm"
                >
                  Sign Out
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 dark:from-cyan-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center gap-2 pb-3 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive(link.href)
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
