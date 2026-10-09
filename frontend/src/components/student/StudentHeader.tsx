import React from 'react';
import { LogOut, LayoutDashboard, FileText, CheckSquare, Award, Printer } from 'lucide-react';
import { User as AuthUserType } from '../../types';
import { getSRKRClassSem } from '../../utils/marksWordHelper';

export type StudentActiveTab = 'overview' | 'mid1' | 'mid2' | 'sessional' | 'print';

interface StudentHeaderProps {
  user: AuthUserType;
  studentData?: {
    name: string;
    registerNumber: string;
    branch: string;
    section: string;
    academicYear: string;
    semester: number;
  };
  activeTab: StudentActiveTab;
  onTabChange: (tab: StudentActiveTab) => void;
  onLogout: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  user,
  studentData,
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const studentName = studentData?.name || user.name || user.username;
  const regNo = studentData?.registerNumber || user.username;
  const branch = studentData?.branch || user.branch || 'CSD';
  const section = studentData?.section || user.section || 'A';
  const semester = studentData?.semester || user.semester || 6;
  const classSemString = getSRKRClassSem(semester);

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Branding & Profile Bar */}
        <div className="flex items-center justify-between h-20 border-b border-slate-100/80">
          {/* SRKR Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xs border border-slate-200/60 p-1 flex items-center justify-center shrink-0">
              <img
                src="/assets/srkr-emblem.png"
                alt="SRKR Seal"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0A2566] text-sm sm:text-base tracking-tight font-['Outfit']">
                  S.R.K.R. ENGINEERING COLLEGE
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block border border-amber-200">
                  AUTONOMOUS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-[#146EF5]">MID TRACK</span> — Student Academic Portal
              </p>
            </div>
          </div>

          {/* Student Profile Pill & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200/80 pl-2 pr-4 py-1.5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#0A2566] text-white flex items-center justify-center font-black text-xs shadow-xs">
                {getInitials(studentName)}
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[160px]">
                    {studentName}
                  </p>
                  <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                    {branch}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                  {regNo} • Sec-{section} • {classSemString}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-150 cursor-pointer shadow-2xs"
              title="Sign out of student portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Academic Performance</span>
          </button>

          <button
            onClick={() => onTabChange('mid1')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'mid1'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Mid-1 Detailed Report</span>
          </button>

          <button
            onClick={() => onTabChange('mid2')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'mid2'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Mid-2 Detailed Report</span>
          </button>

          <button
            onClick={() => onTabChange('sessional')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'sessional'
                ? 'bg-[#146EF5] text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Sessional Marks (80:20)</span>
          </button>

          <button
            onClick={() => onTabChange('print')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'print'
                ? 'bg-[#0A2566] text-white shadow-sm shadow-blue-900/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-blue-300" />
            <span>Download My Grade Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
};
