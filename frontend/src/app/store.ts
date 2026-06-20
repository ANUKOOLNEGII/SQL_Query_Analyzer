import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import queryReducer from '../store/querySlice';
import datasetReducer from '../store/datasetSlice';
import historyReducer from '../store/historySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    query: queryReducer,
    dataset: datasetReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
