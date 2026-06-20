import { axiosClient } from './axiosClient';

export const historyService = {
  async getHistory() {
    const response = await axiosClient.get('/query/history');
    return response.data;
  },

  async getHistoryItem(id: string) {
    const response = await axiosClient.get(`/query/history/${id}`);
    return response.data;
  },

  async deleteHistoryItem(id: string) {
    const response = await axiosClient.delete(`/query/history/${id}`);
    return response.data;
  }
};
