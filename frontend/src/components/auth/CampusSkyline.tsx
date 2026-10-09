import React from 'react';

interface CampusSkylineProps {
  color?: string;
  className?: string;
}

export const CampusSkyline: React.FC<CampusSkylineProps> = ({
  color = 'currentColor',
  className = 'w-64 h-8',
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 320 40"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground baseline */}
      <line x1="0" y1="36" x2="320" y2="36" strokeWidth="1.2" />

      {/* Far Left Trees / Foliage */}
      <path d="M6,36 C6,30 12,28 16,30 C19,26 25,26 28,30 C31,28 36,31 36,36" strokeWidth="1" strokeDasharray="1.5,1.5" />
      
      {/* Left Outer Wing */}
      <rect x="40" y="24" width="24" height="12" />
      <line x1="46" y1="28" x2="46" y2="32" strokeWidth="0.8" />
      <line x1="52" y1="28" x2="52" y2="32" strokeWidth="0.8" />
      <line x1="58" y1="28" x2="58" y2="32" strokeWidth="0.8" />

      {/* Left Mid Building */}
      <rect x="68" y="16" width="36" height="20" />
      {/* Windows row 1 */}
      <rect x="73" y="19" width="5" height="4" strokeWidth="0.8" />
      <rect x="83" y="19" width="5" height="4" strokeWidth="0.8" />
      <rect x="93" y="19" width="5" height="4" strokeWidth="0.8" />
      {/* Windows row 2 */}
      <rect x="73" y="27" width="5" height="4" strokeWidth="0.8" />
      <rect x="83" y="27" width="5" height="4" strokeWidth="0.8" />
      <rect x="93" y="27" width="5" height="4" strokeWidth="0.8" />

      {/* Left Inner Wing */}
      <rect x="108" y="20" width="22" height="16" />
      <line x1="114" y1="24" x2="114" y2="31" strokeWidth="0.8" />
      <line x1="122" y1="24" x2="122" y2="31" strokeWidth="0.8" />

      {/* Center Grand Academic Hall */}
      <rect x="134" y="10" width="52" height="26" />
      {/* Roof Pediment / Dome */}
      <path d="M130,10 L160,2 L190,10 Z" />
      <circle cx="160" cy="7" r="1.5" strokeWidth="0.8" />
      {/* Arched Entrance / Main Portal */}
      <path d="M154,36 L154,26 C154,23 166,23 166,26 L166,36" strokeWidth="1" />
      {/* Colonnade Pillars */}
      <line x1="140" y1="14" x2="140" y2="36" strokeWidth="0.8" />
      <line x1="147" y1="14" x2="147" y2="36" strokeWidth="0.8" />
      <line x1="173" y1="14" x2="173" y2="36" strokeWidth="0.8" />
      <line x1="180" y1="14" x2="180" y2="36" strokeWidth="0.8" />
      {/* Academic Crest Emblem in pediment */}
      <rect x="156" y="13" width="8" height="6" strokeWidth="0.8" />

      {/* Right Inner Wing */}
      <rect x="190" y="20" width="22" height="16" />
      <line x1="197" y1="24" x2="197" y2="31" strokeWidth="0.8" />
      <line x1="205" y1="24" x2="205" y2="31" strokeWidth="0.8" />

      {/* Right Mid Building */}
      <rect x="216" y="16" width="36" height="20" />
      {/* Windows row 1 */}
      <rect x="221" y="19" width="5" height="4" strokeWidth="0.8" />
      <rect x="231" y="19" width="5" height="4" strokeWidth="0.8" />
      <rect x="241" y="19" width="5" height="4" strokeWidth="0.8" />
      {/* Windows row 2 */}
      <rect x="221" y="27" width="5" height="4" strokeWidth="0.8" />
      <rect x="231" y="27" width="5" height="4" strokeWidth="0.8" />
      <rect x="241" y="27" width="5" height="4" strokeWidth="0.8" />

      {/* Right Outer Wing */}
      <rect x="256" y="24" width="24" height="12" />
      <line x1="262" y1="28" x2="262" y2="32" strokeWidth="0.8" />
      <line x1="268" y1="28" x2="268" y2="32" strokeWidth="0.8" />
      <line x1="274" y1="28" x2="274" y2="32" strokeWidth="0.8" />

      {/* Far Right Trees / Foliage */}
      <path d="M284,36 C284,31 289,28 293,30 C296,26 302,26 305,30 C308,28 314,30 314,36" strokeWidth="1" strokeDasharray="1.5,1.5" />
    </svg>
  );
};
