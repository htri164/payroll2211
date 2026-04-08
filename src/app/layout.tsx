import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navigation from "@/components/Navigation";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payroll Management System",
  description: "Hệ thống quản lý tính lương nhân viên",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 lg:pl-64 overflow-y-auto">
          <ClientLayout>
            {children}
          </ClientLayout>
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
