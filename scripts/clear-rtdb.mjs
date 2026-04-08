#!/usr/bin/env node
/**
 * Xóa toàn bộ Firebase Realtime Database (gốc /).
 *
 * Cách 1 — Service account (khuyên dùng):
 *   - Tải JSON từ Firebase Console → Project settings → Service accounts
 *   - Trong .env.local thêm MỘT trong các dòng sau:
 *       GOOGLE_APPLICATION_CREDENTIALS=D:\\path\\to\\key.json
 *     hoặc (không cần file, dán cả JSON một dòng):
 *       FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
 *
 *   Chạy: npm run db:clear
 *
 * Cách 2 — Firebase CLI (đã firebase login):
 *   npm run db:clear:cli
 *
 * Lưu ý: Trong Console phải mở "Realtime Database", KHÔNG phải "Firestore".
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvLocal() {
  const envLocal = join(root, '.env.local');
  if (!existsSync(envLocal)) return;
  for (const line of readFileSync(envLocal, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvLocal();

const databaseURL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  process.env.FIREBASE_DATABASE_URL;
const credPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const credJsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const skipConfirm = process.argv.includes('--yes');

if (!databaseURL) {
  console.error(
    'Thiếu NEXT_PUBLIC_FIREBASE_DATABASE_URL trong .env.local.',
  );
  process.exit(1);
}

function getServiceAccount() {
  if (credJsonRaw && credJsonRaw.trim().startsWith('{')) {
    try {
      return JSON.parse(credJsonRaw);
    } catch {
      console.error('FIREBASE_SERVICE_ACCOUNT_JSON không phải JSON hợp lệ.');
      process.exit(1);
    }
  }
  if (credPath && existsSync(credPath)) {
    return JSON.parse(readFileSync(credPath, 'utf8'));
  }
  console.error(`
Không tìm thấy quyền Admin. Thêm vào .env.local MỘT trong các cách:

  1) Đường dẫn file JSON (khuyên dùng):
     GOOGLE_APPLICATION_CREDENTIALS=D:\\\\path\\\\to\\\\serviceAccount.json

  2) Hoặc dán nguyên nội dung JSON (một dòng) vào:
     FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

Sau đó chạy lại: npm run db:clear

Hoặc dùng CLI (đã chạy firebase login): npm run db:clear:cli
`);
  process.exit(1);
}

async function confirm() {
  if (skipConfirm) return;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await new Promise((resolve) => {
    rl.question(
      `Sẽ XÓA HẾT dữ liệu Realtime Database:\n  ${databaseURL}\nGõ đúng XÓA rồi Enter: `,
      resolve,
    );
  });
  rl.close();
  if (answer.trim() !== 'XÓA') {
    console.log('Đã hủy.');
    process.exit(0);
  }
}

await confirm();

const serviceAccount = getServiceAccount();

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });
}

const rtdb = admin.database();
const rootRef = rtdb.ref('/');

console.log('Đang xóa gốc / ...');
await rootRef.remove();

const after = await rootRef.once('value');
if (after.val() != null) {
  console.error(
    'Cảnh báo: sau khi xóa, gốc / vẫn còn dữ liệu. Kiểm tra URL database và quyền service account.',
  );
  process.exit(2);
}

console.log('OK — Realtime Database đã trống (gốc / không còn dữ liệu).');
console.log(
  'Nếu trên Console vẫn thấy dữ liệu: mở đúng tab "Realtime Database" (không phải Firestore) và F5.',
);
