import { configureStore } from '@reduxjs/toolkit';
import payrollReducer from './payrollSlice';

export const store = configureStore({
  reducer: {
    payroll: payrollReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
