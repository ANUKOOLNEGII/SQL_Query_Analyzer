import { axiosClient } from './axiosClient';

// Map the backend's DB field names to what the frontend components expect
const mapDataset = (d: any) => ({
  ...d,
  name: d.datasetName || d.name || '',
  rowCount: d.totalRows ?? d.rowCount ?? 0,
  columnCount: d.totalColumns ?? d.columnCount ?? 0,
  status: d.status || 'available',
  columns: (d.columns || []).map((col: any) => ({
    ...col,
    name: col.columnName || col.name || '',
    type: col.dataType || col.type || 'text',
    isNullable: col.isNullable ?? true,
    isPrimaryKey: col.isPrimaryKey ?? false,
    isForeignKey: col.isForeignKey ?? false,
  })),
});

export const datasetService = {
  async getDatasets() {
    const response = await axiosClient.get('/dataset');
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map(mapDataset);
  },

  async uploadDataset(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/dataset/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return mapDataset(response.data);
  },

  async getDataset(id: string) {
    const response = await axiosClient.get(`/dataset/${id}`);
    return mapDataset(response.data);
  },

  async deleteDataset(id: string) {
    const response = await axiosClient.delete(`/dataset/${id}`);
    return response.data;
  }
};
