import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

export const signupApi = (data: any) => axios.post(`${BASE_URL}/signup`, data);
export const loginApi = (data: any) => axios.post(`${BASE_URL}/login`, data);
export const profileApi = (token: string) =>
  axios.get(`${BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const updateProfileApi = (token: string, data: any) =>
  axios.put(`${BASE_URL}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
