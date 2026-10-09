import React from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { CampusSkyline } from './CampusSkyline';

export const LoginBranding: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-left z-10 select-none">
      {/* ========================================================================= */}
      {/* Top Header: Official Circular SRKR Emblem & College Header */}
      {/* ========================================================================= */}
      <div className="flex items-start gap-4 sm:gap-5 max-w-xl">
        {/* SRKR Official Emblem (Circular Transparent) */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          <img
            src="/assets/srkr-emblem.png"
            alt="S.R.K.R. Engineering College Seal"
            className="w-full h-full object-contain filter drop-shadow-md rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
            }}
          />
        </div>

        {/* College Titles & Information */}
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl lg:text-[31px] font-black tracking-tight text-[#0A2566] font-['Outfit'] leading-none">
            S.R.K.R. Engineering College
          </h1>
          <p className="text-xs sm:text-[13.5px] font-semibold text-slate-700 tracking-normal pt-1">
            Chinaamiram, Bhimavaram, Andhra Pradesh
          </p>

          {/* Yellow/Amber Horizontal Accent Line */}
          <div className="w-14 h-[3.5px] bg-[#E5A83B] rounded-full my-2.5" />

          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0A2566] tracking-tight">
              Mid Marks Management System
            </h2>
            <p className="text-xs sm:text-[13.5px] text-slate-700 leading-snug mt-1 font-medium">
              Simplifying Internal Evaluation.<br />
              Empowering Faculty. Supporting Students.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Bottom Features & Campus Motto Overlay */}
      {/* ========================================================================= */}
      <div className="pt-6 sm:pt-8 space-y-3.5 max-w-xl">
        {/* 3 Frosted Deep Navy Acrylic Glass Cards matching reference */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* Feature 1: Enter & Manage Mid Marks */}
          <div className="bg-[#0B1E48]/65 hover:bg-[#0B1E48]/80 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center text-white flex flex-col items-center justify-center shadow-lg transition-all duration-200">
            <div className="mb-2">
              <BookOpen className="w-6 h-6 text-white stroke-[2]" />
            </div>
            <p className="text-xs sm:text-[13px] font-bold leading-tight">Enter & Manage</p>
            <p className="text-[11px] sm:text-xs text-slate-200 font-normal leading-tight mt-0.5">Mid Marks</p>
          </div>

          {/* Feature 2: Generate Mark Sheets */}
          <div className="bg-[#0B1E48]/65 hover:bg-[#0B1E48]/80 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center text-white flex flex-col items-center justify-center shadow-lg transition-all duration-200">
            <div className="mb-2">
              <FileText className="w-6 h-6 text-white stroke-[2]" />
            </div>
            <p className="text-xs sm:text-[13px] font-bold leading-tight">Generate</p>
            <p className="text-[11px] sm:text-xs text-slate-200 font-normal leading-tight mt-0.5">Mark Sheets</p>
          </div>

          {/* Feature 3: View Personal Results */}
          <div className="bg-[#0B1E48]/65 hover:bg-[#0B1E48]/80 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-center text-white flex flex-col items-center justify-center shadow-lg transition-all duration-200">
            <div className="mb-2">
              {/* Ascending 3 Bars with Upward Trending Arrow */}
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 7l4-4m0 0h-6m6 0v6" />
                <path d="M4 20v-4" />
                <path d="M10 20v-8" />
                <path d="M16 20v-12" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            </div>
            <p className="text-xs sm:text-[13px] font-bold leading-tight">View Personal</p>
            <p className="text-[11px] sm:text-xs text-slate-200 font-normal leading-tight mt-0.5">Results</p>
          </div>
        </div>

        {/* Bottom Skyline Illustration & Motto */}
        <div className="text-center pt-1 flex flex-col items-center justify-center">
          <CampusSkyline color="rgba(255, 255, 255, 0.8)" className="w-52 sm:w-60 h-6 mb-1" />
          <p className="text-xs font-medium text-white/95 italic tracking-wide drop-shadow-sm font-sans">
            "Education for a Better Tomorrow"
          </p>
        </div>
      </div>
    </div>
  );
};
