'use client';

import { type SalaryRecord } from '@/lib/firebase/salaries';

interface SalarySlipProps {
  salary: SalaryRecord;
  joinDateDisplay?: string;
}

/** Sá»‘ thÆ°á»ng (cá»™ng / trung tÃ­nh): khÃ´ng kÃ¨m â€œÄ‘â€. */
const slipNum = (value: number, emptyDash = true) => {
  if (value === 0 && emptyDash) return 'â€”';
  return value.toLocaleString('vi-VN');
};

/** Khoáº£n trá»«: 0 â†’ â€”, cÃ²n láº¡i luÃ´n cÃ³ dáº¥u - trÆ°á»›c sá»‘. */
const slipDeduction = (value: number) => {
  if (value === 0) return 'â€”';
  return `-${value.toLocaleString('vi-VN')}`;
};

/** DÃ²ng phá»¥ cáº¥p thá»§ cÃ´ng: Ã¢m thÃ¬ hiá»ƒn thá»‹ trá»«. */
const slipManualAmount = (value: number) => {
  if (value === 0) return 'â€”';
  if (value < 0) return `-${Math.abs(value).toLocaleString('vi-VN')}`;
  return value.toLocaleString('vi-VN');
};

const formatMonthYm = (monthValue: string) => {
  const [y, m] = monthValue.split('-');
  if (!y || !m) return monthValue;
  return `ThÃ¡ng ${m}/${y}`;
};

export default function SalarySlip({ salary, joinDateDisplay }: SalarySlipProps) {
  const gross = salary.grossWorkSalary ?? 0;
  const night = salary.nightAllowance ?? 0;
  const net = salary.totalSalary ?? 0;

  return (
    <div className="salary-slip flex h-full min-h-0 flex-col border border-gray-800 bg-white p-2.5 text-[11px] leading-snug print:border-gray-900 print:p-[2mm] print:text-[8pt] print:leading-[1.25] sm:text-xs">
      <div className="mb-1.5 shrink-0 text-center print:mb-1">
        <h2 className="text-xs font-bold uppercase tracking-tight print:text-[9pt]">
          PHIáº¾U LÆ¯Æ NG CÃ NHÃ‚N
        </h2>
        <p className="mt-0.5 text-[11px] text-gray-800 print:text-[8pt] print:text-gray-900">
          {formatMonthYm(salary.month)}
        </p>
      </div>

      <div className="mb-1.5 flex shrink-0 justify-between gap-2 border-b border-gray-500 pb-1 print:mb-1 print:pb-0.5">
        <span className="font-medium">Há» tÃªn</span>
        <span className="max-w-[60%] text-right font-semibold">{salary.employeeName}</span>
      </div>

      {/* flex-1 + mt-auto: Ä‘áº©y â€œIII Tiá»n lÆ°Æ¡ng thá»±c lÃ£nhâ€ sÃ¡t Ä‘Ã¡y Ã´ phiáº¿u, khoáº£ng tráº¯ng náº±m giá»¯a danh sÃ¡ch vÃ  dÃ²ng tá»•ng */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col gap-0">
          <SlipRow label="NgÃ y vÃ o lÃ m" value={joinDateDisplay?.trim() || 'â€”'} />
          <SlipRow label="LÆ°Æ¡ng cÆ¡ báº£n" value={slipNum(salary.baseSalary, false)} />
          <SlipRow label="NgÃ y cÃ´ng" value={slipNum(salary.dayShifts, false)} />
          <SlipRow label="NgÃ y nghá»‰" value={slipNum(salary.leaveDays)} />
          <SlipRow label="NgÃ y lÃ m Ä‘Ãªm" value={slipNum(salary.nightShifts)} />
          <SlipRow label="Tá»•ng lÆ°Æ¡ng" value={slipNum(gross, false)} />
          <SlipRow label="Phá»¥ cáº¥p lÃ m Ä‘Ãªm" value={slipNum(night, false)} />
          <SlipRow label="Tiền ăn" value={slipNum(salary.foodAllowance, false)} />
          <SlipRow label="Tiá»n chuyÃªn cáº§n" value={slipNum(salary.attendanceBonus)} />
          <SlipRow label="Phá»¥ cáº¥p trá»" value={slipNum(salary.otherAllowance)} />
          {salary.manualAllowanceLines?.map((line, idx) => (
            <SlipRow key={`m-${idx}`} label={line.label} value={slipManualAmount(line.amount)} />
          ))}
          <SlipRow label="Táº¡m á»©ng" value={slipDeduction(salary.advancePayment)} />
          <SlipRow label="Kháº¥u trá»« khÃ¡c" value={slipDeduction(salary.otherDeduction)} />
        </div>

        <div className="mt-auto flex justify-between gap-2 border-t-2 border-gray-900 pt-1.5 text-xs font-bold print:pt-1 print:text-[8.5pt]">
          <span>III Tiá»n lÆ°Æ¡ng thá»±c lÃ£nh</span>
          <span className="tabular-nums">{slipNum(net, false)}</span>
        </div>
      </div>
    </div>
  );
}

function SlipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="slip-row flex justify-between gap-1 border-b border-gray-200 py-0.5 print:py-[0.15rem] print:text-[8pt]">
      <span className="shrink-0 text-gray-900">{label}</span>
      <span className="min-w-0 text-right tabular-nums text-gray-900">{value}</span>
    </div>
  );
}


