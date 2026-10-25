import React, { useState, useEffect } from 'react';
import { Save, Sparkles, RotateCcw, Check, AlertCircle, Loader2, ChevronDown, FileSpreadsheet, FlaskConical, Globe } from 'lucide-react';
import { SectionItem, SubjectItem, ExamItem, StudentMarkRow, facultyApi } from '../../services/api';
import { formatSectionLabel, getSemestersForSection } from '../../utils/academicYearHelper';
import { isLabCourse, isOpenElectiveCourse } from '../../utils/r23Curriculum';

interface MarksEntryTabProps {
  sections: SectionItem[];
  selectedSection: SectionItem | null;
  onSelectSection: (sec: SectionItem) => void;
}

export const MarksEntryTab: React.FC<MarksEntryTabProps> = ({
  sections,
  selectedSection,
  onSelectSection,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(
    selectedSection?.semester || 3
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const [studentRows, setStudentRows] = useState<StudentMarkRow[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync selectedSemester when selectedSection changes
  useEffect(() => {
    if (selectedSection) {
      setSelectedSemester(selectedSection.semester);
    }
  }, [selectedSection]);

  // Current subject & Lab/OE check
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const isLab = currentSubject ? isLabCourse(currentSubject.subjectCode, currentSubject.subjectName) : false;
  const isOE = currentSubject ? (isOpenElectiveCourse(currentSubject.subjectCode, currentSubject.subjectName) || currentSubject.isOpenElective || false) : false;

  // Open Elective Entry Mode: 'MID_1' | 'MID_2' | 'SESSIONAL'
  const [oeMode, setOeMode] = useState<'MID_1' | 'MID_2' | 'SESSIONAL'>('MID_1');

  // 1. When selectedSection or selectedSemester changes, load isolated subjects & exams
  useEffect(() => {
    if (!selectedSection) return;

    let isMounted = true;
    const loadMetadata = async () => {
      try {
        setLoadingSubjects(true);
        const [subRes, examRes] = await Promise.all([
          facultyApi.getSubjects(selectedSection.branch, selectedSemester),
          facultyApi.getExams(selectedSection.academicYear, selectedSemester),
        ]);

        if (isMounted) {
          setSubjects(subRes.subjects);
          setExams(examRes.exams);
          if (subRes.subjects.length > 0) {
            const firstSub = subRes.subjects[0];
            setSelectedSubjectId(firstSub.id);
            const firstIsLab = isLabCourse(firstSub.subjectCode, firstSub.subjectName);
            if (examRes.exams.length > 0) {
              if (firstIsLab) {
                const labExam = examRes.exams.find((e) => e.examType === 'LAB_INTERNAL');
                setSelectedExamId(labExam ? labExam.id : examRes.exams[0].id);
              } else {
                const mid1Exam = examRes.exams.find((e) => e.examType === 'MID_1');
                setSelectedExamId(mid1Exam ? mid1Exam.id : examRes.exams[0].id);
              }
            } else {
              setSelectedExamId('');
            }
          } else {
            setSelectedSubjectId('');
            setSelectedExamId('');
          }
        }
      } catch (err) {
        console.error('Failed to load subjects/exams:', err);
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSemester]);

  // 2. Adjust selected exam when subject changes (Lab vs Theory)
  useEffect(() => {
    if (exams.length === 0) {
      setSelectedExamId('');
      return;
    }

    if (isLab) {
      // Find LAB_INTERNAL exam or fallback
      const labExam = exams.find((e) => e.examType === 'LAB_INTERNAL');
      setSelectedExamId(labExam ? labExam.id : exams[0].id);
    } else if (isOE) {
      if (oeMode === 'MID_2') {
        const mid2Exam = exams.find((e) => e.examType === 'MID_2');
        setSelectedExamId(mid2Exam ? mid2Exam.id : exams[0].id);
      } else {
        const mid1Exam = exams.find((e) => e.examType === 'MID_1');
        setSelectedExamId(mid1Exam ? mid1Exam.id : exams[0].id);
      }
    } else {
      // Find MID_1 exam or fallback
      const mid1Exam = exams.find((e) => e.examType === 'MID_1');
      setSelectedExamId(mid1Exam ? mid1Exam.id : exams[0].id);
    }
  }, [selectedSubjectId, exams, isLab, isOE, oeMode]);

  const handleSelectOeMode = (mode: 'MID_1' | 'MID_2' | 'SESSIONAL') => {
    setOeMode(mode);
    if (mode === 'MID_1' || mode === 'SESSIONAL') {
      const mid1 = exams.find((e) => e.examType === 'MID_1');
      if (mid1) setSelectedExamId(mid1.id);
    } else if (mode === 'MID_2') {
      const mid2 = exams.find((e) => e.examType === 'MID_2');
      if (mid2) setSelectedExamId(mid2.id);
    }
  };

  // 3. When section, subject, and exam are all selected, load the student rows
  useEffect(() => {
    if (!selectedSection || !selectedSubjectId || !selectedExamId) {
      setStudentRows([]);
      return;
    }

    let isMounted = true;
    const loadRows = async () => {
      try {
        setLoadingMarks(true);
        setStatusMessage(null);
        const res = await facultyApi.getSectionMarks(
          selectedSection.id,
          selectedSubjectId,
          selectedExamId
        );
        if (isMounted) {
          setStudentRows(res.students);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatusMessage({
            type: 'error',
            text: err.response?.data?.message || 'Failed to load students and marks.',
          });
        }
      } finally {
        if (isMounted) setLoadingMarks(false);
      }
    };

    loadRows();
    return () => {
      isMounted = false;
    };
  }, [selectedSection, selectedSubjectId, selectedExamId]);

  // 4. Handle Cell Change for Theory & Lab
  const handleCellChange = (
    index: number,
    field: keyof StudentMarkRow,
    value: string
  ) => {
    const updated = [...studentRows];
    const row = { ...updated[index] };

    if (isLab || isOE) {
      // Direct single score (0 to 30) for Lab or Open Elective
      if (value === '') {
        row.total = 0;
        row.assignmentMarks = '';
      } else {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          const val = Math.min(30, Math.max(0, parsed));
          row.total = val;
          row.assignmentMarks = val;
        }
      }
      updated[index] = row;
      setStudentRows(updated);
      return;
    }

    // Theory question cell change
    let numVal: number | string = value;
    if (value !== '') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) return;

      if (['descriptiveQ1OrQ2', 'descriptiveQ3OrQ4', 'descriptiveQ5OrQ6', 'assignmentMarks'].includes(field)) {
        numVal = Math.min(5, Math.max(0, parsed));
      } else if (['objectiveQ1', 'objectiveQ2', 'objectiveQ3', 'objectiveQ4', 'objectiveQ5'].includes(field)) {
        numVal = Math.min(2, Math.max(0, parsed));
      } else {
        numVal = parsed;
      }
    }

    (row as any)[field] = numVal;

    // Recalculate Theory Totals
    const q1 = typeof row.descriptiveQ1OrQ2 === 'number' ? row.descriptiveQ1OrQ2 : parseFloat(row.descriptiveQ1OrQ2) || 0;
    const q2 = typeof row.descriptiveQ3OrQ4 === 'number' ? row.descriptiveQ3OrQ4 : parseFloat(row.descriptiveQ3OrQ4) || 0;
    const q3 = typeof row.descriptiveQ5OrQ6 === 'number' ? row.descriptiveQ5OrQ6 : parseFloat(row.descriptiveQ5OrQ6) || 0;
    row.descriptiveTotal = parseFloat((q1 + q2 + q3).toFixed(2));

    const o1 = typeof row.objectiveQ1 === 'number' ? row.objectiveQ1 : parseFloat(row.objectiveQ1) || 0;
    const o2 = typeof row.objectiveQ2 === 'number' ? row.objectiveQ2 : parseFloat(row.objectiveQ2) || 0;
    const o3 = typeof row.objectiveQ3 === 'number' ? row.objectiveQ3 : parseFloat(row.objectiveQ3) || 0;
    const o4 = typeof row.objectiveQ4 === 'number' ? row.objectiveQ4 : parseFloat(row.objectiveQ4) || 0;
    const o5 = typeof row.objectiveQ5 === 'number' ? row.objectiveQ5 : parseFloat(row.objectiveQ5) || 0;
    row.objectiveTotal = parseFloat((o1 + o2 + o3 + o4 + o5).toFixed(2));

    const assign = typeof row.assignmentMarks === 'number' ? row.assignmentMarks : parseFloat(row.assignmentMarks) || 0;

    row.total = parseFloat((row.descriptiveTotal + row.objectiveTotal + assign).toFixed(2));

    updated[index] = row;
    setStudentRows(updated);
  };

  // 5. Quick Sample Auto-Fill
  const handleQuickSampleFill = () => {
    const filled = studentRows.map((row) => {
      if (isLab || isOE) {
        // Realistic direct marks (21 to 29.5)
        const score = parseFloat((22 + Math.random() * 7.5).toFixed(1));
        return {
          ...row,
          assignmentMarks: score,
          total: score,
        };
      }

      // Theory Marks
      const q1 = Math.floor(Math.random() * 2) + 3.5;
      const q2 = Math.floor(Math.random() * 2) + 3.5;
      const q3 = Math.floor(Math.random() * 2) + 3.0;
      const descTotal = parseFloat((q1 + q2 + q3).toFixed(2));

      const o1 = Math.random() > 0.15 ? 2 : 1;
      const o2 = Math.random() > 0.15 ? 2 : 1.5;
      const o3 = 2;
      const o4 = Math.random() > 0.2 ? 2 : 1;
      const o5 = 2;
      const objTotal = parseFloat((o1 + o2 + o3 + o4 + o5).toFixed(2));

      const assign = 5;
      const total = parseFloat((descTotal + objTotal + assign).toFixed(2));

      return {
        ...row,
        descriptiveQ1OrQ2: q1,
        descriptiveQ3OrQ4: q2,
        descriptiveQ5OrQ6: q3,
        descriptiveTotal: descTotal,
        objectiveQ1: o1,
        objectiveQ2: o2,
        objectiveQ3: o3,
        objectiveQ4: o4,
        objectiveQ5: o5,
        objectiveTotal: objTotal,
        assignmentMarks: assign,
        total,
      };
    });

    setStudentRows(filled);
    setStatusMessage({
      type: 'success',
      text: isOE
        ? `Filled realistic ${oeMode === 'SESSIONAL' ? 'Total Sessional' : oeMode === 'MID_1' ? 'Direct Mid-1' : 'Direct Mid-2'} marks (0–30M) for ${filled.length} students. Click "Save All Marks" to commit.`
        : isLab
        ? `Filled realistic single internal lab marks (0–30M) for ${filled.length} students.`
        : `Filled realistic Mid marks for ${filled.length} students. Click "Save All Marks" to commit.`,
    });
  };

  // 6. Clear All
  const handleClearAll = () => {
    const cleared = studentRows.map((row) => ({
      ...row,
      descriptiveQ1OrQ2: '',
      descriptiveQ3OrQ4: '',
      descriptiveQ5OrQ6: '',
      descriptiveTotal: 0,
      objectiveQ1: '',
      objectiveQ2: '',
      objectiveQ3: '',
      objectiveQ4: '',
      objectiveQ5: '',
      objectiveTotal: 0,
      assignmentMarks: '',
      total: 0,
    }));
    setStudentRows(cleared);
  };

  // 7. Save All Marks
  const handleSaveMarks = async () => {
    if (!selectedSection || !selectedSubjectId || !selectedExamId) return;

    try {
      setIsSaving(true);
      setStatusMessage(null);

      const payload = {
        sectionId: selectedSection.id,
        subjectId: selectedSubjectId,
        examId: selectedExamId,
        oeMode: isOE ? oeMode : undefined,
        marks: studentRows.map((r) => ({
          studentId: r.studentId,
          descriptiveQ1OrQ2: r.descriptiveQ1OrQ2,
          descriptiveQ3OrQ4: r.descriptiveQ3OrQ4,
          descriptiveQ5OrQ6: r.descriptiveQ5OrQ6,
          objectiveQ1: r.objectiveQ1,
          objectiveQ2: r.objectiveQ2,
          objectiveQ3: r.objectiveQ3,
          objectiveQ4: r.objectiveQ4,
          objectiveQ5: r.objectiveQ5,
          assignmentMarks: r.assignmentMarks,
          total: r.total,
        })),
      };

      const res = await facultyApi.saveSectionMarks(payload);

      setStudentRows((prev) => prev.map((r) => ({ ...r, isSaved: true })));
      setStatusMessage({
        type: 'success',
        text: `✓ ${res.message || 'Marks saved successfully.'}`,
      });
    } catch (err: any) {
      console.error('Save failed:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save marks to the database.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered exams for dropdown
  const availableExams = isLab
    ? exams.filter((e) => e.examType === 'LAB_INTERNAL' || e.examType === 'MID_1')
    : exams.filter((e) => e.examType === 'MID_1' || e.examType === 'MID_2');

  return (
    <div className="space-y-5 select-none">
      {/* ========================================================================= */}
      {/* 1. FILTER & CONTROLS TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:bg-white appearance-none cursor-pointer"
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
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:bg-white appearance-none cursor-pointer"
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
                disabled={loadingSubjects || subjects.length === 0}
                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100"
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

          {/* 4. Exam Selector / OE Mode indicator */}
          <div>
            <label className="block text-xs font-bold text-[#0A2566] uppercase tracking-wider mb-1.5">
              4. Examination Period
            </label>
            <div className="relative">
              {isOE ? (
                <div className="w-full pl-3.5 pr-4 py-2 bg-amber-50/80 border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-[#0A2566] flex items-center justify-between shadow-xs">
                  <span className="flex items-center gap-1.5 truncate">
                    <Globe className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="truncate">
                      {oeMode === 'MID_1'
                        ? 'Direct MID-1 Evaluation'
                        : oeMode === 'MID_2'
                        ? 'Direct MID-2 Evaluation'
                        : 'Direct Sessional Evaluation'}
                    </span>
                  </span>
                  <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                    Max 30M
                  </span>
                </div>
              ) : (
                <>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    disabled={availableExams.length === 0}
                    className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:bg-white appearance-none cursor-pointer disabled:bg-slate-100"
                  >
                    {availableExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.examType === 'LAB_INTERNAL'
                          ? '🔬 Lab Internal Examination (Max 30M)'
                          : ex.examType === 'MID_1'
                          ? isLab
                            ? '🔬 Lab Internal Examination (Max 30M)'
                            : 'MID-1 Examination'
                          : 'MID-2 Examination'}{' '}
                        ({ex.academicYear})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Open Elective 3-Option Entry Mode Selector Banner */}
        {isOE && (
          <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-blue-50/40 to-indigo-50/40 border-2 border-amber-300 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                  <Globe className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#0A2566] tracking-tight">
                    Open Elective (OE) Marks Entry Options
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Select how you want to enter marks for this Open Elective subject:
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full w-fit">
                Open Elective Mode Active
              </span>
            </div>

            {/* 3 Interactive Mode Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Direct MID-1 Marks */}
              <button
                type="button"
                onClick={() => handleSelectOeMode('MID_1')}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                  oeMode === 'MID_1'
                    ? 'bg-white border-[#146EF5] shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-xs font-bold transition-colors ${
                    oeMode === 'MID_1'
                      ? 'bg-[#146EF5] text-white'
                      : 'border-2 border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black text-[#0A2566]">1. Direct MID-1 Marks</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Enter direct Mid-1 marks (0–30) without question-by-question breakdown.
                  </p>
                </div>
              </button>

              {/* Option 2: Direct MID-2 Marks */}
              <button
                type="button"
                onClick={() => handleSelectOeMode('MID_2')}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                  oeMode === 'MID_2'
                    ? 'bg-white border-[#146EF5] shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-xs font-bold transition-colors ${
                    oeMode === 'MID_2'
                      ? 'bg-[#146EF5] text-white'
                      : 'border-2 border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black text-[#0A2566]">2. Direct MID-2 Marks</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Enter direct Mid-2 marks (0–30). Calculates 80:20 formula with Mid-1.
                  </p>
                </div>
              </button>

              {/* Option 3: Direct Total Sessional Marks */}
              <button
                type="button"
                onClick={() => handleSelectOeMode('SESSIONAL')}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                  oeMode === 'SESSIONAL'
                    ? 'bg-white border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-xs font-bold transition-colors ${
                    oeMode === 'SESSIONAL'
                      ? 'bg-amber-500 text-white'
                      : 'border-2 border-slate-300 text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div>
                  <p className="text-xs font-black text-[#0A2566] flex items-center gap-1.5">
                    <span>3. Total Sessional Marks</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Recommended</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Enter consolidated final internal mark (0–30) directly in one step.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Lab / Theory Notification Pill */}
        {isLab && (
          <div className="mt-3.5 px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs text-purple-800 font-medium">
            <FlaskConical className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>
              <strong>Laboratory Evaluation Mode:</strong> This course has a single internal examination (Max 30 Marks). Enter the direct lab internal score for each candidate (No 80:20 formula).
            </span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Class Strength:</span>
            <span className="text-xs font-black text-[#0A2566] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md">
              {studentRows.length} Students
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Sample Fill Button */}
            <button
              type="button"
              onClick={handleQuickSampleFill}
              disabled={loadingMarks || studentRows.length === 0}
              className="flex items-center gap-1.5 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition"
              title="Auto-fill realistic marks for instant verification"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Sample Auto-Fill</span>
            </button>

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClearAll}
              disabled={loadingMarks || studentRows.length === 0}
              className="flex items-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveMarks}
              disabled={isSaving || loadingMarks || studentRows.length === 0}
              className="flex items-center gap-2 py-2 px-5 bg-[#146EF5] hover:bg-[#0D5EDB] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition duration-150 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Marks</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SPREADSHEET MARKS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loadingMarks ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#146EF5]" />
            <p className="text-sm font-semibold">Loading student roster and marks data...</p>
          </div>
        ) : studentRows.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No students found for this section.</p>
            <p className="text-xs text-slate-400 mt-1">Please select an active section from the dropdown above.</p>
          </div>
        ) : isLab ? (
          /* ===================================================================== */
          /* LAB SINGLE INTERNAL MARKS TABLE */
          /* ===================================================================== */
          <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0A2566] text-white sticky top-0 z-20">
                <tr>
                  <th className="px-3.5 py-3 text-center w-12 border-r border-blue-900/60">S.No</th>
                  <th className="px-4 py-3 w-36 border-r border-blue-900/60">Register No</th>
                  <th className="px-4 py-3 min-w-[220px] border-r border-blue-900/60">Student Full Name</th>
                  <th className="px-4 py-3 text-center w-48 bg-[#146EF5] font-extrabold border-r border-blue-900/60">
                    Lab Internal Marks <span className="text-[10px] text-yellow-200">(Max 30)</span>
                  </th>
                  <th className="px-4 py-3 text-center w-36 bg-[#0E2F7D]">Evaluation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRows.map((row, idx) => {
                  const isHigh = row.total >= 24;
                  const isPass = row.total >= 12;

                  return (
                    <tr key={row.studentId} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono text-[11px]">
                        {row.sNo}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-[#0A2566]">
                        {row.registerNumber}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 text-center bg-blue-50/30 border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="30"
                            value={row.total === 0 ? (row.assignmentMarks !== '' ? row.assignmentMarks : '') : row.total}
                            onChange={(e) => handleCellChange(idx, 'total', e.target.value)}
                            placeholder="0 - 30"
                            className="w-24 text-center py-1.5 px-2 bg-white border border-slate-300 rounded-lg font-bold text-sm text-[#0A2566] focus:outline-none focus:border-[#146EF5] focus:ring-2 focus:ring-blue-100 shadow-xs"
                          />
                          <span className="text-xs text-slate-400 font-mono">/ 30</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isPass
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : row.total > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isHigh ? 'Excellent' : isPass ? 'Qualified' : row.total > 0 ? 'Needs Attention' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : isOE ? (
          /* ===================================================================== */
          /* OPEN ELECTIVE (OE) DIRECT MARKS TABLE */
          /* ===================================================================== */
          <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gradient-to-r from-[#0A2566] via-[#1E3A8A] to-[#146EF5] text-white sticky top-0 z-20">
                <tr>
                  <th className="px-3.5 py-3 text-center w-12 border-r border-blue-900/60">S.No</th>
                  <th className="px-4 py-3 w-36 border-r border-blue-900/60">Register No</th>
                  <th className="px-4 py-3 min-w-[220px] border-r border-blue-900/60">Student Full Name</th>
                  <th className="px-4 py-3 text-center w-56 bg-amber-400 font-extrabold text-[#0A2566] border-r border-amber-500 shadow-inner">
                    <span className="flex items-center justify-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#0A2566]" />
                      <span>
                        {oeMode === 'MID_1'
                          ? 'MID-1 Direct Marks (Max 30)'
                          : oeMode === 'MID_2'
                          ? 'MID-2 Direct Marks (Max 30)'
                          : 'Total Sessional Marks (Max 30)'}
                      </span>
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center w-36 bg-[#0E2F7D]">Evaluation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRows.map((row, idx) => {
                  const isHigh = row.total >= 24;
                  const isPass = row.total >= 12;

                  return (
                    <tr key={row.studentId} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-3.5 py-2.5 text-center text-slate-400 font-mono text-[11px]">
                        {row.sNo}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-[#0A2566]">
                        {row.registerNumber}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 text-center bg-amber-50/20 border-r border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="30"
                            value={row.total === 0 ? (row.assignmentMarks !== '' ? row.assignmentMarks : '') : row.total}
                            onChange={(e) => handleCellChange(idx, 'total', e.target.value)}
                            placeholder="0 - 30"
                            className="w-24 text-center py-1.5 px-2 bg-white border border-amber-300 rounded-lg font-bold text-sm text-[#0A2566] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 shadow-xs"
                          />
                          <span className="text-xs text-slate-400 font-mono">/ 30</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isPass
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : row.total > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isHigh ? 'Excellent' : isPass ? 'Qualified' : row.total > 0 ? 'Needs Attention' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ===================================================================== */
          /* THEORY TWO-MID DETAILED QUESTIONS TABLE */
          /* ===================================================================== */
          <div className="overflow-x-auto max-h-[640px] scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#0A2566] text-white sticky top-0 z-20">
                <tr>
                  <th colSpan={3} className="px-3.5 py-2.5 text-center font-bold border-r border-blue-900/60 bg-[#0A2566]">
                    STUDENT IDENTITY
                  </th>
                  <th colSpan={4} className="px-3.5 py-2.5 text-center font-bold border-r border-blue-900/60 bg-[#0E2F7D]">
                    DESCRIPTIVE QUESTIONS (MAX 15)
                  </th>
                  <th colSpan={6} className="px-3.5 py-2.5 text-center font-bold border-r border-blue-900/60 bg-[#123A99]">
                    OBJECTIVE QUESTIONS (MAX 10)
                  </th>
                  <th className="px-3.5 py-2.5 text-center font-bold border-r border-blue-900/60 bg-[#1644B0]">
                    ASSIGNMENT
                  </th>
                  <th className="px-3.5 py-2.5 text-center font-bold bg-[#146EF5]">
                    GRAND TOTAL
                  </th>
                </tr>
                <tr className="bg-[#081F54] text-slate-200 text-[11px] font-semibold border-t border-blue-900/80">
                  <th className="px-2.5 py-2 text-center w-10">S.No</th>
                  <th className="px-3 py-2 w-28">Reg No</th>
                  <th className="px-3 py-2 min-w-[180px] border-r border-blue-900/60">Student Name</th>

                  <th className="px-1.5 py-2 text-center w-14" title="Q1 or Q2 (Max 5)">Q1/Q2 <span className="text-[9px] text-amber-300">(5)</span></th>
                  <th className="px-1.5 py-2 text-center w-14" title="Q3 or Q4 (Max 5)">Q3/Q4 <span className="text-[9px] text-amber-300">(5)</span></th>
                  <th className="px-1.5 py-2 text-center w-14" title="Q5 or Q6 (Max 5)">Q5/Q6 <span className="text-[9px] text-amber-300">(5)</span></th>
                  <th className="px-2 py-2 text-center w-14 bg-[#0E2F7D] font-bold text-white border-r border-blue-900/60">Desc Total <span className="text-[9px] text-amber-300">(15)</span></th>

                  <th className="px-1.5 py-2 text-center w-12" title="Objective Q1 (Max 2)">Q1 <span className="text-[9px] text-cyan-300">(2)</span></th>
                  <th className="px-1.5 py-2 text-center w-12" title="Objective Q2 (Max 2)">Q2 <span className="text-[9px] text-cyan-300">(2)</span></th>
                  <th className="px-1.5 py-2 text-center w-12" title="Objective Q3 (Max 2)">Q3 <span className="text-[9px] text-cyan-300">(2)</span></th>
                  <th className="px-1.5 py-2 text-center w-12" title="Objective Q4 (Max 2)">Q4 <span className="text-[9px] text-cyan-300">(2)</span></th>
                  <th className="px-1.5 py-2 text-center w-12" title="Objective Q5 (Max 2)">Q5 <span className="text-[9px] text-cyan-300">(2)</span></th>
                  <th className="px-2 py-2 text-center w-14 bg-[#123A99] font-bold text-white border-r border-blue-900/60">Obj Total <span className="text-[9px] text-cyan-300">(10)</span></th>

                  <th className="px-2 py-2 text-center w-14 border-r border-blue-900/60">Assign <span className="text-[9px] text-emerald-300">(5)</span></th>
                  <th className="px-3 py-2 text-center w-16 bg-[#146EF5] text-white font-extrabold">Total <span className="text-[9px] text-yellow-200">(30)</span></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {studentRows.map((row, idx) => {
                  const isHigh = row.total >= 24;
                  const isPass = row.total >= 12;

                  return (
                    <tr key={row.studentId} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-2.5 py-2 text-center text-slate-400 font-mono text-[11px]">
                        {row.sNo}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-[#0A2566]">
                        {row.registerNumber}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-700 truncate max-w-[200px] border-r border-slate-200">
                        {row.name}
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="5"
                          value={row.descriptiveQ1OrQ2}
                          onChange={(e) => handleCellChange(idx, 'descriptiveQ1OrQ2', e.target.value)}
                          placeholder="0-5"
                          className="w-12 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="5"
                          value={row.descriptiveQ3OrQ4}
                          onChange={(e) => handleCellChange(idx, 'descriptiveQ3OrQ4', e.target.value)}
                          placeholder="0-5"
                          className="w-12 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="5"
                          value={row.descriptiveQ5OrQ6}
                          onChange={(e) => handleCellChange(idx, 'descriptiveQ5OrQ6', e.target.value)}
                          placeholder="0-5"
                          className="w-12 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="px-2 py-2 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200 font-mono">
                        {row.descriptiveTotal}
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="2"
                          value={row.objectiveQ1}
                          onChange={(e) => handleCellChange(idx, 'objectiveQ1', e.target.value)}
                          placeholder="0-2"
                          className="w-10 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="2"
                          value={row.objectiveQ2}
                          onChange={(e) => handleCellChange(idx, 'objectiveQ2', e.target.value)}
                          placeholder="0-2"
                          className="w-10 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="2"
                          value={row.objectiveQ3}
                          onChange={(e) => handleCellChange(idx, 'objectiveQ3', e.target.value)}
                          placeholder="0-2"
                          className="w-10 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="2"
                          value={row.objectiveQ4}
                          onChange={(e) => handleCellChange(idx, 'objectiveQ4', e.target.value)}
                          placeholder="0-2"
                          className="w-10 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="p-1 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="2"
                          value={row.objectiveQ5}
                          onChange={(e) => handleCellChange(idx, 'objectiveQ5', e.target.value)}
                          placeholder="0-2"
                          className="w-10 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td className="px-2 py-2 text-center font-bold text-slate-700 bg-slate-50 border-r border-slate-200 font-mono">
                        {row.objectiveTotal}
                      </td>

                      <td className="p-1 text-center border-r border-slate-200">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="5"
                          value={row.assignmentMarks}
                          onChange={(e) => handleCellChange(idx, 'assignmentMarks', e.target.value)}
                          placeholder="0-5"
                          className="w-12 text-center py-1 bg-white border border-slate-200 rounded-md font-semibold text-slate-800 focus:outline-none focus:border-[#146EF5] focus:ring-1 focus:ring-blue-200"
                        />
                      </td>

                      <td
                        className={`px-3 py-2 text-center font-extrabold font-mono text-sm ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-700'
                            : isPass
                            ? 'bg-blue-50 text-blue-700'
                            : row.total > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {row.total}
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
