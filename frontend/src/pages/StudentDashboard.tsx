import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { User as AuthUserType } from '../types';
import { studentApi, StudentDashboardResponse } from '../services/api';
import { StudentHeader, StudentActiveTab } from '../components/student/StudentHeader';
import { StudentOverviewTab } from '../components/student/StudentOverviewTab';
import { StudentMidReportTab } from '../components/student/StudentMidReportTab';
import { StudentSessionalTab } from '../components/student/StudentSessionalTab';
import { StudentPrintGradeTab } from '../components/student/StudentPrintGradeTab';

interface StudentDashboardProps {
  user: AuthUserType;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<StudentActiveTab>('overview');
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError('Could not load student performance data. Please try again or verify network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F6FD] flex flex-col font-sans">
      {/* 1. Top Portal Header */}
      <StudentHeader
        user={user}
        studentData={data?.student}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-[#146EF5]" />
            <p className="text-sm font-bold text-[#0A2566]">Loading student academic records...</p>
            <p className="text-xs text-slate-500">Connecting to SRKR Examination Engine</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-red-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Academic Records Unavailable</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#146EF5] hover:bg-[#0D5EDB] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : data ? (
          <div className="animate-fade-in">
            {activeTab === 'overview' && (
              <StudentOverviewTab data={data} onNavigateTab={setActiveTab} />
            )}

            {activeTab === 'mid1' && (
              <StudentMidReportTab data={data} examType="MID_1" />
            )}

            {activeTab === 'mid2' && (
              <StudentMidReportTab data={data} examType="MID_2" />
            )}

            {activeTab === 'sessional' && (
              <StudentSessionalTab
                data={data}
                onNavigateToPrint={() => setActiveTab('print')}
              />
            )}

            {activeTab === 'print' && (
              <StudentPrintGradeTab data={data} />
            )}
          </div>
        ) : null}
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 font-medium print:hidden">
        <p>
          MID TRACK © {new Date().getFullYear()} S.R.K.R. Engineering College (Autonomous) • Internal Examination System
        </p>
      </footer>
    </div>
  );
};
