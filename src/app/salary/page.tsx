'use client';

import { useState } from 'react';
import SalaryForm from '@/components/SalaryForm';
import SalaryList from '@/components/SalaryList';
import { type SalaryRecord } from '@/lib/firebase/salaries';

export const dynamic = 'force-dynamic';

export default function SalaryPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);

  const handleSuccess = () => {
    setRefreshToken((prev) => prev + 1);
  };

  const handleEdit = (salary: SalaryRecord) => {
    setEditingRecord(salary);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  return (
    <main className="min-h-screen bg-background p-4 lg:p-10">
      <div className="w-full">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Tính Toán <span className="text-success">Lương Thưởng</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Tính lương theo công ngày, công đêm, tạm ứng và các khoản phụ cấp, khấu trừ phát sinh trong tháng.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12">
          <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-premium">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <span className="h-7 w-2 rounded-full bg-success"></span>
              Nhập thông tin tính lương
            </h2>
            <SalaryForm
              editingRecord={editingRecord}
              refreshToken={refreshToken}
              onCancelEdit={handleCancelEdit}
              onSuccess={() => {
                handleCancelEdit();
                handleSuccess();
              }}
            />
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-premium">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <span className="h-7 w-2 rounded-full bg-accent"></span>
              Danh sách bảng lương
            </h2>
            <SalaryList onEdit={handleEdit} refreshToken={refreshToken} />
          </section>
        </div>
      </div>
    </main>
  );
}
