'use client';

import { useState } from 'react';
import EmployeeForm from '@/components/EmployeeForm';
import EmployeeList from '@/components/EmployeeList';

export const dynamic = 'force-dynamic';

export default function EmployeesPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  const handleSuccess = () => {
    setRefreshToken((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-background p-4 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Quản Lý <span className="text-primary">Nhân Viên</span>
          </h1>
          <p className="mt-2 text-gray-500">Thêm mới, chỉnh sửa và quản lý danh sách nhân sự của bạn.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form Side */}
          <aside className="lg:col-span-4 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Thêm nhân viên mới
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-premium p-6">
              <EmployeeForm onSuccess={handleSuccess} />
            </div>
          </aside>

          {/* List Side */}
          <section className="lg:col-span-8 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-success rounded-full"></span>
              Danh sách hiện có
            </h2>
            <EmployeeList refreshToken={refreshToken} onRefresh={handleSuccess} />
          </section>
        </div>
      </div>
    </main>
  );
}

