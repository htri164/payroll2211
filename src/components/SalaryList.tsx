'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/employees';
import { type SalaryRecord, getSalaryRecords } from '@/lib/firebase/salaries';

interface SalaryListProps {
  onEdit?: (salary: SalaryRecord) => void;
  refreshToken?: number;
}

const getCurrentMonthValue = () => new Date().toISOString().slice(0, 7);

export default function SalaryList({ onEdit, refreshToken = 0 }: SalaryListProps) {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthValue());

  useEffect(() => {
    fetchSalaries();
  }, [refreshToken]);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const data = await getSalaryRecords();
      setSalaries(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tải danh sách bảng lương';
      console.warn(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = salaries.filter((salary) => salary.month === filterMonth);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-auto">
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
            Lọc theo tháng dữ liệu
          </label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 shadow-premium focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all duration-200 sm:w-64"
          />
        </div>

        <Link
          href={`/print?month=${filterMonth}`}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-accent-hover"
        >
          In phiếu lương hàng loạt
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">Đang tải dữ liệu bảng lương...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-20 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="mt-4 text-base font-medium text-gray-500">
          Không tìm thấy dữ liệu lương cho tháng {filterMonth}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-premium">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Nhân viên</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Công ngày</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Công đêm</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Nghỉ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Lương công</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Tổng phụ cấp</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Tổng bị trừ</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Thực lãnh</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((salary) => (
                  <tr key={salary.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{salary.employeeName}</p>
                      <p className="text-sm text-gray-500">{salary.month}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">{salary.dayShifts}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{salary.nightShifts}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{salary.leaveDays}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(salary.grossWorkSalary ?? 0)}</td>
                    <td className="px-6 py-4 text-right text-blue-600">{formatCurrency(salary.totalAllowance ?? 0)}</td>
                    <td className="px-6 py-4 text-right text-red-600">{formatCurrency(salary.totalDeduction ?? 0)}</td>
                    <td className="px-6 py-4 text-right font-bold text-success">{formatCurrency(salary.totalSalary ?? 0)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit?.(salary)}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-amber-600"
                      >
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
