import React, { useState, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { UserRole, User } from '../types';
import { MidTrackLogo } from '../components/auth/MidTrackLogo';
import { RoleSelector } from '../components/auth/RoleSelector';
import { FacultyLoginForm } from '../components/auth/FacultyLoginForm';
import { StudentLoginForm } from '../components/auth/StudentLoginForm';
import { AuthenticatedPlaceholder } from '../components/auth/AuthenticatedPlaceholder';
import { FeaturesShowcase } from '../components/landing/FeaturesShowcase';

interface LoginProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const Login: React.FC<LoginProps> = ({ currentUser, onLoginSuccess, onLogout }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('FACULTY');
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToTop = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectRoleAndFocus = (role: UserRole) => {
    setSelectedRole(role);
    handleScrollToTop();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#146EF5] selection:text-white overflow-x-hidden flex flex-col">
      {/* ========================================================================= */}
      {/* 1. HERO VIEWPORT: CLEAN INSTITUTIONAL BACKGROUND WITH CENTERED BRANDING */}
      {/* ========================================================================= */}
      <div
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8 bg-[#F8FAFC]"
      >
        {/* Subtle decorative ambient backdrop for depth (No photo) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-blue-100/40 via-slate-100/20 to-transparent pointer-events-none -z-10 blur-2xl" />

        {/* Top Institution Header: Centered in the Middle, Directly on Background (Not in white box) */}
        <header className="relative z-20 w-full max-w-4xl flex flex-col items-center justify-center text-center pt-2 sm:pt-4">
          {/* Quick Features Jump Link for Desktop (Subtle top right) */}
          <div className="w-full flex justify-end mb-1">
            <button
              onClick={handleScrollToFeatures}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-[#0A2566] text-xs font-bold transition border border-slate-200/90 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Website Features</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Centered College Branding appearing directly in the background */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <img
              src="/assets/srkr-emblem.png"
              alt="SRKR Seal"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-2 sm:mb-2.5 drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
              }}
            />
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-[25px] font-black text-[#0A2566] tracking-tight uppercase font-serif leading-tight">
              S.R.K.R. ENGINEERING COLLEGE (A)
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wider mt-1">
              AUTONOMOUS • CHINNA AMIRAM, BHIMAVARAM - 534204
            </p>
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap text-[10px] sm:text-[11px] font-bold text-slate-500">
              <span className="text-[#146EF5]">AFFILIATED TO JNTUK</span>
              <span>•</span>
              <span>ACCREDITED BY NAAC WITH 'A+' GRADE</span>
              <span>•</span>
              <span className="text-amber-700">ESTD 1980</span>
            </div>
          </div>
        </header>

        {/* CENTER FLOATING LOGIN CARD */}
        <div className="relative z-20 w-full max-w-[430px] my-auto py-3 sm:py-5">
          {currentUser ? (
            /* Post-Login Authenticated State */
            <AuthenticatedPlaceholder user={currentUser} onLogout={onLogout} />
          ) : (
            /* Master Floating Login Card */
            <div className="w-full bg-white rounded-2xl sm:rounded-[32px] shadow-xl shadow-slate-200/80 border border-slate-200/90 p-5 sm:p-8 text-center transition-all duration-300 animate-fade-in">
              {/* Top MID TRACK Logo (Ascending 3 Bars + Typography + Subtitle) */}
              <MidTrackLogo />

              {/* Pill Role Selector [ Faculty ] [ Student ] */}
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={(role) => setSelectedRole(role)}
              />

              {/* Dynamic Login Form */}
              <div className="mt-1 sm:mt-2">
                {selectedRole === 'FACULTY' ? (
                  <FacultyLoginForm onSuccess={onLoginSuccess} />
                ) : (
                  <StudentLoginForm onSuccess={onLoginSuccess} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Scroll Indicator */}
        <div className="relative z-20 pt-2 pb-2 text-center select-none flex flex-col items-center justify-center">
          <button
            onClick={handleScrollToFeatures}
            className="group inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#0A2566] text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-md border border-slate-200/90 cursor-pointer animate-bounce hover:animate-none"
          >
            <span>Explore MidTrack Features</span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#146EF5] group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DOWN OF LOGIN PAGE: COMPREHENSIVE MIDTRACK SYSTEM FEATURES SHOWCASE */}
      {/* ========================================================================= */}
      <div ref={featuresRef} className="w-full">
        <FeaturesShowcase
          onScrollToTop={handleScrollToTop}
          onSelectRoleAndFocus={handleSelectRoleAndFocus}
        />
      </div>
    </div>
  );
};
