import React, { useState, useRef } from 'react';
import { Download, ExternalLink, FileSpreadsheet, Printer, Loader2, CheckCircle2 } from 'lucide-react';
import { StudentDashboardResponse } from '../../services/api';
import { markToWords, getSRKRClassSem } from '../../utils/marksWordHelper';
import { downloadElementAsPDF, viewElementPDFInNewTab, openNativePrintPDF, saveCsvWithNativeDialog } from '../../utils/pdfExportHelper';

interface StudentPrintGradeTabProps {
  data: StudentDashboardResponse;
}

export const StudentPrintGradeTab: React.FC<StudentPrintGradeTabProps> = ({ data }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const gradeSheetRef = useRef<HTMLDivElement>(null);
  const { student, stats, subjects } = data;
  const classSemString = getSRKRClassSem(student.semester);

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!gradeSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const fileName = `SRKR_GradeSheet_${student.registerNumber}_Sem${student.semester}.pdf`;
      await downloadElementAsPDF(gradeSheetRef.current, fileName);
      setDownloadSuccess(`Downloaded "${fileName}" successfully!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not generate PDF. You can also use "Open PDF" or "Print" to save as PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Open PDF in new tab
  const handleOpenPDFInNewTab = async () => {
    if (!gradeSheetRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const title = `SRKR Grade Sheet - ${student.name} (${student.registerNumber})`;
      await viewElementPDFInNewTab(gradeSheetRef.current, title);
    } catch (err) {
      console.error('Open PDF error:', err);
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export CSV
  const handleDownloadCSV = async () => {
    const lines: string[] = [];
    lines.push('SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)');
    lines.push('CHINNAAMIRAM :: BHIMAVARAM - 534204');
    lines.push('STUDENT STATEMENT OF INTERNAL MID & SESSIONAL MARKS');
    lines.push('');
    lines.push(`Student Name:,${student.name},Register No:,${student.registerNumber}`);
    lines.push(`Branch:,${student.branch},Section:,${student.section},Class/Sem:,${classSemString}`);
    lines.push(`Academic Year:,${student.academicYear},Overall Sessional Average:,${stats.averageSessional} / 30`);
    lines.push('');
    lines.push('S.No,Course Code,Course Name,Mid-1 (/30),Mid-2 (/30),Higher Mid (80%),Lower Mid (20%),Final Sessional (/30),In Words,Result');

    subjects.forEach((sub, idx) => {
      const nameEsc = `"${(sub.subjectName || '').replace(/"/g, '""')}${sub.isLab ? ' [LAB]' : ''}"`;
      const mid1 = sub.isLab ? '— (Lab)' : sub.mid1 ? sub.mid1.total : '';
      const mid2 = sub.isLab ? '— (Lab)' : sub.mid2 ? sub.mid2.total : '';
      const higher = sub.isLab ? '—' : sub.higherMid !== null ? sub.higherMid : '';
      const lower = sub.isLab ? '—' : sub.lowerMid !== null ? sub.lowerMid : '';
      const total = sub.sessionalTotal !== null ? sub.sessionalTotal : '';
      const words = `"${markToWords(sub.sessionalTotal)}"`;
      lines.push(`${idx + 1},${sub.subjectCode},${nameEsc},${mid1},${mid2},${higher},${lower},${total},${words},${sub.status}`);
    });

    const safeName = `SRKR_GradeSheet_${student.registerNumber}_Sem${student.semester}.csv`;
    await saveCsvWithNativeDialog(lines.join('\r\n'), safeName);
    setDownloadSuccess(`Downloaded "${safeName}" spreadsheet successfully!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  // Native print
  const handlePrint = () => {
    if (gradeSheetRef.current) {
      openNativePrintPDF(gradeSheetRef.current, `SRKR_GradeSheet_${student.registerNumber}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Top Controls (Hidden on Print) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#0A2566] font-['Outfit']">
            Official Student Grade Statement
          </h2>
          <p className="text-xs text-slate-500">
            Download or print your certified internal marks statement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-[#0A2566] to-[#146EF5] hover:from-[#081e52] hover:to-[#0d5edb] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition duration-150 cursor-pointer disabled:opacity-50"
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

          {/* Open PDF */}
          <button
            onClick={handleOpenPDFInNewTab}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-[#0A2566] border border-blue-200 rounded-xl text-xs font-bold transition duration-150 cursor-pointer disabled:opacity-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open PDF</span>
          </button>

          {/* Excel */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition duration-150 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition duration-150 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {downloadSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-xs animate-fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess} File ready for academic records or sharing.</span>
        </div>
      )}

      {/* 2. Official Student Grade Sheet Document Container */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 text-black">
        <div
          ref={gradeSheetRef}
          className="w-full max-w-[1080px] mx-auto overflow-x-auto print:overflow-visible bg-white p-4"
        >
          {/* Header Box Table */}
          <table className="w-full border-collapse border-2 border-black text-[11px] font-sans">
            <tbody>
              {/* Row 1: Logo + Header */}
              <tr>
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

                <td colSpan={8} className="text-center p-2 border-b border-black">
                  <h1 className="text-[13px] sm:text-[14px] font-black tracking-tight text-black uppercase font-serif">
                    SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (A)
                  </h1>
                  <p className="text-[10px] font-bold text-black uppercase tracking-wider">
                    CHINNAAMIRAM :: BHIMAVARAM-534204
                  </p>
                  <p className="text-[10.5px] font-black text-black uppercase tracking-tight mt-0.5 font-serif">
                    DEPARTMENT OF {student.branch === 'CSIT' ? 'COMPUTER SCIENCE & INFORMATION TECHNOLOGY' : 'COMPUTER SCIENCE & DESIGN'}
                  </p>
                  <div className="text-[11px] font-black uppercase text-black tracking-wider mt-0.5 border-t border-black/50 pt-0.5">
                    STUDENT STATEMENT OF INTERNAL MID & SESSIONAL MARKS
                  </div>
                </td>
              </tr>

              {/* Row 2: Student Information */}
              <tr className="text-center font-bold text-[10px] border-b border-black bg-slate-50/50">
                <td className="border-r border-black p-1 text-slate-700 w-24">Student Name</td>
                <td colSpan={3} className="border-r border-black p-1 text-black font-mono font-bold text-left pl-2">
                  {student.name}
                </td>
                <td className="border-r border-black p-1 text-slate-700 w-24">Register No</td>
                <td colSpan={3} className="p-1 text-black font-mono font-bold text-left pl-2">
                  {student.registerNumber}
                </td>
              </tr>

              {/* Row 3: Academic Details */}
              <tr className="text-center font-bold text-[10px] border-b border-black">
                <td className="border-r border-black p-1 text-slate-700 w-24">Academic Year</td>
                <td className="border-r border-black p-1 text-black font-mono font-bold w-24">{student.academicYear}</td>
                <td className="border-r border-black p-1 text-slate-700 w-20">Class/Sem</td>
                <td className="border-r border-black p-1 text-black font-mono font-bold w-28">{classSemString}</td>
                <td className="border-r border-black p-1 text-slate-700 w-16">Branch</td>
                <td className="border-r border-black p-1 text-black font-mono font-bold w-16">{student.branch}</td>
                <td className="border-r border-black p-1 text-slate-700 w-16">Section</td>
                <td className="p-1 text-black font-mono font-bold w-16">{student.section}</td>
              </tr>
            </tbody>
          </table>

          {/* Main Subject Table */}
          <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[10px] font-sans mt-[-1px]">
            <thead>
              <tr className="bg-slate-100 text-black font-bold border-b border-black text-center text-[10.5px]">
                <th className="border-r border-black px-2 py-1.5 w-10">S.No</th>
                <th className="border-r border-black px-2.5 py-1.5 w-24">Course Code</th>
                <th className="border-r border-black px-3 py-1.5 text-left min-w-[180px]">Course Title</th>
                <th className="border-r border-black px-2 py-1.5 w-20">Mid-1 (/30)</th>
                <th className="border-r border-black px-2 py-1.5 w-20">Mid-2 (/30)</th>
                <th className="border-r border-black px-2.5 py-1.5 w-24 bg-slate-200">Higher (80%)</th>
                <th className="border-r border-black px-2.5 py-1.5 w-24 bg-slate-200">Lower (20%)</th>
                <th className="border-r border-black px-2 py-1.5 w-24 bg-yellow-100 font-black">
                  Final Sessional
                </th>
                <th className="border-r border-black px-3 py-1.5 min-w-[120px]">In Words</th>
                <th className="px-2.5 py-1.5 w-20">Result</th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((sub, idx) => (
                <tr
                  key={sub.subjectId}
                  className="border-b border-black text-center font-medium hover:bg-yellow-50/40"
                >
                  <td className="border-r border-black px-1.5 py-1 text-slate-700 font-mono">{idx + 1}</td>
                  <td className="border-r border-black px-2 py-1 font-mono font-bold text-black whitespace-nowrap">
                    {sub.subjectCode}
                  </td>
                  <td className="border-r border-black px-3 py-1 text-left font-semibold text-black">
                    <span>{sub.subjectName}</span>
                    {sub.isLab && (
                      <span className="ml-1.5 px-1 py-0.2 bg-blue-100 text-blue-800 text-[8.5px] font-bold rounded">
                        LAB
                      </span>
                    )}
                  </td>
                  <td className="border-r border-black px-2 py-1 font-mono">
                    {sub.isLab ? '—' : sub.mid1 ? sub.mid1.total : '—'}
                  </td>
                  <td className="border-r border-black px-2 py-1 font-mono">
                    {sub.isLab ? '—' : sub.mid2 ? sub.mid2.total : '—'}
                  </td>
                  <td className="border-r border-black px-2 py-1 font-mono font-bold bg-slate-50/50">
                    {sub.isLab ? '—' : sub.higherMid !== null ? sub.higherMid : '—'}
                  </td>
                  <td className="border-r border-black px-2 py-1 font-mono font-bold bg-slate-50/50">
                    {sub.isLab ? '—' : sub.lowerMid !== null ? sub.lowerMid : '—'}
                  </td>
                  <td className="border-r border-black px-2 py-1 font-mono font-black text-black bg-yellow-50">
                    {sub.sessionalTotal !== null ? sub.sessionalTotal : '—'}
                  </td>
                  <td className="border-r border-black px-2 py-1 font-mono text-[9px] font-bold text-slate-800 text-left uppercase whitespace-nowrap">
                    {markToWords(sub.sessionalTotal)}
                  </td>
                  <td className="px-2 py-1 font-bold text-[9px] uppercase">
                    {sub.status === 'PASSED' ? (
                      <span className="text-emerald-700">Passed</span>
                    ) : sub.status === 'FAILED' ? (
                      <span className="text-red-700">Improvement</span>
                    ) : (
                      <span className="text-slate-500">In Progress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total Aggregate Row */}
            <tfoot className="border-t-2 border-black font-bold text-xs bg-slate-50">
              <tr>
                <td colSpan={7} className="border-r border-black px-3 py-1.5 text-right uppercase tracking-wider font-extrabold">
                  Overall Sessional Average
                </td>
                <td className="border-r border-black px-2 py-1.5 text-center font-mono font-black text-sm text-black bg-yellow-100">
                  {stats.averageSessional} / 30
                </td>
                <td colSpan={2} className="px-3 py-1.5 text-center text-emerald-800 font-extrabold">
                  {stats.passedCount} / {stats.totalSubjects} Subjects Cleared
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Official Verification Signatures */}
          <div className="mt-8 pt-4 flex items-center justify-between text-xs font-bold text-black px-4">
            <div>
              <p className="font-semibold text-slate-600 text-[10px]">Student Signature:</p>
              <p className="mt-6 border-t border-black pt-1 w-40 text-center">
                Signature of Student
              </p>
            </div>

            <div className="text-center">
              <p className="font-semibold text-slate-600 text-[10px]">Faculty Mentor / Advisor:</p>
              <p className="mt-6 border-t border-black pt-1 w-40 text-center">
                Faculty Signature
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-slate-600 text-[10px]">Controller of Examinations:</p>
              <p className="mt-6 border-t border-black pt-1 w-44 text-center ml-auto">
                Signature with Date
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
