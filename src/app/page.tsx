'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getEmployees } from '@/lib/firebase/employees';
import { getSalaryRecords } from '@/lib/firebase/salaries';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [stats, setStats] = useState({
    employees: 0,
    salaryRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employees, salaries] = await Promise.all([
        getEmployees(),
        getSalaryRecords(),
      ]);
      setStats({
        employees: employees.length,
        salaryRecords: salaries.length,
      });
    } catch (error) {
      // Firebase not configured - this is expected before setup
      if (error instanceof Error && error.message.includes('Firebase is not configured')) {
        setStats({
          employees: 0,
          salaryRecords: 0,
        });
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            💼 Hệ Thống Tính Lương
          </h1>
          <p className="text-xl text-gray-600">
            Quản lý nhân viên và tính lương một cách hiệu quả
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tổng nhân viên</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {stats.employees}
                  </p>
                </div>
                <div className="text-5xl">👥</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Bảng lương</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {stats.salaryRecords}
                  </p>
                </div>
                <div className="text-5xl">📋</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Employee Management Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold">👥 Quản lý Nhân viên</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Thêm, sửa, xóa thông tin nhân viên, bao gồm lương cơ bản và phụ cấp ăn
              </p>
              <Link
                href="/employees"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đi tới
              </Link>
            </div>
          </div>

          {/* Salary Calculation Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-green-600 p-6 text-white">
              <h2 className="text-2xl font-bold">💰 Tính Lương</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Nhập phụ phí, thưởng, khấu trừ và tính toán lương tháng cho nhân viên
              </p>
              <Link
                href="/salary"
                className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Đi tới
              </Link>
            </div>
          </div>

          {/* Print Salary Slip Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">🖨️ In Phiếu Lương</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                In phiếu lương theo tháng, 4 phiếu trên 1 trang A4
              </p>
              <Link
                href="/salary"
                className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Xem bảng lương
              </Link>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">📖 Hướng dẫn sử dụng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">1. Quản lý Nhân viên</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Thêm thông tin nhân viên mới</li>
                <li>✓ Nhập lương cơ bản và phụ cấp</li>
                <li>✓ Sửa hoặc xóa nhân viên</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">2. Tính Lương</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Chọn nhân viên và tháng</li>
                <li>✓ Nhập các phụ phí thêm</li>
                <li>✓ Thêm thưởng hoặc khấu trừ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">3. In Phiếu Lương</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Chọn tháng cần in</li>
                <li>✓ Xem danh sách phiếu lương</li>
                <li>✓ In ra giấy A4 (4 phiếu/trang)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
