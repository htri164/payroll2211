import { database, isConfigured } from './config';
import { ref, push, set, get, update, remove } from 'firebase/database';

export interface SalaryRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  foodAllowance: number;
  additionalFees: number;
  deductions: number;
  bonus: number;
  month: string; // YYYY-MM format
  totalSalary?: number;
  createdAt?: string;
}

const checkFirebaseConfig = () => {
  if (!isConfigured()) {
    throw new Error(
      'Firebase is not configured. Please set your Firebase credentials in .env.local'
    );
  }
};

// Calculate total salary
export const calculateTotalSalary = (record: SalaryRecord) => {
  return (
    record.baseSalary +
    record.foodAllowance +
    record.additionalFees +
    record.bonus -
    record.deductions
  );
};

// Add salary record
export const addSalaryRecord = async (record: SalaryRecord) => {
  checkFirebaseConfig();
  try {
    const totalSalary = calculateTotalSalary(record);
    const newRecordRef = push(ref(database, 'salaries'));
    await set(newRecordRef, {
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      baseSalary: record.baseSalary,
      foodAllowance: record.foodAllowance,
      additionalFees: record.additionalFees || 0,
      deductions: record.deductions || 0,
      bonus: record.bonus || 0,
      month: record.month,
      totalSalary: totalSalary,
      createdAt: new Date().toISOString(),
    });
    return { id: newRecordRef.key, ...record, totalSalary };
  } catch (error) {
    console.error('Error adding salary record:', error);
    throw error;
  }
};

// Get all salary records
export const getSalaryRecords = async () => {
  checkFirebaseConfig();
  try {
    const snapshot = await get(ref(database, 'salaries'));
    const records: SalaryRecord[] = [];
    snapshot.forEach((childSnapshot) => {
      records.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val(),
      });
    });
    return records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error getting salary records:', error);
    throw error;
  }
};

// Get salary records by month
export const getSalaryRecordsByMonth = async (month: string) => {
  checkFirebaseConfig();
  try {
    const records = await getSalaryRecords();
    return records.filter((r) => r.month === month);
  } catch (error) {
    console.error('Error getting salary records by month:', error);
    throw error;
  }
};

// Get salary record for employee
export const getEmployeeSalaryRecord = async (employeeId: string, month: string) => {
  checkFirebaseConfig();
  try {
    const records = await getSalaryRecords();
    return records.find((r) => r.employeeId === employeeId && r.month === month) || null;
  } catch (error) {
    console.error('Error getting employee salary record:', error);
    throw error;
  }
};

// Update salary record
export const updateSalaryRecord = async (id: string, record: Partial<SalaryRecord>) => {
  checkFirebaseConfig();
  try {
    await update(ref(database, `salaries/${id}`), record);
    return { id, ...record };
  } catch (error) {
    console.error('Error updating salary record:', error);
    throw error;
  }
};

// Delete salary record
export const deleteSalaryRecord = async (id: string) => {
  checkFirebaseConfig();
  try {
    await remove(ref(database, `salaries/${id}`));
  } catch (error) {
    console.error('Error deleting salary record:', error);
    throw error;
  }
};
