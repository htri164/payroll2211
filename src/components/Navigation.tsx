'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  // Hide navigation on print routes entirely
  if (pathname.startsWith('/print')) {
    return null;
  }

  const navItems = [
    {
      name: 'Trang chủ',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Nhân viên',
      href: '/employees',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Tính lương',
      href: '/salary',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const isActive = (path: string) => pathname === path;

  const sidebarContent = (
    <>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-300 group ${isActive(item.href)
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <span className={`${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-primary'} transition-colors`}>
              {item.icon}
            </span>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium">PayrollPro v0.1.0</p>
        <p className="text-xs text-gray-400 mt-0.5">© 2026 — Quản lý lương</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:hidden print:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-primary text-white p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className="font-bold text-lg text-gray-900 tracking-tight">Payroll<span className="text-primary italic">Pro</span></span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Mở menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Panel */}
        <aside
          className={`absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link href="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3">
              <span className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="font-black text-xl text-gray-900 tracking-tight">Payroll<span className="text-primary tracking-tighter italic">Pro</span></span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Đóng menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {sidebarContent}
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col print:hidden">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="bg-primary text-white p-2 rounded-xl group-hover:bg-primary-hover transition-all duration-300 shadow-lg shadow-primary/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="font-black text-xl text-gray-900 tracking-tight">Payroll<span className="text-primary tracking-tighter italic">Pro</span></span>
          </Link>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}
