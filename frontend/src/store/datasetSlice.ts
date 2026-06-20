import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DatasetColumn {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  createdAt: string;
  status: 'available' | 'processing' | 'error';
  columns?: DatasetColumn[];
}

export interface DatabaseSchema {
  tables: {
    name: string;
    columns: DatasetColumn[];
  }[];
  relationships?: {
    fromTable: string;
    fromColumn: string;
    toTable: string;
    toColumn: string;
  }[];
}

interface DatasetState {
  datasets: Dataset[];
  selectedDataset: Dataset | null;
  schema: DatabaseSchema | null;
}

const initialState: DatasetState = {
  datasets: [],
  selectedDataset: null,
  schema: null,
};

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setDatasets: (state, action: PayloadAction<Dataset[]>) => {
      state.datasets = action.payload;
    },
    setSelectedDataset: (state, action: PayloadAction<Dataset | null>) => {
      state.selectedDataset = action.payload;
    },
    setSchema: (state, action: PayloadAction<DatabaseSchema | null>) => {
      state.schema = action.payload;
    },
    addDataset: (state, action: PayloadAction<Dataset>) => {
      state.datasets.unshift(action.payload);
    },
    removeDataset: (state, action: PayloadAction<string>) => {
      state.datasets = state.datasets.filter(d => d.id !== action.payload);
      if (state.selectedDataset?.id === action.payload) {
        state.selectedDataset = null;
      }
    }
  },
});

export const {
  setDatasets,
  setSelectedDataset,
  setSchema,
  addDataset,
  removeDataset
} = datasetSlice.actions;

export default datasetSlice.reducer;
