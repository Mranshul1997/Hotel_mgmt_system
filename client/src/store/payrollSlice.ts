import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PayrollState {
  totalDeductions: number;
}

const initialState: PayrollState = {
  totalDeductions: 0,
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    setTotalDeductions(state, action: PayloadAction<number>) {
      state.totalDeductions = action.payload;
    },
  },
});

export const { setTotalDeductions } = payrollSlice.actions;
export default payrollSlice.reducer;
