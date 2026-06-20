import { axiosClient } from './axiosClient';

export const datasetService = {
  async getDatasets() {
    const response = await axiosClient.get('/datasets');
    return response.data;
  },

  async uploadDataset(file: File) {
    // In mock mode, we simulate file parsing and send file name in body.
    // In real mode, we use FormData.
    const isMock = import.meta.env.VITE_USE_MOCK_API === 'true';
    
    if (isMock) {
      const response = await axiosClient.post('/datasets', { name: file.name });
      return response.data;
    } else {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosClient.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  },

  async deleteDataset(id: string) {
    const response = await axiosClient.delete(`/datasets/${id}`);
    return response.data;
  }
};
