import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Building2, 
  Users, 
  UserCircle, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export const DEMO_CREDENTIALS = [
  {
    id: 'admin_doctor',
    roleTitle: 'Hospital Admin / Doctor',
    badge: 'Staff Portal',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Building2,
    targetUrl: '/hospital-login',
    tab: 'admin',
    fields: [
      { label: 'Email', value: 't@t.com' },
      { label: 'Password', value: '1234567890' },
    ],
    note: 'Use under Admin or Doctor login tabs',
  },
  {
    id: 'receptionist',
    roleTitle: 'Receptionist Desk',
    badge: 'Staff Portal',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Users,
    targetUrl: '/hospital-login',
    tab: 'receptionist',
    fields: [
      { label: 'Email', value: 'r@r.com' },
      { label: 'Password', value: 'Reception@123' },
    ],
    note: 'Use under Receptionist login tab',
  },
  {
    id: 'patient',
    roleTitle: 'Patient Portal & MediKiosk',
    badge: 'Patient Portal',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: UserCircle,
    targetUrl: '/patient-login',
    tab: 'patient',
    fields: [
      { label: 'Phone', value: '7602991068' },
      { label: 'Pass / OTP', value: '1234567890' },
    ],
    note: 'Use on Patient Login or Kiosk. Demo OTP: 123456 or 1234567890',
  },
];

export default function JudgeCredentials({ variant = 'card', onFill, currentTab }) {
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // 1. Compact Variant (For HospitalLogin / PatientLogin pages)
  if (variant === 'compact') {
    return (
      <div className="w-full bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-xl p-4 shadow-lg border border-slate-700/60 mt-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Judge / Evaluator Logins</span>
              <p className="text-[11px] text-slate-300">Click any field to copy or quick-fill the form</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700"
          >
            {isCollapsed ? (
              <>Show <ChevronDown className="w-3.5 h-3.5" /></>
            ) : (
              <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="mt-3 grid grid-cols-1 gap-2.5">
            {DEMO_CREDENTIALS.map((cred) => {
              const Icon = cred.icon;
              const isCurrent = currentTab === cred.tab;
              return (
                <div
                  key={cred.id}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isCurrent 
                      ? 'bg-brand-900/60 border-brand-400/70 shadow-sm' 
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs font-semibold text-slate-100">{cred.roleTitle}</span>
                    </div>
                    {onFill && (
                      <button
                        type="button"
                        onClick={() => onFill(cred)}
                        className="text-[11px] font-medium bg-brand-600 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition-colors shadow-sm"
                      >
                        Quick Fill
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {cred.fields.map((f) => {
                      const copyId = `${cred.id}-${f.label}`;
                      const isCopied = copiedKey === copyId;
                      return (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => handleCopy(f.value, copyId)}
                          className="flex items-center justify-between bg-slate-900/90 hover:bg-slate-900 px-2.5 py-1.5 rounded border border-slate-700/80 group transition-all text-left"
                          title="Click to copy"
                        >
                          <div className="truncate mr-1">
                            <span className="text-[10px] text-slate-400 block uppercase leading-tight font-medium">{f.label}</span>
                            <span className="font-mono text-xs font-semibold text-slate-200 truncate block">{f.value}</span>
                          </div>
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 shrink-0 transition-colors" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 2. Full Card Variant (For PortalSelection.jsx Landing Page)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-10 sm:mt-12 max-w-5xl mx-auto w-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden"
    >
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 px-5 py-4 sm:px-6 sm:py-4.5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Judge &amp; Evaluator Login Credentials
              </h3>
              <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Demo Mode
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Instant login credentials for evaluating all portal roles. Click any value to copy.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60">
        {DEMO_CREDENTIALS.map((cred) => {
          const Icon = cred.icon;
          return (
            <div
              key={cred.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md hover:border-brand-300 transition-all"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                      <Icon className="w-4 h-4 text-brand-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">{cred.roleTitle}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${cred.badgeColor}`}>
                        {cred.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fields with Copy Buttons */}
                <div className="space-y-2 mt-3">
                  {cred.fields.map((f) => {
                    const copyId = `card-${cred.id}-${f.label}`;
                    const isCopied = copiedKey === copyId;
                    return (
                      <div
                        key={f.label}
                        onClick={() => handleCopy(f.value, copyId)}
                        className="group flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-brand-400 hover:bg-brand-50/40 cursor-pointer transition-all"
                        role="button"
                        tabIndex={0}
                        title="Click to copy"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider leading-tight">
                            {f.label}
                          </span>
                          <span className="font-mono text-xs font-semibold text-gray-800 truncate block">
                            {f.value}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center">
                          {isCopied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Copied
                            </span>
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 text-gray-400 group-hover:text-brand-600 transition-opacity">
                              <Copy className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cred.note && (
                  <p className="text-[11px] text-gray-500 mt-2.5 leading-tight">
                    💡 {cred.note}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => navigate(cred.targetUrl)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
              >
                Go to Login <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 3. Floating Quick-Access Drawer Widget (Global Floating Pill in App.jsx)
export function FloatingJudgeCredentials() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const navigate = useNavigate();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Pill button (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-slate-900 to-brand-900 hover:from-slate-800 hover:to-brand-800 text-white rounded-full shadow-xl border border-amber-400/40 text-xs font-semibold transition-all group"
          title="Toggle Judge Credentials"
        >
          <KeyRound className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Judge Credentials</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </motion.button>
      </div>

      {/* Slide-over Drawer / Modal with Backdrop Click to Close */}
      <AnimatePresence>
        {isOpen && (
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs cursor-pointer select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] cursor-default select-text"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base">Judge &amp; Evaluator Credentials</h3>
                    <p className="text-xs text-slate-300">Click to copy credentials or navigate directly</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700"
                >
                  ✕ Close
                </button>
              </div>

              {/* Credentials List */}
              <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
                {DEMO_CREDENTIALS.map((cred) => {
                  const Icon = cred.icon;
                  return (
                    <div key={cred.id} className="p-3 bg-slate-50 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-brand-700" />
                          <span className="text-xs font-bold text-gray-900">{cred.roleTitle}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(cred.targetUrl);
                          }}
                          className="text-[11px] text-brand-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {cred.fields.map((f) => {
                          const copyId = `float-${cred.id}-${f.label}`;
                          const isCopied = copiedKey === copyId;
                          return (
                            <button
                              key={f.label}
                              type="button"
                              onClick={() => handleCopy(f.value, copyId)}
                              className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-gray-300 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all group"
                            >
                              <div className="min-w-0 pr-1">
                                <span className="text-[10px] uppercase font-semibold text-gray-400 block leading-tight">
                                  {f.label}
                                </span>
                                <span className="font-mono text-xs font-bold text-gray-800 truncate block">
                                  {f.value}
                                </span>
                              </div>
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {cred.note && (
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-tight">
                          💡 {cred.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-600">
                  Built for rapid evaluation in SIH / Hackathon presentations.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
