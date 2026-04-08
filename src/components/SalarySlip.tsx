'use client';

import { SalaryRecord } from '@/lib/firebase/salaries';

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
  const formatDate = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `Tháng ${parseInt(month)}, năm ${year}`;
  };

  return (
    <div className="border-2 border-gray-800 p-4 bg-white text-sm h-[3.8in]">
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .salary-slip { page-break-after: avoid; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-2 border-b-2 border-gray-800 pb-2">
        <h2 className="font-bold text-base mb-0">{companyName}</h2>
        <p className="text-xs text-gray-700 m-0">{companyAddress}</p>
      </div>

      {/* Title */}
      <div className="text-center mb-2">
        <h3 className="font-bold text-sm border-b border-gray-400 pb-1">PHIẾU LƯƠNG</h3>
      </div>

      {/* Month */}
      <div className="text-center mb-2 text-xs">
        <p className="m-0">{formatDate(salary.month)}</p>
      </div>

      {/* Employee Info */}
      <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="m-0">
            <span className="font-semibold">Họ tên:</span> {salary.employeeName}
          </p>
        </div>
        <div>
          <p className="m-0">
            <span className="font-semibold">Mã nhân viên:</span> {salary.employeeId}
          </p>
        </div>
      </div>

      {/* Salary Table */}
      <table className="w-full text-xs border-collapse mb-2">
        <thead>
          <tr className="border border-gray-600">
            <th className="border border-gray-600 px-1 py-1 text-left font-semibold">Chi tiết</th>
            <th className="border border-gray-600 px-1 py-1 text-right font-semibold">Số tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 px-1 py-0.5">Lương cơ bản</td>
            <td className="border border-gray-600 px-1 py-0.5 text-right">
              {salary.baseSalary.toLocaleString('vi-VN')} đ
            </td>
          </tr>
          <tr className="border border-gray-600">
            <td className="border border-gray-600 px-1 py-0.5">Phụ cấp ăn</td>
            <td className="border border-gray-600 px-1 py-0.5 text-right">
              {salary.foodAllowance.toLocaleString('vi-VN')} đ
            </td>
          </tr>
          {salary.additionalFees > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Phụ phí thêm</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                {salary.additionalFees.toLocaleString('vi-VN')} đ
              </td>
            </tr>
          )}
          {salary.bonus > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Thưởng</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                {salary.bonus.toLocaleString('vi-VN')} đ
              </td>
            </tr>
          )}
          {salary.deductions > 0 && (
            <tr className="border border-gray-600">
              <td className="border border-gray-600 px-1 py-0.5">Khấu trừ</td>
              <td className="border border-gray-600 px-1 py-0.5 text-right">
                -{salary.deductions.toLocaleString('vi-VN')} đ
              </td>
            </tr>
          )}
          <tr className="border-2 border-gray-700 bg-gray-200">
            <td className="border-2 border-gray-700 px-1 py-0.5 font-bold">TỔNG LƯƠNG</td>
            <td className="border-2 border-gray-700 px-1 py-0.5 text-right font-bold">
              {salary.totalSalary?.toLocaleString('vi-VN')} đ
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div className="text-center">
          <p className="m-0 text-xs border-t border-gray-400 pt-1">Nhân viên HR</p>
        </div>
        <div className="text-center">
          <p className="m-0 text-xs border-t border-gray-400 pt-1">Kế toán</p>
        </div>
        <div className="text-center">
          <p className="m-0 text-xs border-t border-gray-400 pt-1">Quản lý</p>
        </div>
      </div>

      {/* Cut line */}
      <div className="border-t-2 border-dashed border-gray-400 my-2"></div>
    </div>
  );
}
