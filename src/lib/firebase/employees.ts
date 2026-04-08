import { ref, push, set, get, update, remove } from 'firebase/database';
import { database, isConfigured } from './config';
import {
  type Employee,
  createEmployeeDraft,
  getCurrentDateInputValue,
} from '@/lib/employees';

export type { Employee } from '@/lib/employees';

const checkFirebaseConfig = () => {
  if (!isConfigured()) {
    throw new Error(
      'Firebase is not configured. Please set your Firebase credentials in .env.local'
    );
  }
};

const employeesRef = () => ref(database, 'employees');
const employeeRef = (id: string) => ref(database, `employees/${id}`);

const normalizeEmployee = (employee: Partial<Employee>): Employee => {
  const draft = createEmployeeDraft(employee);

  return {
    ...draft,
    id: employee.id,
  };
};

export const addEmployee = async (employee: Employee) => {
  checkFirebaseConfig();

  const payload = {
    ...createEmployeeDraft(employee),
    joinDate: employee.joinDate || getCurrentDateInputValue(),
  };

  try {
    const newEmployeeRef = push(employeesRef());
    await set(newEmployeeRef, payload);

    return {
      id: newEmployeeRef.key ?? undefined,
      ...payload,
    };
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  checkFirebaseConfig();

  try {
    const snapshot = await get(employeesRef());

    if (!snapshot.exists()) {
      return [];
    }

    const employees: Employee[] = [];
    snapshot.forEach((childSnapshot) => {
      employees.push(
        normalizeEmployee({
          id: childSnapshot.key ?? undefined,
          ...childSnapshot.val(),
        })
      );
    });

    return employees.sort((first, second) => first.name.localeCompare(second.name, 'vi'));
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};

export const getEmployee = async (id: string) => {
  checkFirebaseConfig();

  try {
    const snapshot = await get(employeeRef(id));

    if (!snapshot.exists()) {
      return null;
    }

    return normalizeEmployee({
      id,
      ...snapshot.val(),
    });
  } catch (error) {
    console.error('Error getting employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, employee: Partial<Employee>) => {
  checkFirebaseConfig();

  const payload = {
    ...employee,
    ...(employee.joinDate ? { joinDate: employee.joinDate } : {}),
  };

  try {
    await update(employeeRef(id), payload);
    return { id, ...payload };
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const deleteEmployee = async (id: string) => {
  checkFirebaseConfig();

  try {
    await remove(employeeRef(id));
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};