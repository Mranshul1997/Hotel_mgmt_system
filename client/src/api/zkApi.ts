import axios from "axios";

const BASE_URL = "http://localhost:5000/api/zk";

export const fetchDeviceInfo = () => axios.get(`${BASE_URL}/device-info`);
export const fetchDeviceUsers = () => axios.get(`${BASE_URL}/device-users`);
export const fetchDeviceLogs = () => axios.get(`${BASE_URL}/device-logs`);
