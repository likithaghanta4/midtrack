import React from 'react';
import { UserCheck, LogOut, CheckCircle2, Building, School } from 'lucide-react';
import { User } from '../../types';

interface AuthenticatedPlaceholderProps {
  user: User;
  onLogout: () => void;
}

export const AuthenticatedPlaceholder: React.FC<AuthenticatedPlaceholderProps> = ({ user, onLogout }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 max-w-lg w-full mx-auto text-left animate-fadeIn">
      {/* Header with Role Badge */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F2856] leading-tight">
              {user.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {user.role}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {user.facultyId || user.registerNumber || user.username}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          id="logout-btn"
          className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            Branch / Department
          </span>
          <p className="text-sm font-bold text-[#0F2856]">
            {user.department || user.branch || 'SRKR Engineering College'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <School className="w-3.5 h-3.5 text-blue-600" />
            Class / Section
          </span>
          <p className="text-sm font-bold text-[#0F2856]">
            {user.section ? `${user.section} (Sem ${user.semester})` : 'Faculty Staff'}
          </p>
        </div>
      </div>

      {/* Status Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Authentication Verified</p>
          <p className="text-emerald-700 mt-0.5">
            Module 5 Login UI connected successfully. Awaiting Module 6 for the full Faculty Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
