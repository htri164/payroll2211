'use client';

import { useState } from 'react';
import EmployeeForm from '@/components/EmployeeForm';
import EmployeeList from '@/components/EmployeeList';
import type { Employee } from '@/lib/employees';

export const dynamic = 'force-dynamic';

export default function EmployeesPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [formEmployee, setFormEmployee] = useState<Employee | null>(null);

  const bumpRefresh = () => setRefreshToken((current) => current + 1);

  const handleFormSuccess = () => {
    setFormEmployee(null);
    bumpRefresh();
  };

  return (
    <main className="min-h-screen bg-background p-4 lg:p-10">
      <div className="w-full">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Quản Lý <span className="text-primary">Nhân Viên</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Tạo và chỉnh sửa trên cùng một form; bấm <span className="font-medium text-gray-700">Sửa</span> trên danh
            sách để nạp dữ liệu, sau đó <span className="font-medium text-gray-700">Cập nhật</span> để lưu.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-10 items-start lg:grid-cols-12">
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <span className="h-6 w-2 rounded-full bg-primary"></span>
              Thông tin nhân viên
            </h2>
            {formEmployee?.id && (
              <p className="mb-4 text-sm text-gray-600">
                Đang sửa: <span className="font-semibold text-gray-900">{formEmployee.name}</span>
              </p>
            )}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-premium">
              <EmployeeForm
                employee={formEmployee ?? undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => setFormEmployee(null)}
              />
            </div>
          </aside>

          <section className="min-w-0 lg:col-span-8">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <span className="h-6 w-2 rounded-full bg-success"></span>
              Danh sách hiện có
            </h2>
            <EmployeeList
              refreshToken={refreshToken}
              onRefresh={bumpRefresh}
              selectedEmployeeId={formEmployee?.id ?? null}
              onSelectEmployee={setFormEmployee}
              onClearSelection={() => setFormEmployee(null)}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

