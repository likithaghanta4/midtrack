import React, { useState, useEffect, useRef } from 'react';
import { Download, FileSpreadsheet, Printer, ExternalLink, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { SectionItem, SubjectItem, ExamItem, SessionalRecord, facultyApi } from '../../services/api';
import { User as AuthUserType } from '../../types';
import { formatSectionLabel, getSemestersForSection } from '../../utils/academicYearHelper';
import { markToWords, getSRKRClassSem } from '../../utils/marksWordHelper';
import { downloadElementAsPDF, viewElementPDFInNewTab, openNativePrintPDF, saveCsvWithNativeDialog } from '../../utils/pdfExportHelper';
import { isOpenElectiveCourse } from '../../utils/r23Curriculum';

interface PrintMarkSheetTabProps {
  user: AuthUserType;
  sections: SectionItem[];
  selectedSection: SectionItem | null;
  onSelectSection: (sec: SectionItem) => void;
}

type SheetType = 'SESSIONAL' | 'SESSIONAL_DUAL' | 'MID_1' | 'MID_2' | 'LAB_INTERNAL';

interface PrintRowData {
  sNo: number;
  registerNumber: string;
  name: string;
  totalFigures: number | string;
  totalWords: string;
}

export const PrintMarkSheetTab: React.FC<PrintMarkSheetTabProps> = ({
  user,
  sections,
  selectedSection,
  onSelectSection,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(
    selectedSection?.semester || 2
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedSheetType, setSelectedSheetType] = useState<SheetType>('SESSIONAL');
  const [sessionalsData, setSessionalsData] = useState<SessionalRecord[]>([]);
  const [isLabSubject, setIsLabSubject] = useState<boolean>(false);
  const [printRows, setPrintRows] = useState<PrintRowData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const printSheetRef = useRef<HTMLDivElement>(null);

  const facultyName = user.name || user.username || 'Faculty Member';
  const facultyDept =
    selectedSection?.branch === 'CSIT'
      ? 'DEPARTMENT OF COMPUTER SCIENCE & INFORMATION TECHNOLOGY'
      : 'DEPARTMENT OF COMPUTER SCIENCE & DESIGN';

  // Sync selectedSemester when selectedSection changes
  useEffect(() => {
    if (selectedSection) {
      setSelectedSemester(selectedSection.semester);
    }
  }, [selectedSection]);

  // 1. Load subjects & exams for the selected section and semester
  useEffect(() => {
    if (!selectedSection) return;

    let isMounted = true;
    const loadMeta = async () => {
      try {
        const [subRes, examRes] = await Promise.all([
          facultyApi.getSubjects(selectedSection.branch, selectedSemester),
          facultyApi.getExams(selectedSection.academicYear, selectedSemester),
        ]);
        if (isMounted) {
          setSubjects(subRes.subjects);
          setExams(examRes.exams);
          if (subRes.subjects.length > 0) {
            setSelectedSubjectId(subRes.subjects[0].id);
            setIsLabSubject(!!subRes.subjects[0].isLab);
          } else {
            setSelectedSubjectId('');
            setIsLabSubject(false);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    loadMeta();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSemester]);

  // Update isLabSubject whenever selectedSubjectId changes
  useEffect(() => {
    const sub = subjects.find((s) => s.id === selectedSubjectId);
    setIsLabSubject(!!sub?.isLab);
  }, [selectedSubjectId, subjects]);

  // 2. Load marks based on sheet type
  useEffect(() => {
    if (!selectedSection || !selectedSubjectId) {
      setSessionalsData([]);
      setPrintRows([]);
      return;
    }

    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const sub = subjects.find((s) => s.id === selectedSubjectId);
        const isLab = !!sub?.isLab;

        if (selectedSheetType === 'SESSIONAL' || selectedSheetType === 'SESSIONAL_DUAL') {
          // Fetch computed sessionals (Direct 100% for lab, 80:20 formula for theory)
          const res = await facultyApi.getSessionalMarks(selectedSection.id, selectedSubjectId);
          if (isMounted) {
            setSessionalsData(res.sessionals);
            const formatted: PrintRowData[] = res.sessionals.map((s) => ({
              sNo: s.sNo,
              registerNumber: s.registerNumber,
              name: s.name,
              totalFigures: s.sessionalTotal !== null ? s.sessionalTotal : '—',
              totalWords: markToWords(s.sessionalTotal),
            }));
            setPrintRows(formatted);
          }
        } else if (isLab || selectedSheetType === 'LAB_INTERNAL') {
          // Lab single internal exam
          const targetExam = exams.find((e) => e.examType === 'LAB_INTERNAL') || exams[0];
          if (targetExam) {
            const res = await facultyApi.getSectionMarks(
              selectedSection.id,
              selectedSubjectId,
              targetExam.id
            );
            if (isMounted) {
              const formatted: PrintRowData[] = res.students.map((s) => ({
                sNo: s.sNo,
                registerNumber: s.registerNumber,
                name: s.name,
                totalFigures: s.total > 0 ? s.total : 0,
                totalWords: markToWords(s.total),
              }));
              setPrintRows(formatted);
            }
          }
        } else {
          // Fetch Mid-1 or Mid-2 marks
          const examName = selectedSheetType === 'MID_1' ? 'MID_1' : 'MID_2';
          const targetExam = exams.find((e) => e.examType === examName) || exams[0];

          if (targetExam) {
            const res = await facultyApi.getSectionMarks(
              selectedSection.id,
              selectedSubjectId,
              targetExam.id
            );
            if (isMounted) {
              const formatted: PrintRowData[] = res.students.map((s) => ({
                sNo: s.sNo,
                registerNumber: s.registerNumber,
                name: s.name,
                totalFigures: s.total > 0 ? s.total : 0,
                totalWords: markToWords(s.total),
              }));
              setPrintRows(formatted);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load print sheet data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSubjectId, selectedSheetType, exams, subjects]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const isOESubject = !!(currentSubject?.isOpenElective || isOpenElectiveCourse(currentSubject?.subjectCode, currentSubject?.subjectName));
  const classSemString = selectedSection ? getSRKRClassSem(selectedSection.semester) : 'III B.TECH - II';
  const branchString = selectedSection?.branch || 'CSIT';
  const sectionLetter = selectedSection?.sectionName.replace(/^(24|25)\s*/, '') || 'A';

  // Split into Left and Right Columns for dual-column format
  const halfCount = Math.ceil(printRows.length / 2);
  const leftColumn = printRows.slice(0, halfCount);
  const rightColumn = printRows.slice(halfCount);

  // Download high-resolution PDF with guaranteed .pdf extension
  const handleDownloadPDF = async () => {
    if (!printSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const sheetName = isLabSubject
        ? 'Lab_Sessional_Marks'
        : selectedSheetType.includes('SESSIONAL')
        ? 'Sessional_Marks'
        : `${selectedSheetType}_Marks`;
      const code = currentSubject?.subjectCode || 'Course';
      const fileName = `SRKR_${sheetName}_${branchString}_Sec${sectionLetter}_${code}.pdf`;

      await downloadElementAsPDF(printSheetRef.current, fileName);
      setDownloadSuccess(`Downloaded "${fileName}" successfully!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not generate PDF. You can also use "Open PDF" or "Print" to save as PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Open PDF directly in a new tab
  const handleOpenPDFInNewTab = async () => {
    if (!printSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const sheetName = isLabSubject
        ? 'Laboratory Sessional Marks (Direct Internal)'
        : selectedSheetType.includes('SESSIONAL')
        ? 'Sessional Marks (80:20)'
        : `${selectedSheetType} Marks`;
      const code = currentSubject?.subjectCode || 'Course';
      const title = `SRKR ${sheetName} - ${branchString} Sec-${sectionLetter} (${code})`;

      await viewElementPDFInNewTab(printSheetRef.current, title);
    } catch (err) {
      console.error('Open PDF error:', err);
      alert('Could not open PDF in new tab. Using Print preview instead.');
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download CSV / Excel spreadsheet with Native Windows File Dialog
  const handleDownloadCSV = async () => {
    const lines: string[] = [];
    const sheetTitle = isLabSubject
      ? 'STATEMENT OF LABORATORY SESSIONAL MARKS (DIRECT INTERNAL EVALUATION)'
      : selectedSheetType.includes('SESSIONAL')
      ? 'STATEMENT OF SESSIONAL MARKS (80:20 WEIGHTED FORMULA)'
      : `${selectedSheetType} MARKS STATEMENT`;
    lines.push('SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)');
    lines.push('CHINNAAMIRAM :: BHIMAVARAM - 534204');
    lines.push(sheetTitle);
    lines.push('');
    lines.push(`Academic Year:,${selectedSection?.academicYear || '2025-2026'},Class/Sem:,${classSemString}`);
    lines.push(`Course:,${currentSubject ? `${currentSubject.subjectCode} - ${currentSubject.subjectName}` : '—'},Subject Teacher:,${facultyName}`);
    lines.push(`Branch:,${branchString},Section:,${sectionLetter},Max Marks:,30`);
    lines.push('');

    if (isLabSubject && selectedSheetType === 'SESSIONAL') {
      lines.push('S.No,Register No,Student Name,Lab Internal Marks (/30),Final Sessional (/30),Marks In Words,Status');
      sessionalsData.forEach((row) => {
        const nameEsc = `"${(row.name || '').replace(/"/g, '""')}"`;
        const total = row.sessionalTotal !== null ? row.sessionalTotal : '';
        const words = `"${markToWords(row.sessionalTotal)}"`;
        lines.push(`${row.sNo},${row.registerNumber},${nameEsc},${total},${total},${words},${row.status}`);
      });
    } else if (selectedSheetType === 'SESSIONAL') {
      lines.push('S.No,Register No,Student Name,Mid-1 (/30),Mid-2 (/30),Higher Mid (80%),Lower Mid (20%),Final Sessional (/30),Status');
      sessionalsData.forEach((row) => {
        const nameEsc = `"${(row.name || '').replace(/"/g, '""')}"`;
        const mid1 = row.mid1 !== null ? row.mid1 : '';
        const mid2 = row.mid2 !== null ? row.mid2 : '';
        const higher = row.higherMid !== null ? row.higherMid : '';
        const lower = row.lowerMid !== null ? row.lowerMid : '';
        const total = row.sessionalTotal !== null ? row.sessionalTotal : '';
        lines.push(`${row.sNo},${row.registerNumber},${nameEsc},${mid1},${mid2},${higher},${lower},${total},${row.status}`);
      });
    } else {
      lines.push('Sl.No,Register No,Student Name,Marks (In Figures),Marks (In Words)');
      printRows.forEach((r) => {
        const nameEsc = `"${(r.name || '').replace(/"/g, '""')}"`;
        lines.push(`${r.sNo},${r.registerNumber},${nameEsc},${r.totalFigures},"${r.totalWords}"`);
      });
    }

    const safeName = `SRKR_${selectedSheetType}_${branchString}_Sec${sectionLetter}_${currentSubject?.subjectCode || 'Course'}.csv`;
    await saveCsvWithNativeDialog(lines.join('\r\n'), safeName);
    setDownloadSuccess(`Downloaded "${safeName}" spreadsheet successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handlePrint = () => {
    if (printSheetRef.current) {
      const code = currentSubject?.subjectCode || 'Marks';
      openNativePrintPDF(printSheetRef.current, `SRKR_${selectedSheetType}_${branchString}_${code}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP SELECTOR & DOWNLOAD ACTION BAR (Hidden on Print) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {/* 1. Section Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#0A2566] uppercase mb-1">
              Select Section
            </label>
            <div className="relative">
              <select
                value={selectedSection?.id || ''}
                onChange={(e) => {
                  const found = sections.find((s) => s.id === e.target.value);
                  if (found) onSelectSection(found);
                }}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatSectionLabel(s)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* 2. Semester Filter (Strictly isolated by year) */}
          <div>
            <label className="block text-[11px] font-bold text-[#0A2566] uppercase mb-1">
              Semester
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {selectedSection &&
                  getSemestersForSection(selectedSection.semester).map((opt) => (
                    <option key={opt.semesterNumber} value={opt.semesterNumber}>
                      {opt.label}
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* 3. Subject Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#0A2566] uppercase mb-1">
              Course / Subject
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {subjects.map((sub) => {
                  const isOE = sub.isOpenElective || isOpenElectiveCourse(sub.subjectCode, sub.subjectName);
                  return (
                    <option key={sub.id} value={sub.id}>
                      {isOE ? '🌐 [OE] ' : ''}{sub.subjectCode} - {sub.subjectName}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* 4. Statement Format */}
          <div>
            <label className="block text-[11px] font-bold text-[#0A2566] uppercase mb-1">
              Marks Statement Format
            </label>
            <div className="relative">
              <select
                value={selectedSheetType}
                onChange={(e) => setSelectedSheetType(e.target.value as SheetType)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#146EF5]"
              >
                {isLabSubject ? (
                  <>
                    <option value="SESSIONAL">LABORATORY SESSIONAL STATEMENT (Direct 100% Evaluation)</option>
                    <option value="SESSIONAL_DUAL">LABORATORY CONDENSED ROSTER (Dual Column Figures & Words)</option>
                    <option value="LAB_INTERNAL">LABORATORY INTERNAL EXAM MARKS</option>
                  </>
                ) : (
                  <>
                    <option value="SESSIONAL">SESSIONAL MARKS STATEMENT (80:20 Detailed Table)</option>
                    <option value="SESSIONAL_DUAL">SESSIONAL CONDENSED ROSTER (Dual Column Figures & Words)</option>
                    <option value="MID_1">MID-1 EXAMINATION MARKS</option>
                    <option value="MID_2">MID-2 EXAMINATION MARKS</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Download / Save / Print Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf || loading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-[#0A2566] to-[#146EF5] hover:from-[#081e52] hover:to-[#0d5edb] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition duration-150 cursor-pointer disabled:opacity-50"
            title="Download crisp PDF file directly to device"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Open / View PDF in New Tab */}
          <button
            onClick={handleOpenPDFInNewTab}
            disabled={isGeneratingPdf || loading}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-[#0A2566] border border-blue-200 rounded-xl text-xs font-bold transition duration-150 cursor-pointer disabled:opacity-50"
            title="Open PDF directly in a new browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open PDF</span>
          </button>

          {/* Export Excel / CSV */}
          <button
            onClick={handleDownloadCSV}
            disabled={loading || printRows.length === 0}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition duration-150 cursor-pointer disabled:opacity-50"
            title="Download CSV / Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition duration-150 cursor-pointer"
            title="Print or Save as PDF via Browser"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-xs animate-fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess} Ready to open and share.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OFFICIAL SRKR AUTONOMOUS PRINT STATEMENT CONTAINER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 text-black">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#146EF5] mb-2" />
            <p className="text-xs font-semibold">Generating official statement...</p>
          </div>
        ) : (
          <div
            ref={printSheetRef}
            className="w-full max-w-[1120px] mx-auto overflow-x-auto print:overflow-visible bg-white p-4"
          >
            {/* Header Box Table */}
            <table className="w-full border-collapse border-2 border-black text-[11px] font-sans">
              <tbody>
                {/* Row 1: Logo + College Names */}
                <tr>
                  {/* Left Logo Cell */}
                  <td
                    rowSpan={3}
                    className="w-[110px] text-center align-middle p-2 border-r-2 border-b border-black bg-white"
                  >
                    <img
                      src="/assets/srkr-emblem.png"
                      alt="SRKR Seal"
                      className="w-18 h-18 mx-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
                      }}
                    />
                  </td>

                  {/* Main Institution Header */}
                  <td colSpan={10} className="text-center p-2 border-b border-black">
                    <h1 className="text-[13px] sm:text-[14px] font-black tracking-tight text-black uppercase font-serif">
                      SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (A)
                    </h1>
                    <p className="text-[10px] font-bold text-black uppercase tracking-wider">
                      CHINNAAMIRAM :: BHIMAVARAM-534204
                    </p>
                    <p className="text-[10.5px] font-black text-black uppercase tracking-tight mt-0.5 font-serif">
                      {facultyDept}
                    </p>
                    <div className="text-[11px] font-black uppercase text-black tracking-wider mt-0.5 border-t border-black/50 pt-0.5">
                      {isLabSubject
                        ? 'STATEMENT OF LABORATORY SESSIONAL MARKS (100% DIRECT INTERNAL EVALUATION)'
                        : isOESubject
                        ? 'STATEMENT OF OPEN ELECTIVE SESSIONAL MARKS'
                        : selectedSheetType.includes('SESSIONAL')
                        ? 'STATEMENT OF SESSIONAL MARKS (80:20 WEIGHTED FORMULA)'
                        : `${selectedSheetType === 'MID_1' ? 'MID-1' : 'MID-2'} EXAMINATION MARKS STATEMENT`}
                    </div>
                  </td>
                </tr>

                {/* Row 2: Metadata Grid */}
                <tr className="text-center font-bold text-[10px] border-b border-black bg-slate-50/50">
                  <td className="border-r border-black p-1 text-slate-700 w-24">Academic Year</td>
                  <td className="border-r border-black p-1 text-black w-24 font-mono font-bold">
                    {selectedSection?.academicYear || '2025-2026'}
                  </td>
                  <td className="border-r border-black p-1 text-slate-700 w-20">Class/Sem</td>
                  <td className="border-r border-black p-1 text-black w-28 font-mono font-bold">{classSemString}</td>
                  <td className="border-r border-black p-1 text-slate-700 w-16">Branch</td>
                  <td className="border-r border-black p-1 text-black w-16 font-mono font-bold">{branchString}</td>
                  <td className="border-r border-black p-1 text-slate-700 w-16">Section</td>
                  <td className="border-r border-black p-1 text-black w-16 font-mono font-bold">{sectionLetter}</td>
                  <td className="border-r border-black p-1 text-slate-700 w-20">Max. Marks</td>
                  <td className="p-1 text-black font-black font-mono w-14">30</td>
                </tr>

                {/* Row 3: Course Name & Subject Teacher */}
                <tr className="font-bold text-[10px] border-b border-black">
                  <td className="border-r border-black p-1.5 text-slate-700 text-center">Course Name</td>
                  <td colSpan={3} className="border-r border-black p-1.5 text-black font-mono text-left pl-2 font-bold">
                    {currentSubject ? `${currentSubject.subjectCode} - ${currentSubject.subjectName}` : '—'}
                    {isLabSubject && (
                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">
                        LAB COURSE
                      </span>
                    )}
                    {isOESubject && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold rounded">
                        OPEN ELECTIVE
                      </span>
                    )}
                  </td>
                  <td colSpan={2} className="border-r border-black p-1.5 text-slate-700 text-center">
                    Subject Teacher
                  </td>
                  <td colSpan={4} className="p-1.5 text-black font-bold text-left pl-2">
                    {facultyName}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ========================================================================= */}
            {/* VIEW A: SESSIONAL TABLE (Direct for Lab, 80:20 for Theory) */}
            {/* ========================================================================= */}
            {selectedSheetType === 'SESSIONAL' ? (
              isLabSubject ? (
                <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[10px] font-sans mt-[-1px]">
                  <thead>
                    <tr className="bg-slate-100 text-black font-bold border-b border-black text-center text-[10.5px]">
                      <th className="border-r border-black px-2 py-1.5 w-12">S.No</th>
                      <th className="border-r border-black px-3 py-1.5 w-32">Register No</th>
                      <th className="border-r border-black px-4 py-1.5 text-left min-w-[200px]">Student Name</th>
                      <th className="border-r border-black px-3 py-1.5 w-36 bg-blue-50">Lab Internal Marks (/30)</th>
                      <th className="border-r border-black px-3 py-1.5 w-36 bg-yellow-100 text-[#0A2566] font-black">
                        Final Sessional (/30)
                      </th>
                      <th className="border-r border-black px-3 py-1.5 min-w-[140px] text-left">Marks in Words</th>
                      <th className="px-3 py-1.5 w-28">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sessionalsData.map((row) => {
                      const isPassed = row.status === 'PASSED';
                      const isPending = row.status === 'INCOMPLETE';

                      return (
                        <tr
                          key={row.studentId}
                          className="border-b border-black text-center font-medium hover:bg-yellow-50/40"
                        >
                          <td className="border-r border-black px-1.5 py-1 text-slate-700 font-mono">{row.sNo}</td>
                          <td className="border-r border-black px-2 py-1 font-mono font-bold text-black whitespace-nowrap">
                            {row.registerNumber}
                          </td>
                          <td className="border-r border-black px-3 py-1 text-left font-semibold text-black">
                            {row.name}
                          </td>
                          <td className="border-r border-black px-2 py-1 font-mono font-bold text-slate-900 bg-blue-50/40">
                            {row.sessionalTotal !== null ? row.sessionalTotal : '—'}
                          </td>
                          <td className="border-r border-black px-2.5 py-1 font-mono font-black text-black text-[11px] bg-yellow-50">
                            {row.sessionalTotal !== null ? row.sessionalTotal : '—'}
                          </td>
                          <td className="border-r border-black px-3 py-1 font-mono text-[9px] font-bold text-slate-800 text-left uppercase whitespace-nowrap">
                            {markToWords(row.sessionalTotal)}
                          </td>
                          <td className="px-2 py-1 font-bold text-[9px] uppercase">
                            {isPending ? (
                              <span className="text-slate-500">Incomplete</span>
                            ) : isPassed ? (
                              <span className="text-emerald-700">Passed</span>
                            ) : (
                              <span className="text-amber-700">Improvement</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[10px] font-sans mt-[-1px]">
                  <thead>
                    <tr className="bg-slate-100 text-black font-bold border-b border-black text-center text-[10.5px]">
                      <th className="border-r border-black px-2 py-1.5 w-10">S.No</th>
                      <th className="border-r border-black px-2.5 py-1.5 w-28">Register No</th>
                      <th className="border-r border-black px-3 py-1.5 text-left min-w-[160px]">Student Name</th>
                      <th className="border-r border-black px-2 py-1.5 w-20 bg-slate-50">Mid-1 (/30)</th>
                      <th className="border-r border-black px-2 py-1.5 w-20 bg-slate-50">Mid-2 (/30)</th>
                      <th className="border-r border-black px-2.5 py-1.5 w-28 bg-slate-200">Higher Mid (80%)</th>
                      <th className="border-r border-black px-2.5 py-1.5 w-28 bg-slate-200">Lower Mid (20%)</th>
                      <th className="border-r border-black px-3 py-1.5 w-32 bg-yellow-100 text-[#0A2566] font-black">
                        Final Sessional (/30)
                      </th>
                      <th className="px-3 py-1.5 w-24">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sessionalsData.map((row) => {
                      const isPassed = row.status === 'PASSED';
                      const isPending = row.status === 'INCOMPLETE';

                      return (
                        <tr
                          key={row.studentId}
                          className="border-b border-black text-center font-medium hover:bg-yellow-50/40"
                        >
                          <td className="border-r border-black px-1.5 py-1 text-slate-700 font-mono">{row.sNo}</td>
                          <td className="border-r border-black px-2 py-1 font-mono font-bold text-black whitespace-nowrap">
                            {row.registerNumber}
                          </td>
                          <td className="border-r border-black px-3 py-1 text-left font-semibold text-black">
                            {row.name}
                          </td>
                          <td className="border-r border-black px-2 py-1 font-mono">
                            {row.mid1 !== null ? row.mid1 : '—'}
                          </td>
                          <td className="border-r border-black px-2 py-1 font-mono">
                            {row.mid2 !== null ? row.mid2 : '—'}
                          </td>
                          <td className="border-r border-black px-2 py-1 font-mono font-bold text-slate-800 bg-slate-50/50">
                            {row.higherMid !== null ? row.higherMid : '—'}
                          </td>
                          <td className="border-r border-black px-2 py-1 font-mono font-bold text-slate-800 bg-slate-50/50">
                            {row.lowerMid !== null ? row.lowerMid : '—'}
                          </td>
                          <td className="border-r border-black px-2.5 py-1 font-mono font-black text-black text-[11px] bg-yellow-50">
                            {row.sessionalTotal !== null ? row.sessionalTotal : '—'}
                          </td>
                          <td className="px-2 py-1 font-bold text-[9px] uppercase">
                            {isPending ? (
                              <span className="text-slate-500">Incomplete</span>
                            ) : isPassed ? (
                              <span className="text-emerald-700">Passed</span>
                            ) : (
                              <span className="text-amber-700">Improvement</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              /* ========================================================================= */
              /* VIEW B: DUAL-COLUMN CONDENSED ROSTER (IN FIGURES & WORDS) */
              /* ========================================================================= */
              <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[10px] font-sans mt-[-1px]">
                <thead>
                  <tr className="bg-slate-100 text-black font-bold border-b border-black text-center text-[10.5px]">
                    {/* Left Half */}
                    <th rowSpan={2} className="border-r border-black px-1.5 py-1 w-9 align-middle">
                      Sl.No
                    </th>
                    <th rowSpan={2} className="border-r border-black px-2 py-1 w-24 align-middle">
                      REG NO
                    </th>
                    <th rowSpan={2} className="border-r border-black px-2 py-1 text-left min-w-[130px] align-middle">
                      STUDENT NAME
                    </th>
                    <th colSpan={2} className="border-r-2 border-black px-2 py-1 bg-slate-200 text-center">
                      Total Marks (30M)
                    </th>

                    {/* Right Half */}
                    <th rowSpan={2} className="border-r border-black px-1.5 py-1 w-9 align-middle">
                      Sl.No
                    </th>
                    <th rowSpan={2} className="border-r border-black px-2 py-1 w-24 align-middle">
                      REG NO
                    </th>
                    <th rowSpan={2} className="border-r border-black px-2 py-1 text-left min-w-[130px] align-middle">
                      STUDENT NAME
                    </th>
                    <th colSpan={2} className="px-2 py-1 bg-slate-200 text-center">
                      Total Marks (30M)
                    </th>
                  </tr>

                  <tr className="bg-slate-50 text-black font-bold border-b border-black text-center text-[9px]">
                    <th className="border-r border-black px-1.5 py-0.5 w-14">IN FIGURES</th>
                    <th className="border-r-2 border-black px-2 py-0.5 min-w-[105px]">IN WORDS</th>

                    <th className="border-r border-black px-1.5 py-0.5 w-14">IN FIGURES</th>
                    <th className="px-2 py-0.5 min-w-[105px]">IN WORDS</th>
                  </tr>
                </thead>

                <tbody>
                  {leftColumn.map((leftItem, idx) => {
                    const rightItem = rightColumn[idx];

                    return (
                      <tr
                        key={leftItem.registerNumber}
                        className="border-b border-black text-center font-medium hover:bg-yellow-50/40"
                      >
                        {/* Left Student */}
                        <td className="border-r border-black px-1 py-0.5 text-slate-700 font-mono">{leftItem.sNo}</td>
                        <td className="border-r border-black px-1.5 py-0.5 font-mono font-bold text-black whitespace-nowrap">
                          {leftItem.registerNumber}
                        </td>
                        <td className="border-r border-black px-2 py-0.5 text-left truncate max-w-[140px] font-semibold text-black">
                          {leftItem.name}
                        </td>
                        <td className="border-r border-black px-1 py-0.5 font-mono font-bold text-black bg-slate-50/30">
                          {leftItem.totalFigures}
                        </td>
                        <td className="border-r-2 border-black px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-slate-800 text-left uppercase whitespace-nowrap">
                          {leftItem.totalWords}
                        </td>

                        {/* Right Student */}
                        {rightItem ? (
                          <>
                            <td className="border-r border-black px-1 py-0.5 text-slate-700 font-mono">
                              {rightItem.sNo}
                            </td>
                            <td className="border-r border-black px-1.5 py-0.5 font-mono font-bold text-black whitespace-nowrap">
                              {rightItem.registerNumber}
                            </td>
                            <td className="border-r border-black px-2 py-0.5 text-left truncate max-w-[140px] font-semibold text-black">
                              {rightItem.name}
                            </td>
                            <td className="border-r border-black px-1 py-0.5 font-mono font-bold text-black bg-slate-50/30">
                              {rightItem.totalFigures}
                            </td>
                            <td className="px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-slate-800 text-left uppercase whitespace-nowrap">
                              {rightItem.totalWords}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border-r border-black px-1 py-0.5"></td>
                            <td className="border-r border-black px-1.5 py-0.5"></td>
                            <td className="border-r border-black px-2 py-0.5"></td>
                            <td className="border-r border-black px-1.5 py-0.5"></td>
                            <td className="px-1.5 py-0.5"></td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Official Signature Footer Block */}
            <div className="mt-8 pt-4 flex items-center justify-between text-xs font-bold text-black px-4">
              <div>
                <p className="font-semibold text-slate-600 text-[10px]">Verified By:</p>
                <p className="mt-6 border-t border-black pt-1 w-44 text-center">
                  Signature with Date
                </p>
              </div>

              <div className="text-center">
                <p className="font-semibold text-slate-600 text-[10px]">Head of Department:</p>
                <p className="mt-6 border-t border-black pt-1 w-44 text-center">
                  HOD Signature
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-slate-600 text-[10px]">Subject Teacher:</p>
                <p className="mt-6 border-t border-black pt-1 w-44 text-center ml-auto">
                  Signature with Date
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
