import React from 'react';
import { Calculator } from 'lucide-react';
import { StudentDashboardResponse } from '../../services/api';

interface StudentSessionalTabProps {
  data: StudentDashboardResponse;
  onNavigateToPrint: () => void;
}

export const StudentSessionalTab: React.FC<StudentSessionalTabProps> = ({ data, onNavigateToPrint }) => {
  const { student, stats, subjects } = data;

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Formula Explanation Banner */}
      <div className="bg-gradient-to-r from-[#0A2566] to-[#146EF5] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="bg-amber-400 text-[#0A2566] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Autonomous Grading Rule
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2 font-['Outfit'] tracking-tight">
            Final Sessional Marks Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
            As per S.R.K.R. Engineering College autonomous regulations:
            <br />
            • <span className="font-bold text-white">Theory Courses</span>: Evaluated via 80:20 rule (80% Higher Mid + 20% Lower Mid).
            <br />
            • <span className="font-bold text-amber-300">Laboratory Courses</span>: Evaluated via Single Internal Practical Exam (100% Direct Score).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center font-mono">
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">THEORY RULE</p>
            <p className="font-black text-white text-sm sm:text-base mt-0.5">
              (High × 0.8) + (Low × 0.2)
            </p>
          </div>
          <div className="bg-amber-400/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-amber-300/30 text-center font-mono">
            <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">LAB EVALUATION</p>
            <p className="font-black text-white text-sm sm:text-base mt-0.5">
              100% Direct Lab Score
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sessional Marks Computation Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-[#0A2566] uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#146EF5]" />
              Subject-Wise Sessional Evaluation Roster
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semester {student.semester} • {student.branch} • Registered: {student.registerNumber}
            </p>
          </div>

          <button
            onClick={onNavigateToPrint}
            className="self-start sm:self-auto px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0A2566] rounded-xl text-xs font-bold transition border border-blue-200 cursor-pointer"
          >
            Download Grade Sheet PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#0A2566] text-white font-bold">
              <tr>
                <th className="px-3 py-3 text-center w-12">S.No</th>
                <th className="px-3.5 py-3 w-28">Course Code</th>
                <th className="px-3.5 py-3 min-w-[200px]">Course Name</th>
                <th className="px-3 py-3 text-center w-24">Mid-1 (/30)</th>
                <th className="px-3 py-3 text-center w-24">Mid-2 (/30)</th>
                <th className="px-3 py-3 text-center w-28 bg-[#0E2F7D]">Higher Mid (80%)</th>
                <th className="px-3 py-3 text-center w-28 bg-[#123A99]">Lower Mid (20%)</th>
                <th className="px-3.5 py-3 text-center w-32 bg-[#146EF5] text-white font-black text-sm">
                  Final Sessional (/30)
                </th>
                <th className="px-3.5 py-3 text-center w-24">Result</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {subjects.map((sub, idx) => {
                const isPassed = sub.status === 'PASSED';
                const isPending = sub.status === 'INCOMPLETE';

                if (sub.isLab) {
                  return (
                    <tr key={sub.subjectId} className="hover:bg-blue-50/30 transition-colors bg-slate-50/40">
                      <td className="px-3 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-mono font-bold text-[#0A2566]">{sub.subjectCode}</td>
                      <td className="px-3.5 py-3 text-slate-800 font-semibold flex items-center gap-2">
                        <span>{sub.subjectName}</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">
                          LAB
                        </span>
                      </td>
                      <td colSpan={4} className="px-3 py-3 text-center text-slate-500 font-mono text-[11px] bg-slate-100/60">
                        <span className="font-semibold text-slate-700">🔬 Single Internal Practical Exam (Direct Evaluation)</span>
                      </td>
                      <td className="px-3.5 py-3 text-center font-mono font-black text-sm text-[#146EF5] bg-blue-50/60">
                        {sub.sessionalTotal !== null ? sub.sessionalTotal : '—'}
                      </td>
                      <td className="px-3.5 py-3 text-center">
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                            In Progress
                          </span>
                        ) : isPassed ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Cleared
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Improvement
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={sub.subjectId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-3.5 py-3 font-mono font-bold text-[#0A2566]">{sub.subjectCode}</td>
                    <td className="px-3.5 py-3 text-slate-800 font-semibold">{sub.subjectName}</td>
                    <td className="px-3 py-3 text-center font-mono">
                      {sub.mid1 ? sub.mid1.total : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center font-mono">
                      {sub.mid2 ? sub.mid2.total : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-center font-mono bg-slate-50 font-bold text-slate-700">
                      {sub.higherMid !== null ? sub.higherMid : '—'}
                    </td>
                    <td className="px-3 py-3 text-center font-mono bg-slate-50 font-bold text-slate-700">
                      {sub.lowerMid !== null ? sub.lowerMid : '—'}
                    </td>
                    <td className="px-3.5 py-3 text-center font-mono font-black text-sm text-[#146EF5] bg-blue-50/60">
                      {sub.sessionalTotal !== null ? sub.sessionalTotal : '—'}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          In Progress
                        </span>
                      ) : isPassed ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Cleared
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Summary Footer */}
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td colSpan={7} className="px-4 py-3 text-right text-slate-700 uppercase tracking-wider font-extrabold">
                  Overall Sessional Average (/30)
                </td>
                <td className="px-3.5 py-3 text-center font-mono font-black text-sm text-[#0A2566] bg-blue-100/70">
                  {stats.averageSessional}
                </td>
                <td className="px-3 py-3 text-center text-emerald-700 font-extrabold">
                  {stats.passedCount}/{stats.totalSubjects} Passed
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
