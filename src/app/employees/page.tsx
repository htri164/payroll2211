'use client';

import { useState } from 'react';
import EmployeeForm from '@/components/EmployeeForm';
import EmployeeList from '@/components/EmployeeList';

export const dynamic = 'force-dynamic';

export default function EmployeesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Quản lý Nhân viên</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thêm nhân viên mới</h2>
            <EmployeeForm onSuccess={handleSuccess} />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <EmployeeList key={refreshKey} onRefresh={handleSuccess} />
          </section>
        </div>
      </div>
    </main>
  );
}
