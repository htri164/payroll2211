'use client';

import { useState } from 'react';
import SalaryForm from '@/components/SalaryForm';
import SalaryList from '@/components/SalaryList';

export const dynamic = 'force-dynamic';

export default function SalaryPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tính Lương</h1>

        <div className="grid gap-8">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nhập thông tin tính lương</h2>
            <SalaryForm onSuccess={handleSuccess} />
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Danh sách bảng lương</h2>
            <SalaryList key={refreshKey} />
          </section>
        </div>
      </div>
    </main>
  );
}
