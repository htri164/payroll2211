import { database, isConfigured } from './config';
import { ref, push, set, get, update, remove } from 'firebase/database';

export interface Employee {
  id?: string;
  name: string;
  salary: number;
  foodAllowance: number;
  position?: string;
  joinDate?: string;
}

const checkFirebaseConfig = () => {
  if (!isConfigured()) {
    throw new Error(
      'Firebase is not configured. Please set your Firebase credentials in .env.local'
    );
  }
};

// Add a new employee
export const addEmployee = async (employee: Employee) => {
  checkFirebaseConfig();
  try {
    const newEmployeeRef = push(ref(database, 'employees'));
    await set(newEmployeeRef, {
      name: employee.name,
      salary: employee.salary,
      foodAllowance: employee.foodAllowance,
      position: employee.position || '',
      joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
    });
    return { id: newEmployeeRef.key, ...employee };
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

// Get all employees
export const getEmployees = async () => {
  checkFirebaseConfig();
  try {
    const snapshot = await get(ref(database, 'employees'));
    const employees: Employee[] = [];
    snapshot.forEach((childSnapshot) => {
      employees.push({
        id: childSnapshot.key || '',
        ...childSnapshot.val(),
      });
    });
    return employees;
  } catch (error) {
    console.error('Error getting employees:', error);
    throw error;
  }
};

// Get a single employee
export const getEmployee = async (id: string) => {
  checkFirebaseConfig();
  try {
    const snapshot = await get(ref(database, `employees/${id}`));
    if (snapshot.exists()) {
      return {
        id: id,
        ...snapshot.val(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting employee:', error);
    throw error;
  }
};

// Update employee
export const updateEmployee = async (id: string, employee: Partial<Employee>) => {
  checkFirebaseConfig();
  try {
    await update(ref(database, `employees/${id}`), employee);
    return { id, ...employee };
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

// Delete employee
export const deleteEmployee = async (id: string) => {
  checkFirebaseConfig();
  try {
    await remove(ref(database, `employees/${id}`));
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};
