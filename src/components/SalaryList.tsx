'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  formatCurrency,
  isoMonthToMmYyyy,
  normalizeMonthToIso,
} from '@/lib/employees';
import { type SalaryRecord, getSalaryRecords, deleteSalaryRecord } from '@/lib/firebase/salaries';
import toast from 'react-hot-toast';
import { MonthPickerField } from './DateTimePickerField';

interface SalaryListProps {
  onEdit?: (salary: SalaryRecord) => void;
  refreshToken?: number;
}

const getCurrentMonthValue = () => new Date().toISOString().slice(0, 7);

export default function SalaryList({ onEdit, refreshToken = 0 }: SalaryListProps) {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthValue());
  const [filterMonthText, setFilterMonthText] = useState(() =>
    isoMonthToMmYyyy(getCurrentMonthValue())
  );

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

  const handleDelete = async (id: string) => {
    try {
      await deleteSalaryRecord(id);
      setSalaries((prev) => prev.filter((s) => s.id !== id));
      toast.success('Xóa bảng lương thành công');
    } catch (error) {
      toast.error('Lỗi khi xóa bảng lương');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecords = salaries.filter((salary) => salary.month === filterMonth);

  const commitFilterMonthText = () => {
    const normalized = normalizeMonthToIso(filterMonthText);
    if (!normalized) {
      toast.error('Tháng không hợp lệ. Dùng định dạng mm/yyyy');
      setFilterMonthText(isoMonthToMmYyyy(filterMonth));
      return;
    }

    setFilterMonth(normalized);
    setFilterMonthText(isoMonthToMmYyyy(normalized));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-auto">
          <label className="mb-1.5 ml-1 block text-sm font-semibold text-gray-700">
            Lọc theo tháng dữ liệu
          </label>
          <MonthPickerField
            value={filterMonthText}
            selectedMonth={filterMonth}
            inputClassName="h-12 w-full rounded-xl border border-gray-200 bg-white py-2 pl-4 text-[16px] leading-none text-gray-900 shadow-premium transition-all duration-200 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 sm:w-64"
            placeholder="mm/yyyy"
            accentClassName="bg-accent text-white"
            onTextChange={setFilterMonthText}
            onTextBlur={commitFilterMonthText}
            onSelectMonth={(nextMonth) => {
              setFilterMonth(nextMonth);
              setFilterMonthText(isoMonthToMmYyyy(nextMonth));
            }}
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
          Không tìm thấy dữ liệu lương cho tháng {isoMonthToMmYyyy(filterMonth)}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px] divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="whitespace-nowrap px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Nhân viên</th>
                  <th className="w-[100px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Ngày công</th>
                  <th className="w-[100px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Công đêm</th>
                  <th className="w-[80px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Nghỉ</th>
                  <th className="w-[110px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Ngày chuẩn</th>
                  <th className="w-[140px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Lương công</th>
                  <th className="w-[160px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Tổng phụ cấp</th>
                  <th className="w-[160px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Tổng bị trừ</th>
                  <th className="w-[160px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Thực lãnh</th>
                  <th className="w-[120px] whitespace-nowrap px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((salary) => (
                  <tr key={salary.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-5">
                      <p className="font-bold text-gray-900">{salary.employeeName}</p>
                    </td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-medium text-gray-600">{salary.dayShifts}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-medium text-gray-600">{salary.nightShifts}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-medium text-gray-600">{salary.leaveDays}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-medium text-gray-600">{salary.standardWorkingDays}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-semibold text-gray-900">{formatCurrency(salary.grossWorkSalary ?? 0)}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-bold text-emerald-600">{formatCurrency(salary.totalAllowance ?? 0)}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right font-bold text-rose-500">{formatCurrency(salary.totalDeduction ?? 0)}</td>
                    <td className="tabular-nums whitespace-nowrap px-6 py-5 text-right text-[15px] font-extrabold text-accent">{formatCurrency(salary.totalSalary ?? 0)}</td>
                    <td className="whitespace-nowrap px-6 py-5 text-center">
                      <div className="flex items-center justify-center">
                        {deletingId === salary.id ? (
                          <div className="flex items-center gap-1.5 rounded-full bg-rose-50 p-1 pr-2.5">
                            <button
                              type="button"
                              onClick={() => salary.id && handleDelete(salary.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition-all hover:bg-rose-600 active:scale-90"
                              title="Xác nhận xóa"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all hover:text-gray-600 active:scale-90"
                              title="Hủy"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <span className="text-[11px] font-bold tracking-tight text-rose-500 uppercase ml-1">Xóa?</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit?.(salary)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white text-accent shadow-sm transition-all hover:border-accent hover:bg-accent hover:text-white active:scale-95"
                              title="Chỉnh sửa"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(salary.id ?? null)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white text-rose-500 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 active:scale-95"
                              title="Xóa"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
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
