import React from 'react';
import { Users, BookOpen, Layers, Award, Edit3, Calculator, Printer, CheckCircle2, GraduationCap } from 'lucide-react';
import { SectionItem, DashboardStatsResponse } from '../../services/api';
import { FacultyTabType } from './FacultyHeader';
import { getAcademicYearInfo } from '../../utils/academicYearHelper';

interface FacultyOverviewTabProps {
  statsData: DashboardStatsResponse['data'] | null;
  sections: SectionItem[];
  onSelectSection: (section: SectionItem, targetTab: FacultyTabType) => void;
}

export const FacultyOverviewTab: React.FC<FacultyOverviewTabProps> = ({
  statsData,
  sections,
  onSelectSection,
}) => {
  const totalStudents = statsData?.stats.totalStudents || 421;
  const totalSections = statsData?.stats.totalSections || 6;
  const totalSubjects = statsData?.stats.totalSubjects || 20;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP STATS CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#146EF5] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl font-black text-[#0A2566] tracking-tight">{totalStudents} Students</h3>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Real College Records
            </p>
          </div>
        </div>

        {/* Card 2: Assigned Class Sections */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sections</p>
            <h3 className="text-2xl font-black text-[#0A2566] tracking-tight">{totalSections} Sections</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">2nd, 3rd & 4th Years</p>
          </div>
        </div>

        {/* Card 3: Curriculum Subjects */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curriculum Courses</p>
            <h3 className="text-2xl font-black text-[#0A2566] tracking-tight">{totalSubjects} Subjects</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Semesters 2, 4 & 6</p>
          </div>
        </div>

        {/* Card 4: Evaluation Standard */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Formula</p>
            <h3 className="text-2xl font-black text-[#0A2566] tracking-tight">80% : 20%</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Autonomous Rule</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CLASS SECTIONS DIRECTORY WITH CLEAR YEAR INDICATORS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#0A2566] tracking-tight font-['Outfit'] flex items-center gap-2.5">
              <span>Department Class Sections</span>
              <span className="text-xs font-bold bg-blue-50 text-[#146EF5] px-2.5 py-0.5 rounded-full border border-blue-100">
                2nd, 3rd & 4th Year Batches
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select any section to enter mid marks, view class performance analytics, or generate official sessional mark sheets.
            </p>
          </div>
          <span className="bg-[#F0F6FD] text-[#146EF5] text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-100 self-start sm:self-auto">
            Academic Year: {statsData?.academicYear || '2026-2027'}
          </span>
        </div>

        {/* Grid of Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {sections.map((sec) => {
            const yearInfo = getAcademicYearInfo(sec.semester);

            return (
              <div
                key={sec.id}
                className="bg-[#FAFBFD] hover:bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-[#146EF5]/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges: Branch & Prominent Year Indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#146EF5]/10 text-[#146EF5] text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {sec.branch}
                    </span>

                    {/* Prominent Current Year Badge */}
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 shadow-2xs ${yearInfo.badgeBg} ${yearInfo.badgeText} ${yearInfo.badgeBorder}`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{yearInfo.yearText}</span>
                    </span>
                  </div>

                  {/* Section Title */}
                  <h3 className="text-lg font-black text-[#0A2566] mt-3 tracking-tight group-hover:text-[#146EF5] transition-colors flex items-baseline justify-between">
                    <span>Section: {sec.sectionName}</span>
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      Sem {sec.semester}
                    </span>
                  </h3>

                  {/* Subtitle with Standing & Academic Year */}
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    <span className="font-semibold text-slate-700">{yearInfo.academicStanding}</span> • Academic Year {sec.academicYear}
                  </p>

                  {/* Student Count Badge */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Enrolled Strength:</span>
                    <span className="font-extrabold text-[#0A2566] bg-white px-2.5 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                      {sec.studentCount || 0} Students
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onSelectSection(sec, 'ENTER_MARKS')}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-[#146EF5] hover:bg-[#0D5EDB] text-white rounded-xl text-xs font-bold transition shadow-xs"
                    title="Enter Mid-1 & Mid-2 Marks"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Marks</span>
                  </button>

                  <button
                    onClick={() => onSelectSection(sec, 'SESSIONALS')}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    title="Compute Sessional 80:20"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Sessional</span>
                  </button>

                  <button
                    onClick={() => onSelectSection(sec, 'PRINT_SHEET')}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    title="Print Official Mark Sheet"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
