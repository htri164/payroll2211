'use client';

import { useState, useEffect } from 'react';
import { SalaryRecord, getSalaryRecords } from '@/lib/firebase/salaries';
import { isConfigured } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SalaryList() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));

  useEffect(() => {
    if (isConfigured()) {
      fetchSalaries();
    }
  }, []);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const data = await getSalaryRecords();
      setSalaries(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải danh sách bảng lương';
      console.warn(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = salaries.filter((s) => s.month === filterMonth);

  return (
    <div className="space-y-8">
      {/* Month Filter */}
      <div className="flex flex-col sm:flex-row items-end gap-6">
        <div className="w-full sm:w-auto">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 ml-1">
            Lọc theo tháng dữ liệu
          </label>
          <div className="relative group">
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-12 w-full sm:w-64 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[16px] leading-none text-gray-900 shadow-premium focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all duration-200 pr-10 [&::-webkit-calendar-picker-indicator]:hidden"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <Link
          href="/salary/print"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all duration-300 premium-shadow group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          In phiếu lương hàng loạt
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)] font-sans">Đang tải...</span>
          </div>
          <p className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu bảng lương...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 mt-6">
          <p className="text-gray-400 text-lg font-medium">Không tìm thấy dữ liệu lương cho tháng {filterMonth}</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white shadow-premium overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-100 border border-gray-300">
                <th className="px-4 py-2 text-left font-semibold">Tên nhân viên</th>
                <th className="px-4 py-2 text-right font-semibold">Lương cơ bản</th>
                <th className="px-4 py-2 text-right font-semibold">Phụ cấp</th>
                <th className="px-4 py-2 text-right font-semibold">Phụ phí</th>
                <th className="px-4 py-2 text-right font-semibold">Thưởng</th>
                <th className="px-4 py-2 text-right font-semibold">Khấu trừ</th>
                <th className="px-4 py-2 text-right font-semibold">Tổng lương</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((salary: SalaryRecord) => (
                <tr key={salary.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2">{salary.employeeName}</td>
                  <td className="px-4 py-2 text-right">
                    {salary.baseSalary.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 text-right">
                    {salary.foodAllowance.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 text-right">
                    {salary.additionalFees.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 text-right">
                    {salary.bonus.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 text-right">
                    {salary.deductions.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-green-600">
                    {salary.totalSalary?.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
