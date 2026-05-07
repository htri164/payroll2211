import { database, isConfigured } from './config';
import { ref, push, set, get, update, remove } from 'firebase/database';
import {
  getStandardWorkingDays,
  normalizeWorkSchedule,
  type WorkSchedule,
} from '@/lib/employees';

export const STANDARD_WORKING_DAYS = 26;
export const NIGHT_SHIFT_ALLOWANCE = 20_000;
export const FOOD_ALLOWANCE_PER_DAY = 40_000;
export const FULL_ATTENDANCE_BONUS = 300_000;
export const HOUSING_ALLOWANCE = 200_000;
export const HOUSING_ALLOWANCE_MIN_WORKED_DAYS = 20;
export const MAX_MANUAL_ALLOWANCE_LINES = 20;
export const MAX_MANUAL_ALLOWANCE_LABEL_LENGTH = 80;

export interface ManualAllowanceLine {
  label: string;
  amount: number;
}

export interface SalaryRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  workSchedule?: WorkSchedule;
  foodAllowanceDays?: number;
  foodAllowance: number;
  standardWorkingDays: number;
  workingDayRate?: number;
  dayShifts: number;
  nightShifts: number;
  leaveDays: number;
  advancePayment: number;
  attendanceBonus: number;
  otherAllowance: number;
  /** Các dòng tự nhập (tên + số tiền), cộng thêm vào phụ cấp */
  manualAllowanceLines?: ManualAllowanceLine[];
  /** Tổng các dòng manual (đọc/ghi phụ để hiển thị; luôn có thể suy ra từ manualAllowanceLines) */
  manualAllowanceTotal?: number;
  otherDeduction: number;
  grossWorkSalary?: number;
  nightAllowance?: number;
  totalAllowance?: number;
  totalDeduction?: number;
  month: string;
  totalSalary?: number;
  createdAt?: string;
  additionalFees?: number;
  deductions?: number;
  bonus?: number;
}

const checkFirebaseConfig = () => {
  if (!isConfigured()) {
    throw new Error(
      'Firebase is not configured. Please set your Firebase credentials in .env.local'
    );
  }
};

const toSafeNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export const normalizeManualAllowanceLines = (raw: unknown): ManualAllowanceLine[] => {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === 'object') {
    list = Object.values(raw as Record<string, unknown>);
  } else {
    return [];
  }
  const out: ManualAllowanceLine[] = [];
  for (const item of list) {
    const row = item as Record<string, unknown>;
    const label =
      typeof row.label === 'string'
        ? row.label.trim().slice(0, MAX_MANUAL_ALLOWANCE_LABEL_LENGTH)
        : '';
    if (!label) continue;
    const amount = Math.round(toSafeNumber(row.amount));
    out.push({ label, amount });
    if (out.length >= MAX_MANUAL_ALLOWANCE_LINES) break;
  }
  return out;
};

const sumManualAllowance = (lines: ManualAllowanceLine[]) =>
  lines.reduce((sum, line) => sum + toSafeNumber(line.amount), 0);

export const buildSalaryRecord = (record: SalaryRecord): SalaryRecord => {
  const workSchedule = normalizeWorkSchedule(record.workSchedule);
  const computedStandardWorkingDays = getStandardWorkingDays(record.month, workSchedule);
  const standardWorkingDays =
    toSafeNumber(record.standardWorkingDays) ||
    computedStandardWorkingDays ||
    STANDARD_WORKING_DAYS;
  const leaveDays = toSafeNumber(record.leaveDays);
  const workedDays = Math.max(0, standardWorkingDays - leaveDays);
  const dayShifts = workedDays;
  const nightShifts = toSafeNumber(record.nightShifts);
  const advancePayment = toSafeNumber(record.advancePayment);
  const attendanceBonus = leaveDays === 0 ? FULL_ATTENDANCE_BONUS : 0;
  const otherAllowanceBase =
    workedDays >= HOUSING_ALLOWANCE_MIN_WORKED_DAYS ? HOUSING_ALLOWANCE : 0;
  const manualAllowanceLines = normalizeManualAllowanceLines(record.manualAllowanceLines);
  const manualAllowanceTotal = sumManualAllowance(manualAllowanceLines);
  const otherDeduction = 0;
  const workingDayRate =
    standardWorkingDays > 0
      ? Math.round(toSafeNumber(record.baseSalary) / standardWorkingDays)
      : 0;
  const grossWorkSalary =
    standardWorkingDays > 0
      ? Math.round((toSafeNumber(record.baseSalary) / standardWorkingDays) * workedDays)
      : 0;
  const rawFoodAllowanceDays = record.foodAllowanceDays;
  const foodAllowanceDays =
    rawFoodAllowanceDays === undefined
      ? Math.round(toSafeNumber(record.foodAllowance) / FOOD_ALLOWANCE_PER_DAY)
      : toSafeNumber(rawFoodAllowanceDays);
  const foodAllowance =
    rawFoodAllowanceDays === undefined
      ? toSafeNumber(record.foodAllowance)
      : foodAllowanceDays * FOOD_ALLOWANCE_PER_DAY;
  const nightAllowance = nightShifts * NIGHT_SHIFT_ALLOWANCE;
  const totalAllowance =
    foodAllowance +
    nightAllowance +
    attendanceBonus +
    otherAllowanceBase +
    manualAllowanceTotal;
  const totalDeduction = advancePayment + otherDeduction;
  const totalSalary = grossWorkSalary + totalAllowance - totalDeduction;

  return {
    ...record,
    workSchedule,
    foodAllowanceDays,
    foodAllowance,
    standardWorkingDays,
    workingDayRate,
    dayShifts,
    nightShifts,
    leaveDays,
    advancePayment,
    attendanceBonus,
    otherAllowance: otherAllowanceBase,
    manualAllowanceTotal,
    manualAllowanceLines,
    otherDeduction,
    grossWorkSalary,
    nightAllowance,
    totalAllowance,
    totalDeduction,
    totalSalary,
  };
};

export const calculateTotalSalary = (record: SalaryRecord) =>
  buildSalaryRecord(record).totalSalary ?? 0;

export const addSalaryRecord = async (record: SalaryRecord) => {
  checkFirebaseConfig();
  try {
    const normalizedRecord = buildSalaryRecord(record);
    const newRecordRef = push(ref(database, 'salaries'));
    await set(newRecordRef, {
      employeeId: normalizedRecord.employeeId,
      employeeName: normalizedRecord.employeeName,
      baseSalary: normalizedRecord.baseSalary,
      workSchedule: normalizedRecord.workSchedule,
      foodAllowanceDays: normalizedRecord.foodAllowanceDays ?? 0,
      foodAllowance: normalizedRecord.foodAllowance,
      standardWorkingDays: normalizedRecord.standardWorkingDays,
      workingDayRate: normalizedRecord.workingDayRate,
      dayShifts: normalizedRecord.dayShifts,
      nightShifts: normalizedRecord.nightShifts,
      leaveDays: normalizedRecord.leaveDays,
      advancePayment: normalizedRecord.advancePayment,
      attendanceBonus: normalizedRecord.attendanceBonus,
      otherAllowance: normalizedRecord.otherAllowance,
      manualAllowanceLines: normalizedRecord.manualAllowanceLines ?? [],
      manualAllowanceTotal: normalizedRecord.manualAllowanceTotal ?? 0,
      otherDeduction: normalizedRecord.otherDeduction,
      grossWorkSalary: normalizedRecord.grossWorkSalary,
      nightAllowance: normalizedRecord.nightAllowance,
      totalAllowance: normalizedRecord.totalAllowance,
      totalDeduction: normalizedRecord.totalDeduction,
      month: normalizedRecord.month,
      totalSalary: normalizedRecord.totalSalary,
      createdAt: new Date().toISOString(),
    });
    return { id: newRecordRef.key ?? undefined, ...normalizedRecord };
  } catch (error) {
    console.error('Error adding salary record:', error);
    throw error;
  }
};

export const getSalaryRecords = async () => {
  checkFirebaseConfig();
  try {
    const snapshot = await get(ref(database, 'salaries'));
    const records: SalaryRecord[] = [];
    snapshot.forEach((childSnapshot) => {
      records.push(
        buildSalaryRecord({
          id: childSnapshot.key || '',
          ...childSnapshot.val(),
        })
      );
    });
    return records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error getting salary records:', error);
    throw error;
  }
};

export const getSalaryRecordsByMonth = async (month: string) => {
  checkFirebaseConfig();
  try {
    const records = await getSalaryRecords();
    return records.filter((record) => record.month === month);
  } catch (error) {
    console.error('Error getting salary records by month:', error);
    throw error;
  }
};

export const getEmployeeSalaryRecord = async (employeeId: string, month: string) => {
  checkFirebaseConfig();
  try {
    const records = await getSalaryRecords();
    return records.find((record) => record.employeeId === employeeId && record.month === month) || null;
  } catch (error) {
    console.error('Error getting employee salary record:', error);
    throw error;
  }
};

export const updateSalaryRecord = async (id: string, record: Partial<SalaryRecord>) => {
  checkFirebaseConfig();
  try {
    const payload = buildSalaryRecord({
      employeeId: '',
      employeeName: '',
      baseSalary: 0,
      workSchedule: 'sunday-off',
      foodAllowanceDays: 0,
      foodAllowance: 0,
      standardWorkingDays: STANDARD_WORKING_DAYS,
      dayShifts: 0,
      nightShifts: 0,
      leaveDays: 0,
      advancePayment: 0,
      attendanceBonus: 0,
      otherAllowance: 0,
      manualAllowanceLines: [],
      otherDeduction: 0,
      month: '',
      ...record,
    });

    await update(ref(database, `salaries/${id}`), payload);
    return { id, ...payload };
  } catch (error) {
    console.error('Error updating salary record:', error);
    throw error;
  }
};

export const deleteSalaryRecord = async (id: string) => {
  checkFirebaseConfig();
  try {
    await remove(ref(database, `salaries/${id}`));
  } catch (error) {
    console.error('Error deleting salary record:', error);
    throw error;
  }
};
