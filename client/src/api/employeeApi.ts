// src/api/employeeApi.ts

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// --- Employee CRUD ---

export async function createEmployee(employeeData: any) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/users`,
    employeeData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function listEmployees() {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateEmployee(id: string, updateData: any) {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_BASE_URL}/users/${id}`,
    updateData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function deleteEmployee(id: string) {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_BASE_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// --- View Reports ---

export async function getMonthlyReport(params: { userId: string; month: number; year: number }) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/reports/monthly`,
    params,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function getDailyReport(params: { userId: string; month: number; year: number }) {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/reports/daily`,
    params,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function getPayrollReport(year: number, month: number) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/reports/payroll/${year}/${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// --- Download CSV/PDF ---

export async function downloadPayrollCsv(year: number, month: number) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/reports/payroll-csv/${year}/${month}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return response.data; // You can use FileSaver.js in frontend to download
}

export async function downloadPayrollPdf(year: number, month: number) {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_BASE_URL}/reports/payroll-pdf/${year}/${month}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return response.data; // Use FileSaver.js as needed
}
