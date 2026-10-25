import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, ChevronDown, Loader2, CheckCircle2, FlaskConical, BookOpen, Globe } from 'lucide-react';
import { SectionItem, SubjectItem, SessionalRecord, facultyApi } from '../../services/api';
import { formatSectionLabel, getSemestersForSection } from '../../utils/academicYearHelper';
import { isLabCourse, isOpenElectiveCourse } from '../../utils/r23Curriculum';
import { downloadSessionalCSV } from '../../utils/pdfExportHelper';

interface SessionalMarksTabProps {
  sections: SectionItem[];
  selectedSection: SectionItem | null;
  onSelectSection: (sec: SectionItem) => void;
  onNavigateToPrint: () => void;
}

export const SessionalMarksTab: React.FC<SessionalMarksTabProps> = ({
  sections,
  selectedSection,
  onSelectSection,
  onNavigateToPrint,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(
    selectedSection?.semester || 3
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionals, setSessionals] = useState<SessionalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Sync selectedSemester when selectedSection changes
  useEffect(() => {
    if (selectedSection) {
      setSelectedSemester(selectedSection.semester);
    }
  }, [selectedSection]);

  // Current Subject & Lab/OE check
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const isLab = currentSubject ? isLabCourse(currentSubject.subjectCode, currentSubject.subjectName) : false;
  const isOE = currentSubject ? (isOpenElectiveCourse(currentSubject.subjectCode, currentSubject.subjectName) || currentSubject.isOpenElective || false) : false;

  // Load isolated subjects for section and semester
  useEffect(() => {
    if (!selectedSection) return;

    let isMounted = true;
    const loadSubjects = async () => {
      try {
        const res = await facultyApi.getSubjects(selectedSection.branch, selectedSemester);
        if (isMounted) {
          setSubjects(res.subjects);
          if (res.subjects.length > 0) {
            setSelectedSubjectId(res.subjects[0].id);
          } else {
            setSelectedSubjectId('');
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSemester]);

  // Load sessionals
  useEffect(() => {
    if (!selectedSection || !selectedSubjectId) {
      setSessionals([]);
      return;
    }

    let isMounted = true;
    const loadSessionals = async () => {
      try {
        setLoading(true);
        const res = await facultyApi.getSessionalMarks(selectedSection.id, selectedSubjectId);
        if (isMounted) setSessionals(res.sessionals);
      } catch (err) {
        console.error('Failed to compute sessionals:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSessionals();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSubjectId]);

  // Export Excel / CSV spreadsheet with Native Windows File Dialog
  const handleExportCSV = async () => {
    if (!selectedSection || sessionals.length === 0) return;
    const code = currentSubject?.subjectCode || 'Course';
    const fileName = `SRKR_Sessional_${selectedSection.branch}_${selectedSection.sectionName}_${code}.csv`;

    await downloadSessionalCSV(sessionals, fileName, {
      sectionName: selectedSection.sectionName,
      subjectName: currentSubject?.subjectName,
      subjectCode: currentSubject?.subjectCode,
      academicYear: selectedSection.academicYear,
    });

    setDownloadSuccess(`Downloaded "${fileName}" spreadsheet successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Formula Explanation Banner */}
      <div
        className={`text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isLab
            ? 'bg-gradient-to-r from-[#1B1464] via-[#2E1065] to-[#7C3AED]'
            : isOE
            ? 'bg-gradient-to-r from-[#0A2566] via-[#1E3A8A] to-[#D97706]'
            : 'bg-gradient-to-r from-[#0A2566] to-[#146EF5]'
        }`}
      >
        <div>
          <span className="bg-amber-400 text-[#0A2566] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {isLab ? 'Laboratory Evaluation Rule' : isOE ? 'Open Elective Evaluation Scheme' : 'Autonomous Academic Rule'}
          </span>
          <h2 className="text-xl font-black mt-2 font-['Outfit'] tracking-tight flex items-center gap-2">
            {isLab ? (
              <FlaskConical className="w-5 h-5 text-purple-300" />
            ) : isOE ? (
              <Globe className="w-5 h-5 text-amber-300" />
            ) : (
              <BookOpen className="w-5 h-5 text-blue-300" />
            )}
            {isLab
              ? 'Laboratory Single Internal Marks Engine'
              : isOE
              ? 'Open Elective (OE) Sessional Marks Engine'
              : 'Final Sessional Calculation Engine (80:20)'}
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            {isLab ? (
              <>
                For Laboratory / Practical courses, internal marks (Max 30) are based directly on the
                <span className="font-bold text-white ml-1">Single Internal Examination score (No 80:20 calculation needed)</span>.
              </>
            ) : isOE ? (
              <>
                For Open Elective (OE) courses, sessional marks can be entered directly as
                <span className="font-bold text-white ml-1">Total Sessional Marks</span>, or computed dynamically via the
                <span className="font-bold text-white ml-1">80:20 formula</span> if Mid-1 & Mid-2 are both entered.
              </>
            ) : (
              <>
                Sessional Marks (Max 30) are computed dynamically using the weighted formula:
                <span className="font-bold text-white ml-1">
                  (Higher Mid × 80%) + (Lower Mid × 20%)
                </span>.
              </>
            )}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center font-mono text-xs">
          <p className="text-blue-200 text-[10px] font-bold">
            {isLab ? 'DIRECT EVALUATION' : isOE ? 'OE EVALUATION SCHEME' : 'WEIGHTED FORMULA'}
          </p>
          <p className="font-black text-white text-sm mt-0.5">
            {isLab ? 'S = Lab Internal (100%)' : isOE ? 'S = Direct Total or (M_H×0.8 + M_L×0.2)' : 'S = (M_High × 0.8) + (M_Low × 0.2)'}
          </p>
        </div>
      </div>

      {/* 2. Selectors & Actions Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          {/* 1. Section Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0A2566] uppercase tracking-wider mb-1.5">
              1. Select Section
            </label>
            <div className="relative">
              <select
                value={selectedSection?.id || ''}
                onChange={(e) => {
                  const found = sections.find((s) => s.id === e.target.value);
                  if (found) onSelectSection(found);
                }}
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatSectionLabel(s)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. Semester Filter */}
          <div>
            <label className="block text-xs font-bold text-[#0A2566] uppercase tracking-wider mb-1.5">
              2. Semester
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {selectedSection &&
                  getSemestersForSection(selectedSection.semester).map((opt) => (
                    <option key={opt.semesterNumber} value={opt.semesterNumber}>
                      {opt.label}
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 3. Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0A2566] uppercase tracking-wider mb-1.5">
              3. Select Subject
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {isLabCourse(sub.subjectCode, sub.subjectName)
                      ? '🔬 [LAB] '
                      : isOpenElectiveCourse(sub.subjectCode, sub.subjectName)
                      ? '🌐 [OE] '
                      : '📖 '}
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons: Download PDF / Excel & View Print Sheet */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
          {/* Download CSV / Excel */}
          <button
            onClick={handleExportCSV}
            disabled={loading || sessionals.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition duration-150 cursor-pointer disabled:opacity-50"
            title="Download formatted CSV/Excel spreadsheet to share"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>

          {/* Download / Open Official PDF Print Sheet */}
          <button
            onClick={onNavigateToPrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 bg-[#146EF5] hover:bg-[#0D5EDB] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition duration-150 cursor-pointer"
            title="Download or Print the Official SRKR Statement PDF"
          >
            <Download className="w-4 h-4" />
            <span>Save / Download PDF</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess} Ready to share via email or messaging apps.</span>
        </div>
      )}

      {/* 3. Sessional Marks Computation Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#146EF5]" />
            <p className="text-sm font-semibold">
              {isLab ? 'Loading single internal laboratory marks...' : 'Computing 80:20 weighted sessionals...'}
            </p>
          </div>
        ) : isLab ? (
          /* ===================================================================== */
          /* LAB SESSIONAL TABLE (SINGLE INTERNAL SCORE) */
          /* ===================================================================== */
          <div className="overflow-x-auto max-h-[580px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#1E1B4B] text-white sticky top-0 z-10 font-bold">
                <tr>
                  <th className="px-3.5 py-3 text-center w-12 border-r border-indigo-900">S.No</th>
                  <th className="px-4 py-3 w-36 border-r border-indigo-900">Register No</th>
                  <th className="px-4 py-3 min-w-[220px] border-r border-indigo-900">Student Name</th>
                  <th className="px-4 py-3 text-center w-48 bg-[#6366F1] text-white border-r border-indigo-900 font-bold">
                    Lab Single Internal Score (Max 30)
                  </th>
                  <th className="px-4 py-3 text-center font-extrabold bg-[#4338CA] text-white text-sm">
                    Final Sessional Mark (30M)
                  </th>
                  <th className="px-4 py-3 text-center w-36">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {sessionals.map((row) => {
                  const isPassed = row.status === 'PASSED';
                  const isPending = row.status === 'INCOMPLETE';
                  const score = row.sessionalTotal;

                  return (
                    <tr key={row.studentId} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono">{row.sNo}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-[#0A2566]">{row.registerNumber}</td>
                      <td className="px-4 py-2.5 text-slate-800">{row.name}</td>
                      <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-700 bg-purple-50/30 border-r border-slate-100">
                        {score !== null ? `${score} / 30` : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center font-mono font-black text-sm text-[#4338CA] bg-indigo-50/60">
                        {score !== null ? score : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                            Awaiting Score
                          </span>
                        ) : isPassed ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Qualified
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Improvement Req.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ===================================================================== */
          /* THEORY SESSIONAL TABLE (80:20 WEIGHTED) */
          /* ===================================================================== */
          <div className="overflow-x-auto max-h-[580px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0A2566] text-white sticky top-0 z-10 font-bold">
                <tr>
                  <th className="px-3 py-3 text-center w-12">S.No</th>
                  <th className="px-3.5 py-3 w-32">Register No</th>
                  <th className="px-3.5 py-3 min-w-[180px]">Student Name</th>
                  <th className="px-3 py-3 text-center">Mid-1 (/30)</th>
                  <th className="px-3 py-3 text-center">Mid-2 (/30)</th>
                  <th className="px-3 py-3 text-center bg-[#0E2F7D]">Higher Mid (80%)</th>
                  <th className="px-3 py-3 text-center bg-[#123A99]">Lower Mid (20%)</th>
                  <th className="px-3.5 py-3 text-center font-extrabold bg-[#146EF5] text-white text-sm">
                    Final Sessional (/30)
                  </th>
                  <th className="px-3.5 py-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {sessionals.map((row) => {
                  const isPassed = row.status === 'PASSED';
                  const isPending = row.status === 'INCOMPLETE';

                  return (
                    <tr key={row.studentId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2.5 text-center text-slate-400 font-mono">{row.sNo}</td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#0A2566]">{row.registerNumber}</td>
                      <td className="px-3.5 py-2.5 text-slate-800">{row.name}</td>
                      <td className="px-3.5 py-2.5 text-center font-mono">
                        {row.mid1 !== null ? row.mid1 : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-mono">
                        {row.mid2 !== null ? row.mid2 : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-mono bg-slate-50 font-bold text-slate-700">
                        {row.higherMid !== null ? row.higherMid : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-mono bg-slate-50 font-bold text-slate-700">
                        {row.lowerMid !== null ? row.lowerMid : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-mono font-black text-sm text-[#146EF5] bg-blue-50/60">
                        {row.sessionalTotal !== null ? row.sessionalTotal : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                            Awaiting Evaluation
                          </span>
                        ) : isPassed ? (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Passed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Improvement Req.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
