import axios from "axios";

export interface ShiftType {
  _id?: string;
  name: string;
  checkInTime: string;
  checkOutTime: string;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = "http://localhost:5000/api/shifts";

export async function listShifts(): Promise<ShiftType[]> {
  const res = await axios.get(BASE_URL);
  return res.data;
}

export async function createShift(data: Omit<ShiftType, "_id">): Promise<ShiftType> {
  const res = await axios.post(BASE_URL, data);
  return res.data;
}

export async function updateShift(id: string, data: Partial<ShiftType>): Promise<ShiftType> {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

export async function deleteShift(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}
