import dotenv from 'dotenv';
dotenv.config();

import ZKLib from 'node-zklib';

const ZK_IP = process.env.ZK_IP || "10.20.0.7";
const ZK_PORT = Number(process.env.ZK_PORT) || 4370;
const ZK_TIMEOUT = Number(process.env.ZK_TIMEOUT) || 10000;
const ZK_INBUFFER = Number(process.env.ZK_INBUFFER) || 4000;

export class ZKDeviceService {
  zk: any;

  constructor(ip: string, port = 4370, timeout = 10000, inbuf = 4000) {
    this.zk = new ZKLib(ip, port, timeout, inbuf);
  }

  async connect() {
    await this.zk.createSocket();
  }

  async disconnect() {
    await this.zk.disconnect();
  }

  async getDeviceInfo() {
    return await this.zk.getInfo();
  }

  async getUsers() {
    return await this.zk.getUsers();
  }

  async getAttendances() {
    return await this.zk.getAttendances();
  }

  async getRealTimeLogs(callback: (data: any) => void) {
    this.zk.getRealTimeLogs(callback);
  }

  async clearDeviceLogs() {
    await this.zk.clearAttendanceLog();
  }
}
