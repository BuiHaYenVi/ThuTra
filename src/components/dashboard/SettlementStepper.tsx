import React from 'react';
import { Activity } from 'lucide-react';
import { mockTaxData } from '../../data/mockTaxData';
import type { SettlementStep } from '../../data/mockTaxData';

interface SettlementStepperProps {
  onStepClick?: (stepNumber: number) => void;
}

export const SettlementStepper: React.FC<SettlementStepperProps> = ({ onStepClick }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#046a4e]" />
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">
            Tiến trình hồ sơ quyết toán kỳ thuế {mockTaxData.taxYear}
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-normal">
          Quy chuẩn theo {mockTaxData.regulationCode}
        </span>
      </div>

      {/* 4 Steps Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {mockTaxData.stepperSteps.map((step: SettlementStep) => {
          const isCurrentActive = step.status === 'in_progress';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.stepNumber}
              onClick={() => onStepClick && onStepClick(step.stepNumber)}
              className={`rounded-xl p-3.5 transition-all cursor-pointer ${
                isCurrentActive
                  ? 'border-2 border-emerald-500 bg-[#f4fbf8] shadow-xs'
                  : 'border border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCompleted || isCurrentActive
                      ? 'bg-[#046a4e] text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step.stepNumber}
                </div>

                {/* Badge status */}
                {step.badgeType === 'completed' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {step.badge}
                  </span>
                )}
                {step.badgeType === 'in_progress' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {step.badge}
                  </span>
                )}
                {step.badgeType === 'pending' && (
                  <span className="text-slate-400 text-[11px] font-normal">
                    {step.badge}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                className={`text-xs font-bold leading-tight ${
                  isCurrentActive ? 'text-[#046a4e]' : 'text-slate-900'
                }`}
              >
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[11px] text-slate-500 leading-normal mt-1">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
