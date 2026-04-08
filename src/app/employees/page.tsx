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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Quản lý Nhân viên</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
          <section className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">Thêm nhân viên mới</h2>
            <EmployeeForm onSuccess={handleSuccess} />
          </section>

          <section className="rounded-lg bg-white p-6 shadow-md">
            <EmployeeList refreshToken={refreshToken} onRefresh={handleSuccess} />
          </section>
        </div>
      </div>
    </main>
  );
}