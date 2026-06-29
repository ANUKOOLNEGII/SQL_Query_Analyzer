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
    const response = await axiosClient.get('/database');
    return response.data.map((c: any) => ({
      ...c,
      name: c.databaseName,
      type: c.databaseType
    }));
  },

  async createConnection(data: DBConnectionData) {
    const payload = {
      databaseType: data.type,
      host: data.host,
      port: Number(data.port),
      databaseName: data.databaseName,
      username: data.username,
      password: data.password
    };
    const response = await axiosClient.post('/database/connect', payload);
    return {
      ...response.data,
      name: response.data.databaseName,
      type: response.data.databaseType
    };
  },

  async testConnection(data: DBConnectionData) {
    const payload = {
      databaseType: data.type,
      host: data.host,
      port: Number(data.port),
      databaseName: data.databaseName,
      username: data.username,
      password: data.password
    };
    const response = await axiosClient.post('/database/test', payload);
    return response.data;
  },

  async getSchema(id: string) {
    const response = await axiosClient.get(`/database/schema/${id}`);
    return response.data;
  }
};
