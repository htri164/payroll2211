# Hệ Thống Tính Lương Nhân Viên

Ứng dụng quản lý lương nhân viên được xây dựng bằng Next.js, Firebase, và Tailwind CSS. Ứng dụng hỗ trợ:

- 💼 **Quản lý Nhân viên**: Thêm, sửa, xóa thông tin nhân viên
- 💰 **Tính Lương**: Tính lương với phụ phí, thưởng, khấu trừ
- 🖨️ **In Phiếu Lương**: In hàng loạt với 4 phiếu/trang A4

## Yêu cầu

- Node.js 16+ và npm
- Tài khoản Firebase
- Vercel account (để deploy)

## Cài đặt Cục Bộ

### 1. Clone Repo
```bash
git clone <repo-url>
cd payroll
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Firebase

1. Tạo dự án mới tại [Firebase Console](https://console.firebase.google.com)
2. Chọn **Realtime Database** và tạo database
3. Đặt quy tắc bảo mật sang chế độ test:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> ⚠️ **Lưu ý**: Chỉ sử dụng cho phát triển. Trong production, cấu hình quy tắc bảo mật phù hợp

4. Lấy Firebase config từ Project Settings
5. Tạo file `.env.local`:

```bash
cp .env.local.example .env.local
```

Chỉnh sửa `.env.local` với Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Chạy localhost

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Deploy Vercel

1. Đẩy code lên GitHub
2. Vào [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **New Project**
4. Chọn repo GitHub
5. Thêm Environment Variables (tất cả `NEXT_PUBLIC_FIREBASE_*`)
6. Click **Deploy**

## Hướng Dẫn Sử Dụng

### Thêm Nhân Viên
- Vào **Quản lý Nhân viên**
- Nhập: Tên, Lương, Phụ cấp ăn
- Click **Thêm mới**

### Tính Lương
- Vào **Tính Lương**
- Chọn nhân viên, tháng
- Nhập phụ phí, thưởng, khấu trừ
- Click **Tính lương**

### In Phiếu Lương
- Vào **Tính Lương** → **In phiếu lương**
- Preview sẽ hiển thị 4 phiếu/trang
- Click **In** để in ra giấy A4

## Tính Năng

✅ Không cần đăng nhập
✅ Responsive design
✅ Tính lương tự động
✅ In chuyên nghiệp
✅ Firebase Realtime Database

## Cấu Trúc

```
src/
├── app/
│   ├── employees/
│   ├── salary/
│   ├── print/
│   └── page.tsx
├── components/
│   ├── EmployeeForm.tsx
│   ├── SalaryForm.tsx
│   └── SalarySlip.tsx
└── lib/firebase/
    ├── config.ts
    ├── employees.ts
    └── salaries.ts
```

## Liên Kết Hữu Ích

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
