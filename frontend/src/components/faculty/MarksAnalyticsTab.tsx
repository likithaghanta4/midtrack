import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  Award,
  Search,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Download,
  FileSpreadsheet,
  Layers,
  ExternalLink,
  X
} from 'lucide-react';
import {
  SectionItem,
  ClassMatrixResponse,
  facultyApi
} from '../../services/api';
import { formatSectionLabel, getSemestersForSection } from '../../utils/academicYearHelper';
import { getSRKRClassSem } from '../../utils/marksWordHelper';
import {
  downloadElementAsPDF,
  saveCsvWithNativeDialog,
  viewElementPDFInNewTab,
  openNativePrintPDF
} from '../../utils/pdfExportHelper';

type SubjectItem = ClassMatrixResponse['subjects'][number];

interface MarksAnalyticsTabProps {
  sections: SectionItem[];
  selectedSection: SectionItem | null;
  onSelectSection: (sec: SectionItem) => void;
}

// Helper to detect elective group key (e.g. 'PE-1', 'PE-2', 'OE-1')
export function getElectiveGroupInfo(subjectName: string): { groupKey: string; label: string } | null {
  const norm = subjectName.trim();
  const peMatch = norm.match(/^(?:Professional\s*Elective|PE)[\s\-_:]*(I{1,3}|IV|VI{0,2}|[1-6])\b/i);
  if (peMatch) {
    const rawNum = peMatch[1].toUpperCase();
    const romanToNum: Record<string, string> = {
      'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6',
      '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6'
    };
    const num = romanToNum[rawNum] || rawNum;
    return { groupKey: `PE-${num}`, label: `Professional Elective - ${num} (PE-${num})` };
  }

  const oeMatch = norm.match(/^(?:Open\s*Elective|OE)[\s\-_:]*(I{1,3}|IV|VI{0,2}|[1-6])\b/i);
  if (oeMatch) {
    const rawNum = oeMatch[1].toUpperCase();
    const romanToNum: Record<string, string> = {
      'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5', 'VI': '6',
      '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6'
    };
    const num = romanToNum[rawNum] || rawNum;
    return { groupKey: `OE-${num}`, label: `Open Elective - ${num} (OE-${num})` };
  }

  return null;
}

export const MarksAnalyticsTab: React.FC<MarksAnalyticsTabProps> = ({
  sections,
  selectedSection,
  onSelectSection,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(
    selectedSection?.semester || 3
  );
  const [examMode, setExamMode] = useState<'SESSIONAL' | 'MID_1' | 'MID_2'>('SESSIONAL');
  const [matrixData, setMatrixData] = useState<ClassMatrixResponse | null>(null);
  const [selectedElectives, setSelectedElectives] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Sync selectedSemester when selectedSection changes
  useEffect(() => {
    if (selectedSection) {
      setSelectedSemester(selectedSection.semester);
    }
  }, [selectedSection]);

  // Load Multi-Subject Class Matrix
  useEffect(() => {
    if (!selectedSection) return;

    let isMounted = true;
    const loadMatrix = async () => {
      try {
        setLoading(true);
        const res = await facultyApi.getClassMatrix(
          selectedSection.id,
          selectedSemester,
          examMode
        );
        if (isMounted) {
          setMatrixData(res);
        }
      } catch (err) {
        console.error('Failed to load class matrix:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMatrix();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSemester, examMode]);

  // 1. Group subjects into core subjects and elective buckets
  const electiveGroupsMap = useMemo(() => {
    const map = new Map<string, { label: string; subjects: SubjectItem[] }>();
    if (!matrixData) return map;

    for (const sub of matrixData.subjects) {
      const info = getElectiveGroupInfo(sub.subjectName);
      if (info) {
        if (!map.has(info.groupKey)) {
          map.set(info.groupKey, { label: info.label, subjects: [] });
        }
        map.get(info.groupKey)!.subjects.push(sub);
      }
    }
    return map;
  }, [matrixData]);

  // 2. Auto-initialize default selected elective when matrixData loads
  useEffect(() => {
    if (!matrixData) return;
    const defaults: Record<string, string> = {};

    electiveGroupsMap.forEach((group, groupKey) => {
      // Find the subject with the most entered marks in this section
      let bestSubId = group.subjects[0]?.id || '';
      let maxMarksCount = -1;

      for (const sub of group.subjects) {
        let count = 0;
        for (const stu of matrixData.students) {
          const sc = stu.subjectScores[sub.id]?.score;
          if (sc !== null && sc !== undefined) count++;
        }
        if (count > maxMarksCount) {
          maxMarksCount = count;
          bestSubId = sub.id;
        }
      }

      defaults[groupKey] = selectedElectives[groupKey] || bestSubId;
    });

    setSelectedElectives(defaults);
  }, [matrixData, electiveGroupsMap]);

  // 3. Effective displayed subjects for the board (Core subjects + Selected Elective for each group)
  const displayedSubjects = useMemo<SubjectItem[]>(() => {
    if (!matrixData) return [];
    const result: SubjectItem[] = [];
    const seenGroups = new Set<string>();

    for (const sub of matrixData.subjects) {
      const info = getElectiveGroupInfo(sub.subjectName);
      if (!info) {
        // Core subject (Compulsory)
        result.push(sub);
      } else {
        // Elective group: only add the ONE chosen subject once
        if (!seenGroups.has(info.groupKey)) {
          seenGroups.add(info.groupKey);
          const chosenId = selectedElectives[info.groupKey];
          const groupSubs = electiveGroupsMap.get(info.groupKey)?.subjects || [];
          const chosenSub = groupSubs.find((s: SubjectItem) => s.id === chosenId) || groupSubs[0];
          if (chosenSub) {
            result.push(chosenSub);
          }
        }
      }
    }

    return result;
  }, [matrixData, selectedElectives, electiveGroupsMap]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    if (!matrixData) return [];
    let list = matrixData.students;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.registerNumber.toLowerCase().includes(q)
      );
    }

    return list;
  }, [matrixData, searchQuery]);

  // Export CSV with Native Windows Save Dialog
  const handleExportCSV = async () => {
    if (!matrixData || !selectedSection) return;

    const subjects = displayedSubjects;
    const headerRow = [
      'S.No',
      'Register Number',
      'Student Name',
      ...subjects.map((s) => `[${s.subjectCode}] ${s.subjectName} (${s.isLab ? 'Lab' : 'Theory'})`),
    ];

    const dataRows = matrixData.students.map((stu) => {
      const subCols = subjects.map((sub) => {
        const sc = stu.subjectScores[sub.id]?.score;
        return sc !== null && sc !== undefined ? sc : '—';
      });

      return [
        stu.sNo,
        `"${stu.registerNumber}"`,
        `"${(stu.name || '').replace(/"/g, '""')}"`,
        ...subCols,
      ];
    });

    const csvContent = [headerRow.join(','), ...dataRows.map((e) => e.join(','))].join('\r\n');
    const fileName = `SRKR_Class_Analytics_${selectedSection.branch}_Sec${selectedSection.sectionName}_Sem${selectedSemester}_${examMode}.csv`;

    try {
      await saveCsvWithNativeDialog(csvContent, fileName);
      setSuccessToast(`Saved spreadsheet as "${fileName}"`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  // Generate & Download PDF with Landscape Optimization
  const handleDownloadPDF = async () => {
    if (!printRef.current || !selectedSection) return;

    const fileName = `SRKR_Class_Analytics_${selectedSection.branch}_Sec${selectedSection.sectionName}_Sem${selectedSemester}_${examMode}.pdf`;

    try {
      setGeneratingPdf(true);
      await downloadElementAsPDF(printRef.current, fileName, 'landscape');
      setSuccessToast(`Downloaded "${fileName}" successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF. You can also use "Print / Preview" to save as PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Open PDF in new tab
  const handleOpenPDFInNewTab = async () => {
    if (!printRef.current || !selectedSection) return;
    try {
      setGeneratingPdf(true);
      const title = `SRKR Class Analytics - ${selectedSection.branch} Sec-${selectedSection.sectionName} (Sem ${selectedSemester})`;
      await viewElementPDFInNewTab(printRef.current, title);
    } catch (err) {
      console.error('Open PDF error:', err);
      handlePrint();
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Browser Native Print
  const handlePrint = () => {
    if (!printRef.current || !selectedSection) return;
    const title = `SRKR Class Analytics - ${selectedSection.branch} Sec-${selectedSection.sectionName} (Sem ${selectedSemester})`;
    openNativePrintPDF(printRef.current, title);
  };

  const getExamModeLabel = (mode: string) => {
    switch (mode) {
      case 'MID_1':
        return 'MID-1 Examination Marks';
      case 'MID_2':
        return 'MID-2 Examination Marks';
      case 'SESSIONAL':
      default:
        return 'Final Sessional Marks (80:20 + Lab Direct)';
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FILTER & CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                  className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#146EF5] focus:bg-white"
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

            {/* 2. Semester Filter (Isolated by year) */}
            <div>
              <label className="block text-xs font-bold text-[#0A2566] uppercase tracking-wider mb-1.5">
                2. Semester
              </label>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#146EF5] focus:bg-white"
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

            {/* 3. Examination Mode (Clean single instance options) */}
            <div>
              <label className="block text-xs font-bold text-[#0A2566] uppercase tracking-wider mb-1.5">
                3. Examination View
              </label>
              <div className="relative">
                <select
                  value={examMode}
                  onChange={(e) => setExamMode(e.target.value as any)}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:border-[#146EF5] focus:bg-white"
                >
                  <option value="SESSIONAL">📊 Final Sessional (80:20 + Labs)</option>
                  <option value="MID_1">📝 MID-1 Examination</option>
                  <option value="MID_2">📝 MID-2 Examination</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 lg:pt-5">
            <button
              onClick={handleExportCSV}
              disabled={loading || !matrixData}
              title="Save as Excel / CSV file to your computer"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Save Excel / CSV</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={generatingPdf || loading || !matrixData}
              title="Download print-ready PDF file"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#146EF5] hover:bg-[#0D59CB] text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save as PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenPDFInNewTab}
              disabled={generatingPdf || loading || !matrixData}
              title="Open PDF in a new tab for instant viewing or printing"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ELECTIVE SUBJECT SELECTION TOOLBAR (FOR 3RD & 4TH YEARS) */}
      {/* ========================================================================= */}
      {electiveGroupsMap.size > 0 && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 rounded-3xl p-5 border-2 border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A2566] text-white flex items-center justify-center font-black text-xs font-mono shadow-sm">
              PE
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#0A2566] uppercase tracking-wide flex items-center gap-2">
                <span>Elective Subject Selection</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#146EF5] text-[10px] font-bold">
                  {electiveGroupsMap.size} Elective Group{electiveGroupsMap.size > 1 ? 's' : ''} (Sem-{selectedSemester})
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Select the active elective subject offered to this section to display on the marks board.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {Array.from(electiveGroupsMap.entries()).map(([groupKey, group]) => {
              const selectedId = selectedElectives[groupKey] || group.subjects[0]?.id;

              return (
                <div key={groupKey} className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border-2 border-blue-200 shadow-xs">
                  <span className="text-xs font-black text-[#0A2566] font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {groupKey}
                  </span>
                  <div className="relative">
                    <select
                      value={selectedId}
                      onChange={(e) => {
                        setSelectedElectives((prev) => ({
                          ...prev,
                          [groupKey]: e.target.value,
                        }));
                      }}
                      className="text-xs font-bold text-slate-800 bg-transparent pr-7 py-0.5 cursor-pointer focus:outline-none appearance-none max-w-[260px] truncate"
                    >
                      {group.subjects.map((sub: SubjectItem) => (
                        <option key={sub.id} value={sub.id}>
                          [{sub.subjectCode}] {sub.subjectName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-0 top-1 pointer-events-none" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TOP KPI CARDS */}
      {/* ========================================================================= */}
      {matrixData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Class Average % */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#146EF5] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average</p>
              <h3 className="text-2xl font-black text-[#0A2566] tracking-tight">
                {matrixData.overview.classAvgPercentage}%
              </h3>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                {matrixData.overview.evaluatedStudents} of {matrixData.overview.totalStudents} evaluated
              </p>
            </div>
          </div>

          {/* Card 2: All Clear Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Clear Rate</p>
              <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
                {matrixData.overview.allClearPercentage}%
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {matrixData.overview.allClearCount} students with 0 backlogs
              </p>
            </div>
          </div>

          {/* Card 3: Top Scorer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Topper</p>
              <h3 className="text-2xl font-black text-[#0A2566] tracking-tight">
                {matrixData.overview.topStudent.totalScore}{' '}
                <span className="text-xs font-medium text-slate-400">
                  ({matrixData.overview.topStudent.avgPercentage}%)
                </span>
              </h3>
              <p className="text-[11px] text-slate-600 font-bold truncate max-w-[170px] mt-0.5" title={matrixData.overview.topStudent.name}>
                {matrixData.overview.topStudent.name}
              </p>
            </div>
          </div>

          {/* Card 4: Active Board Subjects */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Board Subjects</p>
              <h3 className="text-2xl font-black text-purple-700 tracking-tight">
                {displayedSubjects.length} Courses
              </h3>
              <p className="text-[11px] text-purple-600 font-medium mt-0.5">
                {displayedSubjects.filter((s) => !s.isLab).length} Theory • {displayedSubjects.filter((s) => s.isLab).length} Practical Labs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MASTER MULTI-SUBJECT MARKS MATRIX TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div>
            <h3 className="text-base font-bold text-[#0A2566] flex items-center gap-2">
              <span>Class Multi-Subject Performance Matrix</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#146EF5] text-xs font-bold border border-blue-100">
                {filteredStudents.length} Students
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing marks across {displayedSubjects.length} active subjects for {getExamModeLabel(examMode)}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roll no or name..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#146EF5] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#146EF5]" />
            <p className="text-sm font-semibold">Loading multi-subject class performance matrix...</p>
          </div>
        ) : !matrixData || matrixData.students.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No student marks available for this section.</p>
            <p className="text-xs text-slate-400 mt-1">Please enter marks in the "Enter Mid Marks" tab first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[580px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0A2566] text-white sticky top-0 z-20 font-bold shadow-xs">
                <tr>
                  <th className="px-3 py-3 text-center w-12 border-r border-blue-900 sticky left-0 z-30 bg-[#0A2566]">
                    S.No
                  </th>
                  <th className="px-3.5 py-3 w-32 border-r border-blue-900 sticky left-12 z-30 bg-[#0A2566]">
                    Register No
                  </th>
                  <th className="px-3.5 py-3 w-52 border-r border-blue-900 sticky left-44 z-30 bg-[#0A2566] truncate">
                    Student Name
                  </th>

                  {/* Dynamic Columns for each Displayed Subject */}
                  {displayedSubjects.map((sub) => {
                    const elecInfo = getElectiveGroupInfo(sub.subjectName);
                    const groupSubs = elecInfo ? electiveGroupsMap.get(elecInfo.groupKey)?.subjects || [] : [];

                    return (
                      <th
                        key={sub.id}
                        className={`px-3.5 py-2.5 text-center min-w-[140px] max-w-[170px] border-r border-blue-900/60 ${
                          elecInfo ? 'bg-[#0E2F7F]' : ''
                        }`}
                        title={`${sub.subjectCode} - ${sub.subjectName}`}
                      >
                        <div className="flex flex-col items-center">
                          {elecInfo ? (
                            <div className="mb-1 flex items-center gap-1 bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider">
                              <span>⚡ {elecInfo.groupKey} ELECTIVE</span>
                            </div>
                          ) : null}

                          <span className="font-mono text-[11px] text-amber-300 font-bold bg-amber-400/15 px-2 py-0.5 rounded border border-amber-400/30">
                            {sub.subjectCode}
                          </span>

                          {elecInfo && groupSubs.length > 1 ? (
                            <div className="relative mt-1 w-full">
                              <select
                                value={sub.id}
                                onChange={(e) => {
                                  setSelectedElectives((prev) => ({
                                    ...prev,
                                    [elecInfo.groupKey]: e.target.value,
                                  }));
                                }}
                                className="w-full text-[10.5px] text-amber-200 bg-blue-950/80 border border-blue-400/40 rounded px-1.5 py-0.5 font-semibold text-center cursor-pointer focus:outline-none appearance-none"
                              >
                                {groupSubs.map((gs: SubjectItem) => (
                                  <option key={gs.id} value={gs.id} className="bg-slate-900 text-white text-left">
                                    {gs.subjectName}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-amber-300 absolute right-1 top-1 pointer-events-none" />
                            </div>
                          ) : (
                            <span className="text-[10.5px] text-blue-100 font-semibold leading-tight mt-1 text-center line-clamp-2" title={sub.subjectName}>
                              {sub.subjectName}
                            </span>
                          )}

                          <span className="text-[9px] text-blue-200 mt-0.5">
                            {sub.isLab ? '🔬 Lab (30M)' : '📘 Theory (30M)'}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium bg-white">
                {filteredStudents.map((s, idx) => (
                  <tr
                    key={s.studentId}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* Fixed S.No */}
                    <td className="px-3 py-2 text-center text-slate-400 font-mono border-r border-slate-100 sticky left-0 z-10 bg-inherit">
                      {s.sNo}
                    </td>

                    {/* Fixed Register No */}
                    <td className="px-3.5 py-2 font-mono font-bold text-[#0A2566] border-r border-slate-100 sticky left-12 z-10 bg-inherit">
                      {s.registerNumber}
                    </td>

                    {/* Fixed Student Name */}
                    <td className="px-3.5 py-2 text-slate-800 border-r border-slate-100 sticky left-44 z-10 bg-inherit truncate max-w-[200px]" title={s.name}>
                      {s.name}
                    </td>

                    {/* Subject Score Cells */}
                    {displayedSubjects.map((sub) => {
                      const scObj = s.subjectScores[sub.id];
                      const sc = scObj?.score;
                      const isEntered = sc !== null && sc !== undefined;

                      let cellColor = 'text-slate-400';
                      let cellBg = '';

                      if (isEntered) {
                        if (sc >= 24) {
                          cellColor = 'text-purple-700 font-black';
                          cellBg = 'bg-purple-50/30';
                        } else if (sc >= 18) {
                          cellColor = 'text-emerald-700 font-bold';
                          cellBg = 'bg-emerald-50/20';
                        } else if (sc >= 12) {
                          cellColor = 'text-[#0A2566] font-semibold';
                        } else {
                          cellColor = 'text-red-700 font-black';
                          cellBg = 'bg-red-50/50';
                        }
                      }

                      return (
                        <td
                          key={sub.id}
                          className={`px-3.5 py-2 text-center font-mono text-xs border-r border-slate-100 ${cellColor} ${cellBg}`}
                        >
                          {isEntered ? sc : <span className="text-slate-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. HIDDEN PRINTABLE ELEMENT FOR HIGH-RESOLUTION PDF EXPORT */}
      {/* ========================================================================= */}
      <div className="overflow-hidden h-0 w-0 pointer-events-none opacity-0">
        <div
          ref={printRef}
          className="p-8 bg-white text-slate-900 w-[1240px] border border-slate-300 font-sans"
          style={{ width: '1240px', boxSizing: 'border-box' }}
        >
          {/* Official SRKR Institutional Header */}
          <div className="flex items-center justify-between border-b-2 border-[#0A2566] pb-4 mb-3">
            <div className="flex items-center gap-4">
              <img
                src="/assets/srkr-emblem.png"
                alt="SRKR Seal"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
                }}
              />
              <div>
                <h1 className="text-xl font-black text-[#0A2566] uppercase tracking-wide font-serif">
                  SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)
                </h1>
                <p className="text-xs text-slate-600 font-serif">
                  Affiliated to JNTUK, Kakinada • Approved by AICTE • NAAC Accredited 'A+' Grade
                </p>
                <p className="text-xs font-semibold text-slate-800 font-serif">
                  Chinna Amiram, Bhimavaram - 534 204, W.G. Dist., A.P., India
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3.5 py-1.5 rounded-md bg-[#0A2566] text-white text-xs font-black uppercase font-sans tracking-wider">
                R23 AUTONOMOUS
              </span>
              <p className="text-[11px] text-slate-500 mt-1 font-sans font-medium">
                Date: {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Statement Metadata & Title */}
          <div className="text-center my-3 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200">
            <h2 className="text-sm sm:text-base font-black text-[#0A2566] uppercase tracking-wide">
              CONSOLIDATED MULTI-SUBJECT CLASS PERFORMANCE STATEMENT — {getExamModeLabel(examMode).toUpperCase()}
            </h2>
            <div className="flex justify-center flex-wrap gap-x-8 gap-y-1 text-xs text-slate-700 mt-1.5 font-bold font-mono">
              <span>BRANCH: {selectedSection?.branch}</span>
              <span>SECTION: {selectedSection?.sectionName}</span>
              <span>CLASS/SEM: {getSRKRClassSem(selectedSemester)}</span>
              <span>ACADEMIC YEAR: {selectedSection?.academicYear}</span>
              <span>TOTAL STUDENTS: {matrixData?.students.length || 0}</span>
            </div>
          </div>

          {/* DEDICATED OFFICIAL COURSE CODE & FULL SUBJECT NAME MAPPING TABLE */}
          {displayedSubjects.length > 0 && (
            <div className="mb-4 bg-white rounded-xl border-2 border-[#0A2566] overflow-hidden">
              <div className="bg-[#0A2566] text-white px-3 py-1.5 flex items-center justify-between font-bold text-[11px]">
                <span>OFFICIAL COURSE CODES & COMPLETE SUBJECT TITLES (SEMESTER-{selectedSemester})</span>
                <span>{displayedSubjects.length} COURSES REGISTERED</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y divide-slate-200 text-[10px]">
                {displayedSubjects.map((sub) => {
                  const elecInfo = getElectiveGroupInfo(sub.subjectName);

                  return (
                    <div key={sub.id} className="p-2 flex items-center gap-2.5 bg-slate-50/60">
                      <span className="font-mono font-black text-[#0A2566] bg-white px-2 py-1 rounded border border-slate-300 shrink-0 text-[11px]">
                        {sub.subjectCode}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                          <span>{sub.subjectName}</span>
                          {elecInfo && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[8px] font-black shrink-0">
                              {elecInfo.groupKey}
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                          {sub.isLab ? '🔬 Laboratory Practical • Max: 30M' : '📘 Theory Course • Max: 30M'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Multi-Subject Marks Roster Table */}
          {matrixData && (
            <table className="w-full text-left border-collapse border-2 border-slate-600 text-[10px] font-sans">
              <thead className="bg-[#0A2566] text-white font-bold border-b-2 border-slate-600">
                <tr>
                  <th className="p-1.5 border border-blue-900 text-center w-8 bg-[#0A2566]">S.No</th>
                  <th className="p-1.5 border border-blue-900 w-28 bg-[#0A2566]">Register No</th>
                  <th className="p-1.5 border border-blue-900 w-48 bg-[#0A2566]">Student Name</th>
                  {displayedSubjects.map((sub) => (
                    <th key={sub.id} className="p-1.5 border border-blue-900/80 text-center align-top">
                      <div className="font-mono text-[10px] text-amber-300 font-black tracking-wide">{sub.subjectCode}</div>
                      <div className="text-[8.5px] text-blue-100 font-bold leading-tight mt-0.5 break-words">
                        {sub.subjectName}
                      </div>
                      <div className="text-[7.5px] text-blue-200 mt-0.5 font-mono">
                        {sub.isLab ? '(Lab 30M)' : '(30M)'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.students.map((stu, idx) => (
                  <tr
                    key={stu.studentId}
                    className={`border-b border-slate-300 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="p-1 border border-slate-300 text-center font-mono text-slate-500">{stu.sNo}</td>
                    <td className="p-1 border border-slate-300 font-mono font-bold text-[#0A2566] whitespace-nowrap">
                      {stu.registerNumber}
                    </td>
                    <td className="p-1 border border-slate-300 font-medium text-slate-900 truncate max-w-[200px]">
                      {stu.name}
                    </td>
                    {displayedSubjects.map((sub) => {
                      const sc = stu.subjectScores[sub.id]?.score;
                      const isEntered = sc !== null && sc !== undefined;
                      let txtColor = 'text-slate-400';
                      if (isEntered) {
                        if (sc >= 24) txtColor = 'text-purple-700 font-black';
                        else if (sc >= 18) txtColor = 'text-emerald-700 font-bold';
                        else if (sc >= 12) txtColor = 'text-[#0A2566] font-bold';
                        else txtColor = 'text-red-700 font-black';
                      }
                      return (
                        <td key={sub.id} className={`p-1 border border-slate-300 text-center font-mono ${txtColor}`}>
                          {isEntered ? sc : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Institutional Signature Blocks */}
          <div className="grid grid-cols-4 gap-6 text-center mt-12 pt-8 text-xs font-sans font-bold text-slate-800">
            <div>
              <div className="border-t-2 border-slate-500 pt-1.5">Class Teacher</div>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">Signature & Date</p>
            </div>
            <div>
              <div className="border-t-2 border-slate-500 pt-1.5">Faculty Advisor</div>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">Signature & Date</p>
            </div>
            <div>
              <div className="border-t-2 border-slate-500 pt-1.5">Head of Department (HOD)</div>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">Signature & Seal</p>
            </div>
            <div>
              <div className="border-t-2 border-slate-500 pt-1.5">Principal / Dean Exams</div>
              <p className="text-[10px] text-slate-500 font-normal mt-0.5">Signature & Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
