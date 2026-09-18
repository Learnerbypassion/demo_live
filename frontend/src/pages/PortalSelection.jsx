import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MonitorSmartphone, ArrowRight, UserCircle } from 'lucide-react';

export default function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-6xl w-full py-4 sm:py-0">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex justify-center mb-3 sm:mb-4">
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="Dhanvantri Logo"
              className="w-16 h-16 sm:w-24 sm:h-24 drop-shadow-xl rounded-2xl object-contain bg-white p-2 shadow-lg"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight">Dhanvantri</h1>
          <p className="text-base sm:text-xl text-brand-700 font-semibold px-2">
            The Future of Clinical History &amp; Case-Taking
          </p>
        </motion.div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {/* Patient Kiosk Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, borderColor: '#0ea5e9' }}
            className="group relative bg-white border-2 border-transparent shadow-md rounded-2xl p-5 sm:p-8 cursor-pointer transition-all flex flex-col"
            onClick={() => navigate('/kiosk')}
          >
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8 text-gray-400 group-hover:text-accent-600 transition-colors">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="bg-accent-50 border border-accent-100 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <MonitorSmartphone className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1.5">Patient MediKiosk</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
              Self-service clinical intake at the hospital. Log in via ABHA ID, report symptoms using Voice/Touch.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Auto-Triage</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">AYUSH Mode</span>
            </div>
          </motion.div>

          {/* Patient Portal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4, borderColor: '#10b981' }}
            className="group relative bg-white border-2 border-transparent shadow-md rounded-2xl p-5 sm:p-8 cursor-pointer transition-all flex flex-col"
            onClick={() => navigate('/patient-login')}
          >
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8 text-gray-400 group-hover:text-green-500 transition-colors">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="bg-green-50 border border-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1.5">My Patient Portal</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
              Access your medical history securely from home. View past prescriptions, updates, and manage your profile.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Read-Only History</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">OTP Login</span>
            </div>
          </motion.div>

          {/* Hospital Staff Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4, borderColor: '#3b82f6' }}
            className="group relative bg-white border-2 border-transparent shadow-md rounded-2xl p-5 sm:p-8 cursor-pointer transition-all flex flex-col"
            onClick={() => navigate('/hospital-login')}
          >
            <div className="absolute top-5 right-5 sm:top-8 sm:right-8 text-gray-400 group-hover:text-brand-600 transition-colors">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="bg-brand-50 border border-brand-100 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-brand-700" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1.5">Physician &amp; Staff</h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1">
              Review structured FHIR summaries in &lt;30s. Clinician-in-the-loop verification, staff management.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">HIS Interop</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Queue Mgmt</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
