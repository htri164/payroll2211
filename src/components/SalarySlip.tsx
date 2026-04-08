'use client';

import { type SalaryRecord } from '@/lib/firebase/salaries';

interface SalarySlipProps {
  salary: SalaryRecord;
  joinDateDisplay?: string;
}

/** Số thường (cộng / trung tính): không kèm “đ”. */
const slipNum = (value: number, emptyDash = true) => {
  if (value === 0 && emptyDash) return '—';
  return value.toLocaleString('vi-VN');
};

/** Khoản trừ: 0 → —, còn lại luôn có dấu - trước số. */
const slipDeduction = (value: number) => {
  if (value === 0) return '—';
  return `-${value.toLocaleString('vi-VN')}`;
};

/** Dòng phụ cấp thủ công: âm thì hiển thị trừ. */
const slipManualAmount = (value: number) => {
  if (value === 0) return '—';
  if (value < 0) return `-${Math.abs(value).toLocaleString('vi-VN')}`;
  return value.toLocaleString('vi-VN');
};

const formatMonthYm = (monthValue: string) => {
  const [y, m] = monthValue.split('-');
  if (!y || !m) return monthValue;
  return `Tháng ${m}/${y}`;
};

export default function SalarySlip({ salary, joinDateDisplay }: SalarySlipProps) {
  const gross = salary.grossWorkSalary ?? 0;
  const night = salary.nightAllowance ?? 0;
  const net = salary.totalSalary ?? 0;

  return (
    <div className="salary-slip flex h-full min-h-0 flex-col border border-gray-800 bg-white p-2.5 text-[11px] leading-snug print:border-gray-900 print:p-[2mm] print:text-[8pt] print:leading-[1.25] sm:text-xs">
      <div className="mb-1.5 shrink-0 text-center print:mb-1">
        <h2 className="text-xs font-bold uppercase tracking-tight print:text-[9pt]">
          PHIẾU LƯƠNG CÁ NHÂN
        </h2>
        <p className="mt-0.5 text-[11px] text-gray-800 print:text-[8pt] print:text-gray-900">
          {formatMonthYm(salary.month)}
        </p>
      </div>

      <div className="mb-1.5 flex shrink-0 justify-between gap-2 border-b border-gray-500 pb-1 print:mb-1 print:pb-0.5">
        <span className="font-medium">Họ tên</span>
        <span className="max-w-[60%] text-right font-semibold">{salary.employeeName}</span>
      </div>

      {/* flex-1 + mt-auto: đẩy “III Tiền lương thực lãnh” sát đáy ô phiếu, khoảng trắng nằm giữa danh sách và dòng tổng */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col gap-0">
          <SlipRow label="Ngày vào làm" value={joinDateDisplay?.trim() || '—'} />
          <SlipRow label="Lương cơ bản" value={slipNum(salary.baseSalary, false)} />
          <SlipRow label="Ngày công" value={slipNum(salary.dayShifts, false)} />
          <SlipRow label="Ngày nghỉ" value={slipNum(salary.leaveDays)} />
          <SlipRow label="Ngày làm đêm" value={slipNum(salary.nightShifts)} />
          <SlipRow label="Tổng lương" value={slipNum(gross, false)} />
          <SlipRow label="Phụ cấp làm đêm" value={slipNum(night, false)} />
          <SlipRow label="Phụ cấp cơm" value={slipNum(salary.foodAllowance, false)} />
          <SlipRow label="Tiền chuyên cần" value={slipNum(salary.attendanceBonus)} />
          <SlipRow label="Phụ cấp trọ" value={slipNum(salary.otherAllowance)} />
          {salary.manualAllowanceLines?.map((line, idx) => (
            <SlipRow key={`m-${idx}`} label={line.label} value={slipManualAmount(line.amount)} />
          ))}
          <SlipRow label="Tạm ứng" value={slipDeduction(salary.advancePayment)} />
          <SlipRow label="Khấu trừ khác" value={slipDeduction(salary.otherDeduction)} />
        </div>

        <div className="mt-auto flex justify-between gap-2 border-t-2 border-gray-900 pt-1.5 text-xs font-bold print:pt-1 print:text-[8.5pt]">
          <span>III Tiền lương thực lãnh</span>
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
