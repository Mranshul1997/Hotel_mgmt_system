import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "subadmin";
  };
}

export async function loginApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
    email,
  });
  return response.data;
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
}

export async function logoutApi(): Promise<{ message: string }> {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_BASE_URL}/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}
