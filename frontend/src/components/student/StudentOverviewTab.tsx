import React, { useState } from 'react';
import { Award, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Sparkles, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { StudentSubjectReport, StudentDashboardResponse } from '../../services/api';
import { getSRKRClassSem } from '../../utils/marksWordHelper';

interface StudentOverviewTabProps {
  data: StudentDashboardResponse;
  onNavigateTab: (tab: 'mid1' | 'mid2' | 'sessional' | 'print') => void;
}

export const StudentOverviewTab: React.FC<StudentOverviewTabProps> = ({ data, onNavigateTab }) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const { student, stats, subjects } = data;
  const classSemString = getSRKRClassSem(student.semester);

  const toggleExpand = (id: string) => {
    setExpandedSubjectId(expandedSubjectId === id ? null : id);
  };

  const getPerformanceBadge = (marks: number | null) => {
    if (marks === null) return { text: 'In Progress', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (marks >= 25) return { text: 'Outstanding (A+)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (marks >= 20) return { text: 'Excellent (A)', bg: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (marks >= 15) return { text: 'Good (B)', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (marks >= 12) return { text: 'Satisfactory (C)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: 'Needs Improvement', bg: 'bg-red-100 text-red-800 border-red-300' };
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A2566] via-[#0E2F7D] to-[#146EF5] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Award className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>SRKR Autonomous Academic Evaluation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Outfit']">
            Welcome back, {student.name}
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            Registered: <span className="font-mono font-bold text-white">{student.registerNumber}</span> • Branch:{' '}
            <span className="font-bold text-white">{student.branch}</span> • Section:{' '}
            <span className="font-bold text-white">{student.section}</span> • Standing:{' '}
            <span className="font-bold text-amber-300">{classSemString} ({student.academicYear})</span>
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigateTab('sessional')}
              className="px-4 py-2 bg-white text-[#0A2566] rounded-xl text-xs font-bold hover:bg-blue-50 transition shadow-sm cursor-pointer"
            >
              View 80:20 Sessionals
            </button>
            <button
              onClick={() => onNavigateTab('print')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/20 cursor-pointer"
            >
              Download Official Grade Sheet
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Academic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sessional Aggregate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Sessional Aggregate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#146EF5] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-[#0A2566] font-mono">
                {stats.averageSessional}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 30.0</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#146EF5] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.averageSessional / 30) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Total Subjects */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Courses
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-[#0A2566] font-mono">
              {stats.totalSubjects}
            </span>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              {stats.evaluatedSubjects} evaluated so far
            </p>
          </div>
        </div>

        {/* Card 3: Pass Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Subjects Cleared
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                {stats.passedCount}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {stats.totalSubjects}</span>
            </div>
            <p className="text-xs text-emerald-700 font-bold mt-1">
              {stats.passedCount === stats.totalSubjects ? '100% Passing Track' : 'Passing Threshold Met'}
            </p>
          </div>
        </div>

        {/* Card 4: Best Subject */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Top Subject
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm font-black text-[#0A2566] truncate">
              {stats.bestSubject ? stats.bestSubject.code : '—'}
            </p>
            <p className="text-xs font-mono font-bold text-slate-600 truncate mt-0.5">
              {stats.bestSubject ? `${stats.bestSubject.marks} / 30 Marks` : 'Evaluating...'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Enrolled Courses & Detailed Grade Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#0A2566] font-['Outfit'] tracking-tight">
              Enrolled Courses & Grade Cards
            </h2>
            <p className="text-xs text-slate-500">
              Click any course to view complete question-level breakdown for Descriptive, Objective, and Continuous Evaluation.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono hidden sm:inline">
            Sem-{student.semester}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subjects.map((sub: StudentSubjectReport) => {
            const isExpanded = expandedSubjectId === sub.subjectId;
            const badge = getPerformanceBadge(sub.sessionalTotal);

            return (
              <div
                key={sub.subjectId}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 hover:border-blue-300"
              >
                {/* Course Header Row */}
                <div
                  onClick={() => toggleExpand(sub.subjectId)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/60 text-[#146EF5] font-black text-xs flex items-center justify-center font-mono shrink-0">
                      {sub.subjectCode}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-[#0A2566]">
                          {sub.subjectName}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Course Code: <span className="font-mono font-bold text-slate-700">{sub.subjectCode}</span> • Branch: {sub.branch}
                      </p>
                    </div>
                  </div>

                  {/* Summary Scores Pill */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {sub.isLab ? (
                      <div className="grid grid-cols-2 gap-3 text-center">
                        {/* Lab Internal */}
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Lab Internal</p>
                          <p className="text-xs font-mono font-bold text-slate-800">
                            {sub.sessionalTotal !== null ? `${sub.sessionalTotal} / 30` : '—'}
                          </p>
                        </div>

                        {/* Direct Sessional */}
                        <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                          <p className="text-[10px] font-bold text-[#146EF5] uppercase">Sessional</p>
                          <p className="text-sm font-mono font-black text-[#0A2566]">
                            {sub.sessionalTotal !== null ? sub.sessionalTotal : '—'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        {/* Mid-1 */}
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Mid-1</p>
                          <p className="text-xs font-mono font-bold text-slate-800">
                            {sub.mid1 ? sub.mid1.total : '—'}
                          </p>
                        </div>

                        {/* Mid-2 */}
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Mid-2</p>
                          <p className="text-xs font-mono font-bold text-slate-800">
                            {sub.mid2 ? sub.mid2.total : '—'}
                          </p>
                        </div>

                        {/* Sessional (80:20) */}
                        <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                          <p className="text-[10px] font-bold text-[#146EF5] uppercase">Sessional</p>
                          <p className="text-sm font-mono font-black text-[#0A2566]">
                            {sub.sessionalTotal !== null ? sub.sessionalTotal : '—'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expandable Question-Level Breakdown */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 animate-fade-in">
                    {sub.isLab ? (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#0A2566] uppercase tracking-wider">
                              LABORATORY INTERNAL PRACTICAL EVALUATION
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-[#0A2566] text-[10px] font-bold rounded">
                              Direct Evaluation (No 80:20 Rule)
                            </span>
                          </div>
                          <span className="text-xs font-mono font-black text-[#146EF5] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            Score: {sub.sessionalTotal !== null ? `${sub.sessionalTotal} / 30 Marks` : 'Evaluating'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Day-to-Day Practical & Record</p>
                            <p className="text-sm font-black text-slate-800 mt-1 font-mono">Continuous Assessment</p>
                            <p className="text-[11px] text-slate-500 mt-1">Verified experiment record submission & lab attendance.</p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Internal Lab Examination</p>
                            <p className="text-sm font-black text-slate-800 mt-1 font-mono">Single Internal Exam (30M)</p>
                            <p className="text-[11px] text-slate-500 mt-1">Practical execution, algorithm demonstration & viva-voce.</p>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                            <p className="text-[10px] font-bold text-[#146EF5] uppercase">Final Sessional Mark</p>
                            <p className="text-base font-black text-[#0A2566] mt-1 font-mono">
                              {sub.sessionalTotal !== null ? `${sub.sessionalTotal} / 30` : '—'}
                            </p>
                            <p className="text-[11px] text-blue-800 font-bold mt-1">100% Direct Lab Internal Score</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xs font-black text-[#0A2566] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-[#146EF5]" />
                          Question-Wise Evaluation Breakdown
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Mid-1 Breakdown Card */}
                          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                              <span className="text-xs font-black text-[#0A2566]">MID-1 EXAMINATION</span>
                              <span className="text-xs font-mono font-black text-[#146EF5] bg-blue-50 px-2 py-0.5 rounded-md">
                                Total: {sub.mid1 ? `${sub.mid1.total} / 30` : 'Not Evaluated'}
                              </span>
                            </div>

                            {sub.mid1 ? (
                              <div className="space-y-3 text-xs">
                                {/* Descriptive */}
                                <div>
                                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                                    <span>Part A: Descriptive (Max 15M)</span>
                                    <span className="font-mono">{sub.mid1.descriptiveTotal} / 15</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono">
                                      Q1/Q2: <span className="font-bold">{sub.mid1.descriptiveQ1OrQ2 ?? '—'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono">
                                      Q3/Q4: <span className="font-bold">{sub.mid1.descriptiveQ3OrQ4 ?? '—'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono">
                                      Q5/Q6: <span className="font-bold">{sub.mid1.descriptiveQ5OrQ6 ?? '—'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Objective */}
                                <div>
                                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                                    <span>Part B: Objective (Max 10M)</span>
                                    <span className="font-mono">{sub.mid1.objectiveTotal} / 10</span>
                                  </div>
                                  <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O1: <b>{sub.mid1.objectiveQ1 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O2: <b>{sub.mid1.objectiveQ2 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O3: <b>{sub.mid1.objectiveQ3 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O4: <b>{sub.mid1.objectiveQ4 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O5: <b>{sub.mid1.objectiveQ5 ?? 0}</b>
                                    </div>
                                  </div>
                                </div>

                                {/* Assignment */}
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                                  <span className="font-bold text-slate-700">Continuous Assignment (Max 5M)</span>
                                  <span className="font-mono font-bold text-slate-900">{sub.mid1.assignmentMarks} / 5</span>
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center text-slate-400 text-xs">
                                <AlertCircle className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                Mid-1 evaluation records will appear once verified by faculty.
                              </div>
                            )}
                          </div>

                          {/* Mid-2 Breakdown Card */}
                          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                              <span className="text-xs font-black text-[#0A2566]">MID-2 EXAMINATION</span>
                              <span className="text-xs font-mono font-black text-[#146EF5] bg-blue-50 px-2 py-0.5 rounded-md">
                                Total: {sub.mid2 ? `${sub.mid2.total} / 30` : 'Upcoming / Not Evaluated'}
                              </span>
                            </div>

                            {sub.mid2 ? (
                              <div className="space-y-3 text-xs">
                                {/* Descriptive */}
                                <div>
                                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                                    <span>Part A: Descriptive (Max 15M)</span>
                                    <span className="font-mono">{sub.mid2.descriptiveTotal} / 15</span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono">
                                      Q1/Q2: <span className="font-bold">{sub.mid2.descriptiveQ1OrQ2 ?? '—'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono">
                                      Q3/Q4: <span className="font-bold">{sub.mid2.descriptiveQ3OrQ4 ?? '—'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 font-mono">
                                      Q5/Q6: <span className="font-bold">{sub.mid2.descriptiveQ5OrQ6 ?? '—'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Objective */}
                                <div>
                                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                                    <span>Part B: Objective (Max 10M)</span>
                                    <span className="font-mono">{sub.mid2.objectiveTotal} / 10</span>
                                  </div>
                                  <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O1: <b>{sub.mid2.objectiveQ1 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O2: <b>{sub.mid2.objectiveQ2 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O3: <b>{sub.mid2.objectiveQ3 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O4: <b>{sub.mid2.objectiveQ4 ?? 0}</b>
                                    </div>
                                    <div className="bg-slate-50 p-1 rounded border font-mono">
                                      O5: <b>{sub.mid2.objectiveQ5 ?? 0}</b>
                                    </div>
                                  </div>
                                </div>

                                {/* Assignment */}
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                                  <span className="font-bold text-slate-700">Continuous Assignment (Max 5M)</span>
                                  <span className="font-mono font-bold text-slate-900">{sub.mid2.assignmentMarks} / 5</span>
                                </div>
                              </div>
                            ) : (
                              <div className="py-6 text-center text-slate-400 text-xs">
                                <AlertCircle className="w-5 h-5 mx-auto mb-1 opacity-50 text-amber-500" />
                                Mid-2 evaluation scheduled as per SRKR academic calendar.
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
