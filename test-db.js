const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, './payroll-92871-firebase-adminsdk-fbsvc-851d39757b.json'));

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://payroll-92871-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

const db = getDatabase();

async function testWrite() {
  try {
    const testRef = db.ref('employees/test-blackbox');
    await testRef.set({ name: 'Test Employee', salary: 10000000, timestamp: new Date().toISOString() });
    console.log('✅ Test write SUCCESS');
    const snapshot = await testRef.once('value');
    console.log('Read back:', snapshot.val());
  } catch (error) {
    console.error('❌ Test write FAILED:', error.message);
  }
}

testWrite();
