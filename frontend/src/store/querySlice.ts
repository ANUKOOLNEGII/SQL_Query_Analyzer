import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number; // in milliseconds
}

interface QueryState {
  naturalQuery: string;
  generatedSQL: string;
  suggestions: string[];
  explanation: string;
  validation: ValidationResult | null;
  results: QueryResult | null;
}

const initialState: QueryState = {
  naturalQuery: '',
  generatedSQL: '',
  suggestions: [],
  explanation: '',
  validation: null,
  results: null,
};

export const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    setNaturalQuery: (state, action: PayloadAction<string>) => {
      state.naturalQuery = action.payload;
    },
    setGeneratedSQL: (state, action: PayloadAction<string>) => {
      state.generatedSQL = action.payload;
    },
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },
    setExplanation: (state, action: PayloadAction<string>) => {
      state.explanation = action.payload;
    },
    setValidation: (state, action: PayloadAction<ValidationResult>) => {
      state.validation = action.payload;
    },
    setResults: (state, action: PayloadAction<QueryResult | null>) => {
      state.results = action.payload;
    },
    clearQueryState: (state) => {
      state.naturalQuery = '';
      state.generatedSQL = '';
      state.suggestions = [];
      state.explanation = '';
      state.validation = null;
      state.results = null;
    }
  },
});

export const {
  setNaturalQuery,
  setGeneratedSQL,
  setSuggestions,
  setExplanation,
  setValidation,
  setResults,
  clearQueryState
} = querySlice.actions;

export default querySlice.reducer;
