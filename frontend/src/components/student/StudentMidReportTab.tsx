import React from 'react';
import { FileText } from 'lucide-react';
import { StudentDashboardResponse } from '../../services/api';

interface StudentMidReportTabProps {
  data: StudentDashboardResponse;
  examType: 'MID_1' | 'MID_2';
}

export const StudentMidReportTab: React.FC<StudentMidReportTabProps> = ({ data, examType }) => {
  const { student, subjects } = data;
  const isMid1 = examType === 'MID_1';
  const examTitle = isMid1 ? 'Mid-1 Examination' : 'Mid-2 Examination';

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2566] to-[#146EF5] rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-400 text-[#0A2566] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Detailed Question Scorecard
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 font-['Outfit'] tracking-tight">
            {examTitle} Detailed Evaluation
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Complete question-level distribution across all registered subjects for{' '}
            <span className="font-bold text-white">{student.name} ({student.registerNumber})</span>.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center font-mono">
          <p className="text-blue-200 text-[10px] font-bold">EXAM PATTERN</p>
          <p className="text-white text-xs font-bold mt-0.5">Desc (15) + Obj (10) + Assign (5) = 30M</p>
        </div>
      </div>

      {/* 2. Subjects Table with Question Distribution */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0A2566] uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#146EF5]" />
            Subject-Wise Question Breakdown Table
          </h3>
          <span className="text-xs font-mono font-bold text-slate-400">Max Marks: 30</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#0A2566] text-white font-bold">
              <tr>
                <th rowSpan={2} className="px-3 py-3 text-center w-12 border-r border-blue-900">S.No</th>
                <th rowSpan={2} className="px-3.5 py-3 w-28 border-r border-blue-900">Course Code</th>
                <th rowSpan={2} className="px-3.5 py-3 min-w-[180px] border-r border-blue-900">Course Name</th>
                <th colSpan={4} className="px-3 py-2 text-center bg-[#0E2F7D] border-r border-blue-900">
                  Descriptive Part (15M)
                </th>
                <th colSpan={6} className="px-3 py-2 text-center bg-[#123A99] border-r border-blue-900">
                  Objective Part (10M)
                </th>
                <th rowSpan={2} className="px-3 py-3 text-center w-20 border-r border-blue-900">
                  Assign (5M)
                </th>
                <th rowSpan={2} className="px-3.5 py-3 text-center w-24 bg-[#146EF5] text-white font-black text-sm">
                  Total (/30)
                </th>
              </tr>
              <tr className="bg-slate-800 text-[10px] text-center font-bold">
                <th className="px-1.5 py-1.5 w-12 border-r border-slate-700">Q1/Q2 (5)</th>
                <th className="px-1.5 py-1.5 w-12 border-r border-slate-700">Q3/Q4 (5)</th>
                <th className="px-1.5 py-1.5 w-12 border-r border-slate-700">Q5/Q6 (5)</th>
                <th className="px-1.5 py-1.5 w-12 border-r border-blue-900 bg-slate-700">Sub (15)</th>

                <th className="px-1 py-1.5 w-8 border-r border-slate-700">O1 (2)</th>
                <th className="px-1 py-1.5 w-8 border-r border-slate-700">O2 (2)</th>
                <th className="px-1 py-1.5 w-8 border-r border-slate-700">O3 (2)</th>
                <th className="px-1 py-1.5 w-8 border-r border-slate-700">O4 (2)</th>
                <th className="px-1 py-1.5 w-8 border-r border-slate-700">O5 (2)</th>
                <th className="px-1.5 py-1.5 w-12 border-r border-blue-900 bg-slate-700">Sub (10)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {subjects.map((sub, idx) => {
                if (sub.isLab) {
                  return (
                    <tr key={sub.subjectId} className="hover:bg-blue-50/30 transition-colors bg-slate-50/40">
                      <td className="px-3 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-mono font-bold text-[#0A2566]">{sub.subjectCode}</td>
                      <td className="px-3.5 py-3 text-slate-800 font-semibold flex items-center gap-2">
                        <span>{sub.subjectName}</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">
                          LAB COURSE
                        </span>
                      </td>
                      <td colSpan={11} className="px-4 py-3 text-center text-slate-600 font-medium italic bg-slate-50">
                        🔬 Laboratory Practical Course — Evaluated via Single Internal Exam (Direct {sub.sessionalTotal !== null ? `${sub.sessionalTotal}/30M` : '30M'})
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-black text-sm text-[#146EF5] bg-blue-50/70">
                        {sub.sessionalTotal !== null ? sub.sessionalTotal : '—'}
                      </td>
                    </tr>
                  );
                }

                const markData = isMid1 ? sub.mid1 : sub.mid2;

                if (!markData) {
                  return (
                    <tr key={sub.subjectId} className="hover:bg-slate-50 text-slate-400">
                      <td className="px-3 py-3 text-center font-mono">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-700">{sub.subjectCode}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-700">{sub.subjectName}</td>
                      <td colSpan={12} className="px-4 py-3 text-center italic bg-slate-50/50">
                        {isMid1 ? 'Evaluation records pending verification' : 'Mid-2 Examination not yet conducted'}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={sub.subjectId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-3.5 py-3 font-mono font-bold text-[#0A2566]">{sub.subjectCode}</td>
                    <td className="px-3.5 py-3 text-slate-800 font-semibold">{sub.subjectName}</td>

                    {/* Descriptive */}
                    <td className="px-1.5 py-3 text-center font-mono">{markData.descriptiveQ1OrQ2 ?? '—'}</td>
                    <td className="px-1.5 py-3 text-center font-mono">{markData.descriptiveQ3OrQ4 ?? '—'}</td>
                    <td className="px-1.5 py-3 text-center font-mono">{markData.descriptiveQ5OrQ6 ?? '—'}</td>
                    <td className="px-1.5 py-3 text-center font-mono font-bold text-slate-800 bg-slate-50">
                      {markData.descriptiveTotal}
                    </td>

                    {/* Objective */}
                    <td className="px-1 py-3 text-center font-mono">{markData.objectiveQ1 ?? '—'}</td>
                    <td className="px-1 py-3 text-center font-mono">{markData.objectiveQ2 ?? '—'}</td>
                    <td className="px-1 py-3 text-center font-mono">{markData.objectiveQ3 ?? '—'}</td>
                    <td className="px-1 py-3 text-center font-mono">{markData.objectiveQ4 ?? '—'}</td>
                    <td className="px-1 py-3 text-center font-mono">{markData.objectiveQ5 ?? '—'}</td>
                    <td className="px-1.5 py-3 text-center font-mono font-bold text-slate-800 bg-slate-50">
                      {markData.objectiveTotal}
                    </td>

                    {/* Assignment */}
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-700">
                      {markData.assignmentMarks}
                    </td>

                    {/* Grand Total */}
                    <td className="px-3.5 py-3 text-center font-mono font-black text-sm text-[#146EF5] bg-blue-50/70">
                      {markData.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
