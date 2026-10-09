import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { authApi, FacultyListItem } from '../../services/api';
import { User as AuthUserType } from '../../types';

interface FacultyLoginFormProps {
  onSuccess: (user: AuthUserType) => void;
}

export const FacultyLoginForm: React.FC<FacultyLoginFormProps> = ({ onSuccess }) => {
  const [facultyList, setFacultyList] = useState<FacultyListItem[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadFaculty = async () => {
      try {
        setLoadingList(true);
        const res = await authApi.getFacultyList();
        if (isMounted) {
          setFacultyList(res.faculty);
        }
      } catch (err) {
        console.error('Failed to load faculty list:', err);
        if (isMounted) {
          setErrorMsg('Failed to load faculty list from server.');
        }
      } finally {
        if (isMounted) {
          setLoadingList(false);
        }
      }
    };
    loadFaculty();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedFacultyId) {
      setErrorMsg('Please select a faculty member.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authApi.facultyLogin(selectedFacultyId, password);
      if (res.user) {
        onSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid faculty credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 w-full text-left">
      {/* Error Alert */}
      {errorMsg && (
        <div
          role="alert"
          className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Faculty Name Select Field */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-slate-700">
          <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
        </div>
        <select
          id="faculty-select"
          value={selectedFacultyId}
          onChange={(e) => {
            setSelectedFacultyId(e.target.value);
            setErrorMsg(null);
          }}
          disabled={loadingList || isSubmitting}
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-11 py-2.5 sm:py-3.5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#146EF5] focus:ring-2 focus:ring-blue-100 transition shadow-2xs appearance-none cursor-pointer disabled:bg-slate-50 font-medium"
        >
          <option value="" disabled>
            {loadingList ? 'Loading faculty list...' : 'Select Faculty Name'}
          </option>
          {facultyList.map((fac) => (
            <option key={fac.facultyId} value={fac.facultyId}>
              {fac.name} {fac.department ? `(${fac.department})` : ''}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 sm:right-4 pointer-events-none text-slate-700">
          {loadingList ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <ChevronDown className="w-4 h-4 stroke-[2]" />
          )}
        </div>
      </div>

      {/* Password Field with Eye Toggle */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-slate-700">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
        </div>
        <input
          id="faculty-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMsg(null);
          }}
          placeholder="Enter Password"
          disabled={isSubmitting}
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-11 py-2.5 sm:py-3.5 bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#146EF5] focus:ring-2 focus:ring-blue-100 transition shadow-2xs disabled:bg-slate-50 font-medium"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 sm:right-4 text-slate-700 hover:text-slate-900 focus:outline-none p-1 transition cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <Eye className="w-4 h-4 stroke-[2]" /> : <EyeOff className="w-4 h-4 stroke-[2]" />}
        </button>
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between pt-0.5 text-xs">
        <label className="flex items-center gap-1.5 sm:gap-2 text-slate-700 cursor-pointer select-none font-medium text-[11px] sm:text-xs">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#146EF5] border-slate-300 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span>Remember me</span>
        </label>
        <span className="text-[#146EF5] font-semibold hover:underline cursor-pointer text-[11px] sm:text-xs">
          Forgot Password?
        </span>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        id="faculty-login-btn"
        disabled={isSubmitting || loadingList}
        className="w-full mt-2.5 sm:mt-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#146EF5] hover:bg-[#0F5ED0] active:scale-[0.99] text-white font-bold text-xs sm:text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <span>Login</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </>
        )}
      </button>
    </form>
  );
};
