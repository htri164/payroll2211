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

  const filteredSalaries = salaries.filter((s) => s.month === filterMonth);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lọc theo tháng
          </label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-6">
          <Link
            href={`/print?month=${filterMonth}`}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
          >
            In phiếu lương
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : filteredSalaries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Không có bảng lương nào cho tháng này</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
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
            <tbody>
              {filteredSalaries.map((salary) => (
                <tr key={salary.id} className="border border-gray-300 hover:bg-gray-50">
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
