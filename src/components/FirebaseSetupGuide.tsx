'use client';

export default function FirebaseSetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">⚙️</span>
            <h1 className="text-3xl font-bold text-gray-900">Cấu hình Firebase</h1>
          </div>

          <p className="text-gray-600 mb-6 text-lg">
            Ứng dụng cần được cấu hình Firebase để hoạt động. Vui lòng làm theo các bước dưới đây:
          </p>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Bước 1: Tạo Firebase Project</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-3">
                <li>Vào <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a></li>
                <li>Đăng nhập bằng Google Account</li>
                <li>Click <strong>"Create Project"</strong> hoặc <strong>"Create a new project"</strong></li>
                <li>Nhập tên dự án (ví dụ: <code className="bg-gray-100 px-2 py-1 rounded">payroll-app</code>)</li>
                <li>Click <strong>"Create Project"</strong></li>
              </ol>
            </div>

            {/* Step 2 */}
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Bước 2: Tạo Realtime Database</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-3">
                <li>Vào tab <strong>"Build"</strong> → <strong>"Realtime Database"</strong></li>
                <li>Click <strong>"Create Database"</strong></li>
                <li>Chọn vị trí: <strong>Southeast Asia</strong> (gần Việt Nam)</li>
                <li>Chọn <strong>"Start in test mode"</strong> (không cần xác thực)</li>
                <li>Click <strong>"Enable"</strong></li>
              </ol>
            </div>

            {/* Step 3 */}
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Bước 3: Lấy Firebase Config</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-3">
                <li>Vào <strong>Project Settings</strong> (biểu tượng ⚙️ ở góc trái dưới)</li>
                <li>Chọn tab <strong>"General"</strong></li>
                <li>Scroll xuống phần <strong>"Your apps"</strong> → Click biểu tượng <strong>&lt;&gt; (Web)</strong></li>
                <li>
                  Copy toàn bộ config object, trông như thế này:
                  <pre className="bg-gray-900 text-green-400 p-4 rounded mt-2 text-sm overflow-x-auto">
{`const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "payroll-xxxxx.firebaseapp.com",
  databaseURL: "https://payroll-xxxxx.firebaseio.com",
  projectId: "payroll-xxxxx",
  storageBucket: "payroll-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};`}
                  </pre>
                </li>
              </ol>
            </div>

            {/* Step 4 */}
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Bước 4: Tạo .env.local File</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-3">
                <li>Mở file <code className="bg-gray-100 px-2 py-1 rounded">.env.local.example</code> trong project</li>
                <li>
                  Copy và dán vào file <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code>:
                  <pre className="bg-gray-900 text-green-400 p-4 rounded mt-2 text-sm overflow-x-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=payroll-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://payroll-xxxxx.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=payroll-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=payroll-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx`}
                  </pre>
                </li>
                <li>Lưu file <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code></li>
              </ol>
            </div>

            {/* Step 5 */}
            <div className="border-l-4 border-red-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Bước 5: Restart Dev Server</h3>
              <p className="text-gray-700 mb-3">Dừng dev server (Ctrl+C) và chạy lại:</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm">
npm run dev
              </pre>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-8 pt-6 border-t">
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo Firebase Project
            </a>
          </div>
        </div>

        {/* Video Guide */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Mẹo hữu ích</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ <strong>.env.local</strong> file được git ignore, an toàn không lộ credentials</li>
            <li>✓ Sau khi cấu hình, reload trang để thấy thay đổi</li>
            <li>✓ Nếu vẫn có lỗi, kiểm tra xem database URL có format đúng không</li>
            <li>✓ Database rules phải set thành <strong>Test mode (read/write public)</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
