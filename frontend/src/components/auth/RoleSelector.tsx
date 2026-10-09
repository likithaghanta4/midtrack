import React from 'react';
import { UserRole } from '../../types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="flex items-center gap-2 w-full mt-4 sm:mt-6 mb-3 sm:mb-5 p-1 bg-slate-100/80 rounded-xl sm:rounded-2xl">
      {/* Faculty Role Tab */}
      <button
        type="button"
        id="role-faculty-btn"
        onClick={() => onSelectRole('FACULTY')}
        className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 cursor-pointer ${
          selectedRole === 'FACULTY'
            ? 'bg-[#146EF5] text-white shadow-md shadow-blue-500/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h20v12H2z" />
          <path d="M7 21l3-6" />
          <path d="M17 21l-3-6" />
          <circle cx="9" cy="9" r="1.75" />
          <path d="M6 13v-0.5a2.5 2.5 0 0 1 5 0v0.5" />
          <path d="M14 8l1.5 1.5 3.5-3.5" />
        </svg>
        <span>Faculty</span>
      </button>

      {/* Student Role Tab */}
      <button
        type="button"
        id="role-student-btn"
        onClick={() => onSelectRole('STUDENT')}
        className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 cursor-pointer ${
          selectedRole === 'STUDENT'
            ? 'bg-[#146EF5] text-white shadow-md shadow-blue-500/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <span>Student</span>
      </button>
    </div>
  );
};
