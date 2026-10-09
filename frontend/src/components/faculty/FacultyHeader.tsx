import React from 'react';
import { LogOut, LayoutDashboard, Edit3, BarChart3, Calculator, Printer } from 'lucide-react';
import { User as AuthUserType } from '../../types';

export type FacultyTabType = 'OVERVIEW' | 'ENTER_MARKS' | 'ANALYTICS' | 'SESSIONALS' | 'PRINT_SHEET';

interface FacultyHeaderProps {
  user: AuthUserType;
  activeTab: FacultyTabType;
  onSelectTab: (tab: FacultyTabType) => void;
  onLogout: () => void;
}

export const FacultyHeader: React.FC<FacultyHeaderProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
}) => {
  const facultyName = user.name || user.username || 'Faculty Member';
  const department = user.facultyProfile?.department || 'CSD / CSIT';
  const facultyId = user.facultyProfile?.facultyId || user.username;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
      {/* Top Banner: SRKR Branding + Faculty Info + Logout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: SRKR Emblem + Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 flex-shrink-0">
            <img
              src="/assets/srkr-emblem.png"
              alt="SRKR College Emblem"
              className="w-full h-full object-contain filter drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#0A2566] tracking-tight font-['Outfit']">
                S.R.K.R. ENGINEERING COLLEGE
              </h1>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Autonomous
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              MID TRACK — Faculty Mid Marks Management System
            </p>
          </div>
        </div>

        {/* Right: Faculty Profile Pill + Logout */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-3 bg-[#F0F6FD] border border-blue-100 px-3.5 py-2 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#146EF5] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {facultyName.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'FC'}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0A2566] truncate max-w-[170px] sm:max-w-[220px]">
                  {facultyName}
                </span>
                <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {department}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                ID: {facultyId} • Faculty Portal
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-red-200 shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="bg-[#F8FAFC] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2">
          {/* Tab 1: Overview */}
          <button
            onClick={() => onSelectTab('OVERVIEW')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-[#0A2566] hover:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Classes Overview</span>
          </button>

          {/* Tab 2: Enter Mid Marks */}
          <button
            onClick={() => onSelectTab('ENTER_MARKS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'ENTER_MARKS'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-[#0A2566] hover:bg-slate-200/60'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Enter Mid Marks</span>
          </button>

          {/* Tab 3: View Analytics */}
          <button
            onClick={() => onSelectTab('ANALYTICS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-[#0A2566] hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Class Analytics</span>
          </button>

          {/* Tab 4: Sessional Calculation */}
          <button
            onClick={() => onSelectTab('SESSIONALS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'SESSIONALS'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-[#0A2566] hover:bg-slate-200/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Sessional Marks (80:20)</span>
          </button>

          {/* Tab 5: Print Mark Sheets */}
          <button
            onClick={() => onSelectTab('PRINT_SHEET')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'PRINT_SHEET'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-[#0A2566] hover:bg-slate-200/60'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Print Mark Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};
