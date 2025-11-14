'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export default function PrivacyPolicyPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                AI
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                SEO Ecosystem
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <Link
                  href="/analyze"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-100 dark:border-cyan-900/50 p-8 md:p-12"
        >
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At AI SEO Ecosystem, we are committed to protecting your privacy
              and ensuring the security of your personal information. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">1.</span>
              Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  1.1 Personal Information
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  We may collect personal information that you voluntarily
                  provide to us when you:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>
                    Register for an account (name, email address, password)
                  </li>
                  <li>
                    Use our SEO analysis services (website URLs, analysis
                    preferences)
                  </li>
                  <li>Contact us for support (name, email, message content)</li>
                  <li>Subscribe to our newsletter (email address)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  1.2 Usage Data
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                  We automatically collect certain information when you visit
                  our website, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information (operating system, device type)</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Date and time of visits</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  1.3 Cookies and Tracking Technologies
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to track
                  activity on our website and store certain information. Cookies
                  are files with a small amount of data that may include an
                  anonymous unique identifier. You can instruct your browser to
                  refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">2.</span>
              How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>
                <strong>Service Delivery:</strong> To provide, maintain, and
                improve our SEO analysis services
              </li>
              <li>
                <strong>Account Management:</strong> To create and manage your
                account, process transactions, and send related information
              </li>
              <li>
                <strong>Communication:</strong> To respond to your inquiries,
                provide customer support, and send important updates
              </li>
              <li>
                <strong>Analytics:</strong> To analyze usage patterns and
                improve our website functionality and user experience
              </li>
              <li>
                <strong>Security:</strong> To detect, prevent, and address
                technical issues, fraud, and security threats
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with legal
                obligations and enforce our terms of service
              </li>
            </ul>
          </section>

          {/* Information Sharing and Disclosure */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">3.</span>
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                service providers who assist us in operating our website and
                conducting our business (e.g., cloud hosting, analytics, payment
                processing)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court
                order, or government regulation
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets, where your information
                may be transferred as part of the transaction
              </li>
              <li>
                <strong>Protection of Rights:</strong> To protect our rights,
                property, or safety, or that of our users or others
              </li>
              <li>
                <strong>With Your Consent:</strong> When you have given us
                explicit permission to share your information
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">4.</span>
              Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. These measures
              include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Encryption of data in transit using SSL/TLS protocols</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular backups and disaster recovery procedures</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              However, no method of transmission over the Internet or electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your information, we cannot guarantee
              absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">5.</span>
              Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>
                <strong>Access:</strong> Request access to the personal
                information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or
                incomplete information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information (subject to legal and contractual obligations)
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your data to
                another service provider
              </li>
              <li>
                <strong>Objection:</strong> Object to processing of your
                personal information for certain purposes
              </li>
              <li>
                <strong>Withdrawal of Consent:</strong> Withdraw consent where
                processing is based on consent
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing
                communications at any time
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              To exercise these rights, please contact us using the information
              provided in the "Contact Us" section below.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">6.</span>
              Third-Party Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Our website may contain links to third-party websites or integrate
              with third-party services. We are not responsible for the privacy
              practices of these external sites. We encourage you to review the
              privacy policies of any third-party services you access through
              our platform, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>OpenAI/OpenRouter (for AI-powered analysis features)</li>
              <li>Cloud hosting and infrastructure providers</li>
              <li>Analytics and monitoring services</li>
              <li>Payment processing services (if applicable)</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">7.</span>
              Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required or permitted by law. When we
              no longer need your information, we will securely delete or
              anonymize it. Analysis results and reports may be retained for a
              reasonable period to allow you to access historical data, but you
              can request deletion at any time.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">8.</span>
              Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you are a parent or guardian and believe your child has provided
              us with personal information, please contact us immediately. If we
              become aware that we have collected personal information from a
              child without parental consent, we will take steps to delete that
              information.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">9.</span>
              International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have
              data protection laws that differ from those in your country. By
              using our services, you consent to the transfer of your
              information to these countries. We ensure that appropriate
              safeguards are in place to protect your information in accordance
              with this Privacy Policy.
            </p>
          </section>

          {/* Changes to This Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">10.</span>
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. We will notify you of any material changes by
              posting the new Privacy Policy on this page and updating the "Last
              updated" date. We encourage you to review this Privacy Policy
              periodically to stay informed about how we protect your
              information.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400">11.</span>
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-6 border border-cyan-200 dark:border-cyan-800">
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  <strong>Email:</strong> salotjay@gmail.com
                </li>
                <li>
                  <strong>Website:</strong>{" "}
                  <Link
                    href="/"
                    className="text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    https://aiseoecosystem.netlify.app/
                  </Link>
                </li>
                <li>
                  <strong>Support:</strong> Available through our website's
                  contact form or support channels
                </li>
              </ul>
            </div>
          </section>

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} AI SEO Ecosystem. All rights
              reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

