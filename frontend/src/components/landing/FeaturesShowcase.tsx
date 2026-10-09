import React, { useState } from 'react';
import {
  Calculator,
  FlaskConical,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  GraduationCap,
  Users,
  FileCheck2,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { markToWords } from '../../utils/marksWordHelper';

interface FeaturesShowcaseProps {
  onScrollToTop: () => void;
  onSelectRoleAndFocus?: (role: 'FACULTY' | 'STUDENT') => void;
}

export const FeaturesShowcase: React.FC<FeaturesShowcaseProps> = ({ onScrollToTop, onSelectRoleAndFocus }) => {
  // Interactive 80:20 Sessional Simulator State
  const [mid1Marks, setMid1Marks] = useState<number>(26);
  const [mid2Marks, setMid2Marks] = useState<number>(22);

  // Math computation for 80:20 rule
  const higherMid = Math.max(mid1Marks, mid2Marks);
  const lowerMid = Math.min(mid1Marks, mid2Marks);
  const higherPart = Number((higherMid * 0.8).toFixed(2));
  const lowerPart = Number((lowerMid * 0.2).toFixed(2));
  const sessionalTotal = Number((higherPart + lowerPart).toFixed(1));
  const wordsRepresentation = markToWords(sessionalTotal);

  return (
    <div className="w-full bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#146EF5] selection:text-white border-t border-slate-200/80">
      {/* ========================================================================= */}
      {/* 1. STATS & KEY CAPABILITIES BANNER (Clean Light Theme) */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200/80 py-5 sm:py-8 px-3 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6 text-center">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-100 transition hover:border-blue-300">
            <p className="text-xl sm:text-3xl font-black text-[#0A2566] font-mono">
              80 : 20
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-[#146EF5] uppercase tracking-wider mt-1">
              Autonomous Formula
            </p>
            <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">Automated Theory Sessional</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-100 transition hover:border-emerald-300">
            <p className="text-xl sm:text-3xl font-black text-emerald-800 font-mono">
              100% Direct
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">
              Lab Sessional Mark
            </p>
            <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">Single Internal (No 80:20)</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50/60 border border-indigo-100 transition hover:border-indigo-300">
            <p className="text-xl sm:text-3xl font-black text-indigo-900 font-mono">
              30 Marks
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider mt-1">
              Question-Wise Layout
            </p>
            <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">Desc (15) + Obj (10) + Assign (5)</p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/60 border border-amber-100 transition hover:border-amber-300">
            <p className="text-xl sm:text-3xl font-black text-amber-900 font-mono">
              Dual-Column
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider mt-1">
              Certified Print Sheets
            </p>
            <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">Numbers & Certified Words</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: INTERACTIVE 80:20 THEORY SESSIONAL CALCULATOR */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#146EF5] px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-200 mb-2.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Autonomous Grading Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A2566] tracking-tight font-['Outfit']">
            Autonomous 80:20 Sessional Calculation Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Theory internal marks are determined by taking{' '}
            <span className="text-[#146EF5] font-bold">80% of your higher Mid examination</span> and{' '}
            <span className="text-[#0A2566] font-bold">20% of your lower Mid examination</span>. Try the live interactive calculator:
          </p>
        </div>

        {/* Live Interactive Sessional Calculator Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-lg shadow-blue-900/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls (Left 6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-base font-black text-[#0A2566] flex items-center gap-2 font-['Outfit']">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Examination Simulator
              </h3>

              {/* Mid-1 Slider */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Mid-1 Examination Score
                  </label>
                  <span className="text-sm font-black font-mono text-[#146EF5] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {mid1Marks} / 30
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={mid1Marks}
                  onChange={(e) => setMid1Marks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#146EF5]"
                />
                <p className="text-[10.5px] text-slate-500 mt-1.5 font-medium">
                  Descriptive (15M) + Objective (10M) + Continuous Assignment (5M)
                </p>
              </div>

              {/* Mid-2 Slider */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Mid-2 Examination Score
                  </label>
                  <span className="text-sm font-black font-mono text-[#0A2566] bg-slate-200 px-2.5 py-0.5 rounded-md border border-slate-300">
                    {mid2Marks} / 30
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={mid2Marks}
                  onChange={(e) => setMid2Marks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0A2566]"
                />
                <p className="text-[10.5px] text-slate-500 mt-1.5 font-medium">
                  Descriptive (15M) + Objective (10M) + Continuous Assignment (5M)
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-slate-500">Presets:</span>
                <button
                  onClick={() => { setMid1Marks(28); setMid2Marks(24); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold transition cursor-pointer border border-slate-200"
                >
                  Distinction (28 & 24)
                </button>
                <button
                  onClick={() => { setMid1Marks(20); setMid2Marks(22); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold transition cursor-pointer border border-slate-200"
                >
                  Average (20 & 22)
                </button>
                <button
                  onClick={() => { setMid1Marks(30); setMid2Marks(28); }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-semibold transition cursor-pointer border border-slate-200"
                >
                  Topper (30 & 28)
                </button>
              </div>
            </div>

            {/* Computed Calculation Display (Right 6 cols) */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#0A2566] via-[#0D2E7A] to-[#146EF5] p-6 sm:p-7 rounded-2xl text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Autonomous Formula Breakdown
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/20 font-bold">
                    Auto Computed
                  </span>
                </div>

                {/* Formula Math Steps */}
                <div className="space-y-2.5 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10">
                    <span className="text-blue-100">Higher Mid ({higherMid}) × 80%:</span>
                    <span className="font-bold text-white">{higherMid} × 0.80 = {higherPart} M</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/10">
                    <span className="text-blue-100">Lower Mid ({lowerMid}) × 20%:</span>
                    <span className="font-bold text-white">{lowerMid} × 0.20 = {lowerPart} M</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/15 border border-white/20 mt-1">
                    <span className="font-sans font-bold text-white">Final Sessional:</span>
                    <span className="font-black text-amber-300 text-lg sm:text-xl">
                      {sessionalTotal} / 30 Marks
                    </span>
                  </div>
                </div>

                {/* Words Representation */}
                <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/15">
                  <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    Certified In Words (For Autonomous Mark Sheet)
                  </p>
                  <p className="text-xs sm:text-sm font-black text-white mt-0.5 font-mono tracking-wide uppercase">
                    "{wordsRepresentation}"
                  </p>
                </div>
              </div>

              {/* Passing Status */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-medium">
                <span className="text-blue-100">Academic Standing:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-lg ${sessionalTotal >= 12 ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' : 'bg-red-400/20 text-red-200 border border-red-300/30'}`}>
                  {sessionalTotal >= 12 ? '✓ Internal Clearance Met' : '⚠ Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: LABORATORY SINGLE INTERNAL EVALUATION (NO 80:20) */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-200 mb-2.5">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Laboratory & Practical Regulation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2566] tracking-tight font-['Outfit']">
              Single Internal Evaluation for Laboratory Courses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Laboratory and practical courses have <span className="text-emerald-700 font-bold">Only One Internal Examination (Max 30 Marks)</span> with <span className="text-[#0A2566] font-bold">NO 80:20 rule</span> applied. The single internal score directly forms 100% of the sessional mark.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm transition duration-200">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#0A2566] mb-1.5">100% Direct Lab Score</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Continuous laboratory evaluation, day-to-day practical execution, record maintenance, and internal practical test directly map to the final 30 Marks.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 font-mono text-[11px] text-emerald-700 font-bold">
                Formula: Sessional = Lab Score (Max 30M)
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition duration-200">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#146EF5] flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#0A2566] mb-1.5">27 Recognized Labs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full coverage of DBMS Lab, Java Lab, Python, Full Stack-1 & 2, Data Mining, ML Lab, IoT Lab, Prompt Engineering, and Internships across Sem 3 to 8.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 font-mono text-[11px] text-[#146EF5] font-bold">
                Covers CSIT & CSD (2nd, 3rd, 4th Years)
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 hover:border-purple-300 hover:shadow-sm transition duration-200">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-[#0A2566] mb-1.5">Dedicated Lab Statements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates official certified "STATEMENT OF LABORATORY SESSIONAL MARKS" without empty Mid-1 / Mid-2 columns for pure compliance.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 font-mono text-[11px] text-purple-700 font-bold">
                1-Click Export to PDF & Excel
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: QUESTION-WISE EVALUATION SCHEME */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-indigo-200 mb-2.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Question Paper Layout</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A2566] tracking-tight font-['Outfit']">
            Granular Question-Level Marks Entry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Faculty members enter question-wise marks that automatically validate maximum limits, prevent human errors, and compute grand totals instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Part A: Descriptive */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#146EF5] uppercase tracking-wider">Part A</span>
              <span className="text-xs font-black font-mono bg-blue-50 text-[#146EF5] px-2.5 py-1 rounded-lg border border-blue-100">
                15 Marks Max
              </span>
            </div>
            <h4 className="text-base font-black text-[#0A2566]">Descriptive Section</h4>
            <p className="text-xs text-slate-500 mt-1.5">
              Three internal choices evaluated with maximum 5 marks each:
            </p>
            <div className="mt-4 space-y-2 text-xs font-mono text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                <span>Unit I: Q1 or Q2</span>
                <span className="text-[#146EF5] font-bold">5 Marks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                <span>Unit II: Q3 or Q4</span>
                <span className="text-[#146EF5] font-bold">5 Marks</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between">
                <span>Unit III: Q5 or Q6</span>
                <span className="text-[#146EF5] font-bold">5 Marks</span>
              </div>
            </div>
          </div>

          {/* Part B: Objective */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Part B</span>
              <span className="text-xs font-black font-mono bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-lg border border-cyan-100">
                10 Marks Max
              </span>
            </div>
            <h4 className="text-base font-black text-[#0A2566]">Objective Section</h4>
            <p className="text-xs text-slate-500 mt-1.5">
              Five compulsory objective questions evaluated at 2 marks each:
            </p>
            <div className="mt-4 grid grid-cols-5 gap-1.5 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400">O1</span>
                <p className="text-cyan-700 font-bold">2M</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400">O2</span>
                <p className="text-cyan-700 font-bold">2M</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400">O3</span>
                <p className="text-cyan-700 font-bold">2M</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400">O4</span>
                <p className="text-cyan-700 font-bold">2M</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400">O5</span>
                <p className="text-cyan-700 font-bold">2M</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              Total Objective score: O1 + O2 + O3 + O4 + O5 = 10 Marks.
            </p>
          </div>

          {/* Continuous Assignment */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Continuous</span>
              <span className="text-xs font-black font-mono bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                5 Marks Max
              </span>
            </div>
            <h4 className="text-base font-black text-[#0A2566]">Assignment Evaluation</h4>
            <p className="text-xs text-slate-500 mt-1.5">
              Continuous assessment including classroom presentations, tutorial assignments, and coding tests.
            </p>
            <div className="mt-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <p className="text-xs font-bold text-amber-800">Grand Mid Exam Total</p>
              <p className="text-lg font-black text-[#0A2566] font-mono mt-0.5">15 + 10 + 5 = 30M</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 4: ROLE-BASED PORTALS OVERVIEW */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A2566] tracking-tight font-['Outfit']">
              Dedicated Portals for Faculty & Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Secure, role-tailored workspaces built specifically for SRKR Engineering College faculty and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Faculty Portal Card */}
            <div className="bg-gradient-to-br from-[#0A2566] to-[#146EF5] p-7 sm:p-8 rounded-3xl text-white flex flex-col justify-between shadow-lg shadow-blue-900/10">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-blue-100 mb-4">
                  <Users className="w-3.5 h-3.5" />
                  <span>Faculty Portal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">Marks Entry & Sessional Statements</h3>
                <ul className="mt-4 space-y-2.5 text-xs text-blue-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Section-wise & course-wise bulk marks evaluation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Automatic 80:20 calculation and Lab direct evaluation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Dual-Column Roster statements with certified numbers in words</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>One-click PDF generation and Excel/CSV spreadsheets</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onSelectRoleAndFocus) onSelectRoleAndFocus('FACULTY');
                  onScrollToTop();
                }}
                className="mt-7 py-3 px-6 bg-white text-[#0A2566] hover:bg-blue-50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <span>Login as Faculty</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Portal Card */}
            <div className="bg-gradient-to-br from-[#064E3B] to-[#047857] p-7 sm:p-8 rounded-3xl text-white flex flex-col justify-between shadow-lg shadow-emerald-900/10">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-emerald-100 mb-4">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">Instant Grade & Mid Scorecards</h3>
                <ul className="mt-4 space-y-2.5 text-xs text-emerald-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Instant login using Student Register Number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Subject-wise question score distribution & continuous assignment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>80:20 Sessional breakdown and Laboratory scorecards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Certified PDF Grade Sheet export with SRKR seal</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onSelectRoleAndFocus) onSelectRoleAndFocus('STUDENT');
                  onScrollToTop();
                }}
                className="mt-7 py-3 px-6 bg-white text-[#064E3B] hover:bg-emerald-50 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <span>Login as Student</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-slate-900 py-10 px-4 sm:px-8 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/srkr-emblem.png"
              alt="SRKR Seal"
              className="w-11 h-11 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/srkr-logo.png';
              }}
            />
            <div>
              <p className="text-white font-bold text-sm uppercase font-serif">
                Sagi Rama Krishnam Raju Engineering College (Autonomous)
              </p>
              <p className="text-slate-400 text-[11px]">
                Chinna Amiram :: Bhimavaram - 534204, W.G. Dist, Andhra Pradesh
              </p>
              <p className="text-slate-400 text-[10.5px] mt-0.5">
                Affiliated to JNTUK • Approved by AICTE • NAAC 'A+' Grade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onScrollToTop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer font-semibold"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 pt-5 border-t border-slate-800 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} MID TRACK — SRKR Engineering College (Autonomous). Developed for Computer Science & Information Technology and Computer Science & Design Departments.
        </div>
      </footer>
    </div>
  );
};
