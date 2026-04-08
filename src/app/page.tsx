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
      if (error instanceof Error && error.message.includes('Firebase is not configured')) {
        setStats({ employees: 0, salaryRecords: 0 });
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Quản Lý <span className="text-primary">Payroll</span> Chuyên Nghiệp
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Giải pháp toàn diện cho việc quản lý nhân sự, tính toán lương và in ấn phiếu lương tự động.
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-premium premium-shadow group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-primary-light rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Tổng nhân viên</p>
                  <p className="text-5xl font-extrabold text-gray-900 mt-1">
                    {stats.employees}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-premium premium-shadow group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-success-light rounded-2xl text-success group-hover:bg-success group-hover:text-white transition-all duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Bảng lương tháng</p>
                  <p className="text-5xl font-extrabold text-gray-900 mt-1">
                    {stats.salaryRecords}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Employee Management Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-8 premium-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Nhân Viên</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Quản lý hồ sơ nhân sự tập trung. Thiết lập lương cơ bản, phụ cấp và theo dõi ngày gia nhập.
            </p>
            <Link
              href="/employees"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-all w-full justify-center group"
            >
              <span>Quản lý ngay</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Salary Calculation Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-8 premium-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tính Lương</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Tự động hóa việc tính toán lương hàng tháng. Hỗ trợ thưởng, phạt và các khoản phụ phí phát sinh.
            </p>
            <Link
              href="/salary"
              className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white font-semibold rounded-xl hover:bg-success-hover transition-all w-full justify-center group"
            >
              <span>Tính toán lương</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Export Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-8 premium-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">In Phiếu Lương</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Xuất dữ liệu và in phiếu lương hàng loạt theo tháng. Tối ưu hóa 4 phiếu trên mỗi trang A4.
            </p>
            <Link
              href="/salary"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all w-full justify-center group"
            >
              <span>Xem bảng in</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
