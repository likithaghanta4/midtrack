import React from 'react';

export const MidTrackLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center select-none">
      {/* 3 Ascending Blue Bars Symbol + Stacked MID TRACK Typography */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Ascending 3-Bar Brand Icon matching reference */}
        <div className="flex items-end gap-1 sm:gap-1.5 h-10 sm:h-12 py-1">
          <div className="w-2.5 sm:w-3.5 h-3.5 sm:h-4 bg-[#0ea5e9] rounded-t-sm rounded-b-[2px]" />
          <div className="w-2.5 sm:w-3.5 h-7 sm:h-8 bg-[#146EF5] rounded-t-sm rounded-b-[2px]" />
          <div className="w-2.5 sm:w-3.5 h-10 sm:h-12 bg-[#0A2566] rounded-t-sm rounded-b-[2px]" />
        </div>

        {/* MID TRACK Typography */}
        <div className="flex flex-col text-left font-['Outfit'] tracking-tight leading-[0.88]">
          <span className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#0A2566] tracking-tight">
            MID
          </span>
          <span className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#0A2566] tracking-tight">
            TRACK
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-500 mt-1.5 sm:mt-2.5 tracking-tight">
        Mid Marks Management System
      </p>
    </div>
  );
};
