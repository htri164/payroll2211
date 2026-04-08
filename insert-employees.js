const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, './payroll-92871-firebase-adminsdk-fbsvc-851d39757b.json');
const serviceAccount = require(serviceAccountPath);

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://payroll-92871-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

const db = getDatabase();

const rawDataLines = [
  'Liêm (bảo trì)		15,000	400',
  'Dứa (bốc vác)	01/02	7,500	400',
  'Ngoan (phụ xẻ)	01/02	8,000	440',
  'Nhuận Z	01/02	14,500	400',
  'Khởi (xẻ)	01/02	7,800	440',
  'Yến	01/02	7,800	440',
  'Trinh	01/02	7,800	440',
  'Cường	01/02	19,000	440',
  'Dương Anh Z	01/02	14,500	440',
  'Đạt Z	01/02	14,500	440',
  'Chinh 	01/02	10,000	440',
  'Sang (li tâm)	01/02	7,500	440',
  'Bảy (li tâm)	01/02	7,500	440',
  'Hạnh (bó)	01/02	7,800	440',
  'Linh (bó) mới	01/02	7,800	440',
  'Ngọc (bó)	01/02	7,800	440',
  'Thái (bó)	01/02	7,000	440',
  'Thiện (xẻ)	01/02	7,800	440',
  'Sang (xẻ)	01/02	7,800	440',
  'Bằng (xẻ)	01/02	7,800	440',
  'Luân (xẻ)	01/02	7,800	440',
  'Dũng (p.căng)	01/02	16,000	440',
  'Thạch (p.căng)	01/02	11,500	440',
  'Tiến	01/02	19,000	1,080',
  'Đoàn	01/02	22,000	380',
  'Dũng( tài xế)	01/02	15,000	260',
  'Tứng (lơ)	01/02	7,500	260',
  'Phú (lơ)	01/02	7,800	260',
  'Đô (tài xế)	01/02	12,500	260',
  'Bé Anh (lơ)	01/02	7,500	260',
  'Đến (lơ)	01/02	7,500	260',
  'Hải	01/02	40,000	',
  'Quyên	01/02	14,000	400',
  'Ca	01/02	11,000	400',
  'H.Anh (cân màu)	01/02	13,000	400',
  'H.Anh (quấn cây)	01/02	5,000	',
  'Oanh (test mẫu)	01/02	22,000	320',
  'Mi (p.dịch)	01/02	15,000	340',
  'Luân 	01/02	18,000	400',
  'Kiệt Z	01/02	19,000	440',
  'Không Z	01/02	14,500	440',
  'Xil 	01/02	14,500	440',
  'Hoàng (Z)	01/02	14,500	400',
  'Hưng Z	01/02	14,500	440',
  'Nghĩa (li tâm)	01/02	7,800	440',
  'Trực (li tâm)	01/02	7,800	440',
  'Đan (Xẻ)	01/02	7,800	440',
  'Hiếu (xẻ)	01/02	7,800	440',
  'Nhựt (xẻ)	01/02	7,800	440',
  'Dương (xẻ)	01/02	7,500	440',
  'Ngân (bó)	01/02	7,800	440',
  'Diện (bó)	01/02	7,800	440',
  'Na (bó)	01/02	7,800	420',
  'Linh (bó)	01/02	7,800	440',
  'Vĩnh (phụ căng)	01/02	8,000	440',
  'Phú (căng)	01/02	17,000	440',
  'Thuấn	01/02	19,000	400',
  'Việt (lò)	01/02	11,000	440',
  'Na (lò)	01/02	11,000	440',
  'Hoàng (lò)	01/02	11,000	440',
  'Minh Anh (lò)	01/02	11,000	440',
  'Phong (lò)	01/02	11,000	440',
  'Sơn (củi)	01/02	11,000	440',
  'Dũng (xe c.Mai)	01/02	10,000	1,000'
];

async function main() {
  let count = 0;
  let skipCount = 0;

  for (const line of rawDataLines) {
    const parts = line.split('\t').map(p => p.trim()).filter(p => p);
    if (parts.length < 2) {
      skipCount++;
      continue;
    }

    const name = parts[0];
    // Skip invalid/special entries
    if (!name || name.includes('Xăng') || name.includes('Chú Sơn') || name.match(/^\s*$/)) {
      skipCount++;
      continue;
    }

    const joinDateStr = parts[1];
    let joinDate = '2024-02-01'; // default
    if (joinDateStr.match(/^\d{1,2}\/\d{2}$/)) {
      const [day, month] = joinDateStr.split('/');
      joinDate = `2024-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    let salaryStr = parts[2] || '0';
    let salary = parseInt(salaryStr.replace(/,/g, '')) * 1000 || 0;

    let foodAllowanceStr = parts[3] || '0';
    let foodAllowance = parseInt(foodAllowanceStr.replace(/,/g, '')) || 0;

    const employee = {
      name: name.replace(/\s*\([^)]*\)/, '').trim(), // clean name (no position)
      salary,
      foodAllowance,
      joinDate,
      factory: 'Xưởng 1',
    };

    try {
      const newRef = db.ref('employees').push();
      await newRef.set(employee);
      console.log(`✅ Inserted: ${employee.name} - ${salary.toLocaleString()}đ + ${foodAllowance} food`);
      count++;
    } catch (error) {
      console.error(`❌ Failed ${name}:`, error.message);
      skipCount++;
    }
  }

  console.log(`\n📊 Summary: Inserted ${count} employees, skipped ${skipCount}`);
}

main().catch((error) => {
  console.error('💥 Script error:', error);
  process.exit(1);
});

