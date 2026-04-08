'use client';

import { type SalaryRecord } from '@/lib/firebase/salaries';
import { formatCurrency } from '@/lib/employees';

interface SalarySlipProps {
  salary: SalaryRecord;
  companyName?: string;
  companyAddress?: string;
}

export default function SalarySlip({
  salary,
  companyName = 'CÔNG TY TNHH',
  companyAddress = 'Địa chỉ công ty',
}: SalarySlipProps) {
  const formatMonth = (monthValue: string) => {
    const [year, month] = monthValue.split('-');
    return `Tháng ${Number(month)}, năm ${year}`;
  };

  return (
    <div className="salary-slip min-h-[3.8in] border-2 border-gray-800 bg-white p-4 text-sm">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .salary-slip { page-break-after: avoid; }
        }
      `}</style>

      <div className="mb-2 border-b-2 border-gray-800 pb-2 text-center">
        <h2 className="mb-0 text-base font-bold">{companyName}</h2>
        <p className="m-0 text-xs text-gray-700">{companyAddress}</p>
      </div>

      <div className="mb-2 text-center">
        <h3 className="border-b border-gray-400 pb-1 text-sm font-bold">PHIẾU LƯƠNG</h3>
        <p className="mt-1 text-xs">{formatMonth(salary.month)}</p>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
        <p className="m-0">
          <span className="font-semibold">Họ tên:</span> {salary.employeeName}
        </p>
        <p className="m-0 text-right">
          <span className="font-semibold">Mã NV:</span> {salary.employeeId}
        </p>
      </div>

      <table className="mb-2 w-full border-collapse text-xs">
        <thead>
          <tr className="border border-gray-600">
            <th className="border border-gray-600 px-1 py-1 text-left font-semibold">Chi tiết</th>
            <th className="border border-gray-600 px-1 py-1 text-right font-semibold">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 px-1 py-0.5">
              Lương công ({salary.dayShifts + salary.nightShifts} công)
            </td>
            <td className="border border-gray-600 px-1 py-0.5 text-right">
              {formatCurrency(salary.grossWorkSalary ?? 0)}
            </td>
          </tr>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 px-1 py-0.5">Phụ cấp cơm</td>
            <td className="border border-gray-600 px-1 py-0.5 text-right">
              {formatCurrency(salary.foodAllowance)}
            </td>
          </tr>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 px-1 py-0.5">Phụ cấp đêm</td>
            <td className="border border-gray-600 px-1 py-0.5 text-right">
              {formatCurrency(salary.nightAllowance ?? 0)}
            </td>
          </tr>
          {salary.attendanceBonus > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Phụ cấp chuyên cần</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                {formatCurrency(salary.attendanceBonus)}
              </td>
            </tr>
          )}
          {salary.manualAllowanceLines?.map((line, idx) => (
            <tr key={`manual-${idx}`} className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">{line.label}</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                {formatCurrency(line.amount)}
              </td>
            </tr>
          ))}
          {salary.otherAllowance > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Trợ cấp khác</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                {formatCurrency(salary.otherAllowance)}
              </td>
            </tr>
          )}
          {salary.advancePayment > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Tạm ứng</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                -{formatCurrency(salary.advancePayment)}
              </td>
            </tr>
          )}
          {salary.otherDeduction > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Khấu trừ khác</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                -{formatCurrency(salary.otherDeduction)}
              </td>
            </tr>
          )}
          <tr className="border border-gray-600 bg-gray-50">
            <td className="border border-gray-600 px-1 py-0.5 font-semibold">Tổng phụ cấp</td>
            <td className="border border-gray-600 px-1 py-0.5 text-right font-semibold">
              {formatCurrency(salary.totalAllowance ?? 0)}
            </td>
          </tr>
          <tr className="border border-gray-600 bg-gray-50">
            <td className="border border-gray-600 px-1 py-0.5 font-semibold">Tổng bị trừ</td>
            <td className="border border-gray-600 px-1 py-0.5 text-right font-semibold">
              -{formatCurrency(salary.totalDeduction ?? 0)}
            </td>
          </tr>
          <tr className="border-2 border-gray-700 bg-gray-200">
            <td className="border-2 border-gray-700 px-1 py-0.5 font-bold">LƯƠNG THỰC LÃNH</td>
            <td className="border-2 border-gray-700 px-1 py-0.5 text-right font-bold">
              {formatCurrency(salary.totalSalary ?? 0)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="m-0 border-t border-gray-400 pt-1">Nhân viên HR</p>
        </div>
        <div className="text-center">
          <p className="m-0 border-t border-gray-400 pt-1">Kế toán</p>
        </div>
        <div className="text-center">
          <p className="m-0 border-t border-gray-400 pt-1">Quản lý</p>
        </div>
      </div>

      <div className="my-2 border-t-2 border-dashed border-gray-400"></div>
    </div>
  );
}
