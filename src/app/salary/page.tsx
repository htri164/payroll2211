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
    <main className="min-h-screen bg-background p-4 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Tính Toán <span className="text-success">Lương Thưởng</span>
          </h1>
          <p className="mt-2 text-gray-500">Thiết lập các khoản phụ phí, thưởng và khấu trừ để tạo bảng lương hàng tháng.</p>
        </header>

        <div className="grid grid-cols-1 gap-12">
          <section className="bg-white rounded-3xl border border-gray-100 shadow-premium p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-2 h-7 bg-success rounded-full"></span>
              Nhập thông tin tính lương
            </h2>
            <SalaryForm onSuccess={handleSuccess} />
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-premium p-8 overflow-hidden">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-2 h-7 bg-accent rounded-full"></span>
              Danh sách bảng lương
            </h2>
            <SalaryList key={refreshKey} />
          </section>
        </div>
      </div>
    </main>
  );
}
