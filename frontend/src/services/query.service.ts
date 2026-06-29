import { axiosClient } from './axiosClient';

export interface GenerateQueryRequest {
  query: string;
  datasetId?: string;
  connectionId?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: string;
}

export interface ExecuteSQLRequest {
  sql: string;
  datasetId?: string;
  connectionId?: string;
  naturalQuery?: string;
}

export const queryService = {
  async generateQuery(data: GenerateQueryRequest) {
    const response = await axiosClient.post('/query/generate', data);
    return response.data;
  },

  async executeSQL(data: ExecuteSQLRequest) {
    const response = await axiosClient.post('/query/execute', data);
    return response.data;
  }
};
