import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCustomRiskReportPdf } from "@utils/api";

export const fetchCustomRiskReport = createAsyncThunk<
  Blob,
  { companyId: number; sections: string[] },
  { rejectValue: string }
>(
  'reports/fetchCustomRiskReport',
  async ({ companyId, sections }, { rejectWithValue }) => {
    try {
      return await fetchCustomRiskReportPdf(companyId, sections);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);