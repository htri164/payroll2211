'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              💼 Payroll System
            </Link>
          </div>

          <div className="flex gap-6">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') ? 'bg-blue-800' : 'hover:bg-blue-500'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/employees"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/employees') ? 'bg-blue-800' : 'hover:bg-blue-500'
              }`}
            >
              Quản lý nhân viên
            </Link>
            <Link
              href="/salary"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/salary') ? 'bg-blue-800' : 'hover:bg-blue-500'
              }`}
            >
              Tính lương
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
