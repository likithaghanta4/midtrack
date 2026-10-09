import React, { useState, useEffect } from 'react';
import { User as AuthUserType } from '../types';
import { SectionItem, DashboardStatsResponse, facultyApi } from '../services/api';
import { FacultyHeader, FacultyTabType } from '../components/faculty/FacultyHeader';
import { FacultyOverviewTab } from '../components/faculty/FacultyOverviewTab';
import { MarksEntryTab } from '../components/faculty/MarksEntryTab';
import { MarksAnalyticsTab } from '../components/faculty/MarksAnalyticsTab';
import { SessionalMarksTab } from '../components/faculty/SessionalMarksTab';
import { PrintMarkSheetTab } from '../components/faculty/PrintMarkSheetTab';
import { Loader2 } from 'lucide-react';

interface FacultyDashboardProps {
  user: AuthUserType;
  onLogout: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<FacultyTabType>('OVERVIEW');
  const [statsData, setStatsData] = useState<DashboardStatsResponse['data'] | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Dashboard Data & Sections
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [statsRes, secRes] = await Promise.all([
          facultyApi.getDashboardStats(),
          facultyApi.getSections(),
        ]);

        if (isMounted) {
          setStatsData(statsRes.data);
          setSections(secRes.sections);
          if (secRes.sections.length > 0) {
            setSelectedSection(secRes.sections[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load faculty initial data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSectionFromOverview = (sec: SectionItem, targetTab: FacultyTabType) => {
    setSelectedSection(sec);
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-[#F0F6FD] text-slate-800 flex flex-col font-sans">
      {/* 1. Master Sticky Header */}
      <FacultyHeader
        user={user}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={onLogout}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#146EF5]" />
            <p className="text-sm font-bold text-[#0A2566]">
              Loading S.R.K.R. Faculty Portal...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'OVERVIEW' && (
              <FacultyOverviewTab
                statsData={statsData}
                sections={sections}
                onSelectSection={handleSelectSectionFromOverview}
              />
            )}

            {activeTab === 'ENTER_MARKS' && (
              <MarksEntryTab
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={(sec) => setSelectedSection(sec)}
              />
            )}

            {activeTab === 'ANALYTICS' && (
              <MarksAnalyticsTab
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={(sec) => setSelectedSection(sec)}
              />
            )}

            {activeTab === 'SESSIONALS' && (
              <SessionalMarksTab
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={(sec) => setSelectedSection(sec)}
                onNavigateToPrint={() => setActiveTab('PRINT_SHEET')}
              />
            )}

            {activeTab === 'PRINT_SHEET' && (
              <PrintMarkSheetTab
                user={user}
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={(sec) => setSelectedSection(sec)}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Footer (Hidden on Print) */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 print:hidden select-none">
        <p className="font-semibold text-slate-600">
          S.R.K.R. Engineering College (Autonomous) • Mid Marks Management System
        </p>
        <p className="text-[11px] text-slate-400 italic mt-0.5">
          "Education for a Better Tomorrow"
        </p>
      </footer>
    </div>
  );
};
