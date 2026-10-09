/**
 * Helper utility to determine the academic year standing for SRKR B.Tech batches
 * Standard Autonomous B.Tech Scheme:
 * - 1st Year (I B.Tech):   Sem 1 & Sem 2
 * - 2nd Year (II B.Tech):  Sem 3 & Sem 4
 * - 3rd Year (III B.Tech): Sem 5 & Sem 6
 * - 4th Year (IV B.Tech):  Sem 7 & Sem 8
 */

export interface AcademicYearInfo {
  yearText: string;         // e.g. "Current 4th Year"
  academicStanding: string; // e.g. "IV B.Tech (Final Year)"
  shortYear: string;        // e.g. "4th Year"
  badgeBg: string;          // Tailwind badge background
  badgeText: string;        // Tailwind badge text color
  badgeBorder: string;      // Tailwind badge border color
  semesterText: string;     // e.g. "Semester 7"
  romanYear: string;        // e.g. "IV Year B.Tech"
}

export const getAcademicYearInfo = (semester: number): AcademicYearInfo => {
  if (semester === 7 || semester === 8) {
    return {
      yearText: 'Current 4th Year',
      academicStanding: 'IV B.Tech (Final Year)',
      shortYear: '4th Year',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
      badgeBorder: 'border-purple-200',
      semesterText: `Semester ${semester}`,
      romanYear: 'IV Year B.Tech',
    };
  }

  if (semester === 5 || semester === 6) {
    return {
      yearText: 'Current 3rd Year',
      academicStanding: 'III B.Tech (Pre-Final Year)',
      shortYear: '3rd Year',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      semesterText: `Semester ${semester}`,
      romanYear: 'III Year B.Tech',
    };
  }

  if (semester === 3 || semester === 4) {
    return {
      yearText: 'Current 2nd Year',
      academicStanding: 'II B.Tech',
      shortYear: '2nd Year',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      semesterText: `Semester ${semester}`,
      romanYear: 'II Year B.Tech',
    };
  }

  return {
    yearText: 'Current 1st Year',
    academicStanding: 'I B.Tech',
    shortYear: '1st Year',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    semesterText: `Semester ${semester}`,
    romanYear: 'I Year B.Tech',
  };
};

/**
 * Formats a section dropdown label clearly with Year and Semester
 * e.g. "CSD (Current 4th Year • Sem 7) — 70 Students"
 */
export const formatSectionLabel = (sec: {
  branch: string;
  sectionName: string;
  semester: number;
  studentCount?: number;
}): string => {
  const info = getAcademicYearInfo(sec.semester);
  const countPart = sec.studentCount !== undefined ? ` • ${sec.studentCount} Students` : '';
  return `${sec.branch} - ${sec.sectionName} (${info.yearText} • Sem ${sec.semester})${countPart}`;
};

export interface SemesterOption {
  semesterNumber: number;
  label: string;
  shortLabel: string;
}

/**
 * Returns strictly isolated semester choices for a selected year
 * - 2nd Year sections only see Sem 3 & Sem 4
 * - 3rd Year sections only see Sem 5 & Sem 6
 * - 4th Year sections only see Sem 7 & Sem 8
 */
export const getSemestersForSection = (baseSemester: number): SemesterOption[] => {
  if (baseSemester === 3 || baseSemester === 4) {
    return [
      { semesterNumber: 3, label: 'II B.Tech I-Semester (Sem 3)', shortLabel: 'Sem 3 (II-I)' },
      { semesterNumber: 4, label: 'II B.Tech II-Semester (Sem 4)', shortLabel: 'Sem 4 (II-II)' },
    ];
  }
  if (baseSemester === 5 || baseSemester === 6) {
    return [
      { semesterNumber: 5, label: 'III B.Tech I-Semester (Sem 5)', shortLabel: 'Sem 5 (III-I)' },
      { semesterNumber: 6, label: 'III B.Tech II-Semester (Sem 6)', shortLabel: 'Sem 6 (III-II)' },
    ];
  }
  if (baseSemester === 7 || baseSemester === 8) {
    return [
      { semesterNumber: 7, label: 'IV B.Tech I-Semester (Sem 7)', shortLabel: 'Sem 7 (IV-I)' },
      { semesterNumber: 8, label: 'IV B.Tech II-Semester (Sem 8)', shortLabel: 'Sem 8 (IV-II)' },
    ];
  }
  return [
    { semesterNumber: 1, label: 'I B.Tech I-Semester (Sem 1)', shortLabel: 'Sem 1 (I-I)' },
    { semesterNumber: 2, label: 'I B.Tech II-Semester (Sem 2)', shortLabel: 'Sem 2 (I-II)' },
  ];
};
