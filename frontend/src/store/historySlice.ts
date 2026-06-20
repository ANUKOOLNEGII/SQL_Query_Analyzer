import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface HistoryItem {
  id: string;
  createdAt: string;
  naturalQuery: string;
  generatedSQL: string;
  explanation: string;
  status: 'success' | 'error';
  executionTime: number; // in milliseconds
}

interface HistoryState {
  queryHistory: HistoryItem[];
  selectedQuery: HistoryItem | null;
}

const initialState: HistoryState = {
  queryHistory: [],
  selectedQuery: null,
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setQueryHistory: (state, action: PayloadAction<HistoryItem[]>) => {
      state.queryHistory = action.payload;
    },
    setSelectedQuery: (state, action: PayloadAction<HistoryItem | null>) => {
      state.selectedQuery = action.payload;
    },
    addHistoryItem: (state, action: PayloadAction<HistoryItem>) => {
      state.queryHistory.unshift(action.payload);
    },
    removeHistoryItem: (state, action: PayloadAction<string>) => {
      state.queryHistory = state.queryHistory.filter(h => h.id !== action.payload);
      if (state.selectedQuery?.id === action.payload) {
        state.selectedQuery = null;
      }
    }
  },
});

export const {
  setQueryHistory,
  setSelectedQuery,
  addHistoryItem,
  removeHistoryItem
} = historySlice.actions;

export default historySlice.reducer;
