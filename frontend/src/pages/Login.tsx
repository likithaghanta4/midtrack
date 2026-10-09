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
      {/* 1. HERO VIEWPORT: BEAUTIFUL SUNNY CAMPUS BACKGROUND WITH CENTERED LOGIN CARD */}
      {/* ========================================================================= */}
      <div
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8"
      >
        {/* Fullscreen Campus Photo with Soft Bokeh Depth */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-[1.01]"
          style={{
            backgroundImage: "url('/assets/srkr-campus-hero.jpg')",
          }}
        />

        {/* Soft atmospheric gradient layer for contrast and elegance */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/50 backdrop-blur-[1px] pointer-events-none" />

        {/* Soft bottom edge transition blending seamlessly into light features section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/60 to-transparent pointer-events-none z-10" />

        {/* Top Floating Institution Badge */}
        <header className="relative z-20 w-full max-w-5xl flex items-center justify-between pt-1 mb-2 sm:mb-0">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md py-1 sm:py-1.5 px-3 sm:px-4 rounded-full shadow-lg border border-white/90">
            <img
              src="/assets/srkr-emblem.png"
              alt="SRKR Seal"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
              }}
            />
            <div className="text-left">
              <p className="text-[10px] sm:text-xs font-black text-[#0A2566] tracking-tight uppercase font-serif leading-none">
                S.R.K.R. ENGINEERING COLLEGE (A)
              </p>
              <p className="text-[8px] sm:text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                AUTONOMOUS • CHINNA AMIRAM, BHIMAVARAM
              </p>
            </div>
          </div>

          {/* Quick Features Jump Link */}
          <button
            onClick={handleScrollToFeatures}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-bold transition border border-white/20 shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Website Features</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* CENTER FLOATING LOGIN CARD (Matching User Reference Image) */}
        <div className="relative z-20 w-full max-w-[430px] my-auto py-2 sm:py-4">
          {currentUser ? (
            /* Post-Login Authenticated State */
            <AuthenticatedPlaceholder user={currentUser} onLogout={onLogout} />
          ) : (
            /* Master Floating Login Card */
            <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[32px] shadow-2xl shadow-black/30 border border-white p-5 sm:p-8 text-center transition-all duration-300 animate-fade-in">
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
            className="group inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/95 hover:bg-white text-[#0A2566] text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-lg border border-white/90 cursor-pointer animate-bounce hover:animate-none"
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
