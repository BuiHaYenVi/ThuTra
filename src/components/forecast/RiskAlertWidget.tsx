import React from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';
import { mockRiskAlert } from '../../data/mockForecastData';

interface RiskAlertWidgetProps {
  onFixRisk?: () => void;
}

export const RiskAlertWidget: React.FC<RiskAlertWidgetProps> = ({ onFixRisk }) => {
  return (
    <div className="bg-[#fffbeb] border-2 border-amber-400/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-amber-200/80">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-amber-950 text-xs tracking-tight">
              {mockRiskAlert.title}
            </h3>
            <p className="text-[10px] text-amber-800 font-medium">
              {mockRiskAlert.level}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="pt-2.5 space-y-1.5">
          <div className="flex items-start gap-1.5 text-xs font-bold text-slate-900">
            <span className="text-amber-600 font-bold">•</span>
            <span>{mockRiskAlert.detectedIssue}</span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed pl-3 font-normal">
            {mockRiskAlert.legalNotice}
          </p>

          <p className="text-[11px] text-amber-900 font-semibold leading-relaxed pl-3 bg-amber-100/60 p-1.5 rounded-lg border border-amber-200/70">
            {mockRiskAlert.consequences}
          </p>
        </div>
      </div>

      {/* Button CTA */}
      <button
        onClick={onFixRisk}
        className="mt-3.5 w-full bg-[#d97706] hover:bg-[#b45309] active:scale-[0.99] text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Wrench className="w-3.5 h-3.5 text-amber-100" />
        <span>{mockRiskAlert.actionText}</span>
      </button>
    </div>
  );
};
