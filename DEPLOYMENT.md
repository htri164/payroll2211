# Hướng Dẫn Deploy lên Vercel

## Bước 1: Chuẩn Bị Firebase

1. **Tạo Firebase Project**:
   - Vào [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Nhập tên project, chọn location
   - Click "Create project"

2. **Tạo Realtime Database**:
   - Vào "Build" → "Realtime Database"
   - Click "Create Database"
   - Chọn location gần bạn nhất
   - Chế độ: **Test mode** (để public)
   - Click "Enable"

3. **Cấu Hình Bảo Mật (Test Mode)**:
   - Vào tab "Rules"
   - Thay thế với:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - Click "Publish"

   > ⚠️ **LƯU Ý**: Chỉ dùng cho test. Trong production, cấu hình quy tắc bảo mật hợp lý.

4. **Lấy Firebase Config**:
   - Vào Project Settings (⚙️ icon)
   - Copy config từ phần "Web apps"
   - Bạn sẽ cần các giá trị: `apiKey`, `authDomain`, `databaseURL`, v.v.

## Bước 2: Push Code lên GitHub

```bash
# Initialize git (nếu chưa có)
git init
git add .
git commit -m "Initial commit - Payroll system"

# Create GitHub repo từ https://github.com/new
# Sau đó:
git remote add origin https://github.com/YOUR_USERNAME/payroll.git
git branch -M main
git push -u origin main
```

## Bước 3: Deploy trên Vercel

1. **Connect Vercel với GitHub**:
   - Vào [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Select GitHub repo
   - Click "Import"

2. **Set Environment Variables**:
   - Tìm phần "Environment Variables"
   - Thêm các biến từ Firebase config:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=<your_api_key>
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://<your-project>.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your_messaging_sender_id>
   NEXT_PUBLIC_FIREBASE_APP_ID=<your_app_id>
   ```

3. **Deploy**:
   - Click "Deploy"
   - Chờ quá trình hoàn thành (~2-5 phút)
   - Bấm vào URL để truy cập ứng dụng

## Bước 4: Cập Nhật Code (Auto Deploy)

Mỗi khi bạn push code lên GitHub, Vercel sẽ tự động deploy phiên bản mới.

```bash
# Sau khi chỉnh sửa code
git add .
git commit -m "Your message"
git push origin main

# Vercel sẽ tự động deploy ~1-2 phút sau
```

## FAQ

**Q: Firebase URL không đúng?**
- A: URL phải có format: `https://<PROJECT-NAME>.firebaseio.com`
- Xem lại ở Firebase Console → Realtime Database

**Q: "Permission denied" khi thêm nhân viên?**
- A: Kiểm tra Firebase Rules, phải để là public (`.read: true, .write: true`)

**Q: Ứng dụng chậm?**
- A: Đó là normal. Firebase free tier có giới hạn. Nâng cấp plan nếu cần.

**Q: Muốn share link với đồng nghiệp?**
- A: Copy Vercel public URL từ Dashboard, gửi cho họ. Không cần login.

## Kiểm Tra Deploy

Sau khi deploy:
1. Vào URL của app trên Vercel
2. Thêm nhân viên test
3. Tính lương test
4. In phiếu lương test
5. Nếu mọi thứ hoạt động → ✅ Success!

## Support

- **Firebase Issues**: Xem [Firebase Docs](https://firebase.google.com/docs)
- **Vercel Issues**: Xem [Vercel Docs](https://vercel.com/docs)
- **Next.js Issues**: Xem [Next.js Docs](https://nextjs.org/docs)
