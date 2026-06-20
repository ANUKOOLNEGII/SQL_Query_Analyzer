import { axiosClient } from './axiosClient';

export interface DBConnectionData {
  name: string;
  type: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
}

export const databaseService = {
  async getConnections() {
    const response = await axiosClient.get('/databases/connections');
    return response.data;
  },

  async createConnection(data: DBConnectionData) {
    const response = await axiosClient.post('/databases/connections', data);
    return response.data;
  },

  async testConnection(data: DBConnectionData) {
    const response = await axiosClient.post('/databases/test-connection', data);
    return response.data;
  }
};
