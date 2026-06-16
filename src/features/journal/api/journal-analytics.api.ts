import apiClient, { withAuth } from "@/lib/api/client";
import type {
  CurveResponse,
  JournalAnalyticsDashboardResponse,
  JournalAnalyticsEvaluationResponse,
  JournalAnalyticsSummaryResponse,
  JournalAnalyticsTimePerformanceResponse,
} from "../types";

interface AnalyticsQueryParams {
  accountId?: string;
  fromDate: string;
  toDate: string;
  timeBasis?: "open" | "close";
  includeManual?: boolean;
}

export const journalAnalyticsApi = {
  getSummary: async (
    params: Omit<AnalyticsQueryParams, "timeBasis">,
    token?: string,
  ): Promise<JournalAnalyticsSummaryResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsSummaryResponse>(
      "/journal/analytics/summary",
      {
        ...withAuth(token),
        params: {
          ...(params.accountId ? { account_id: params.accountId } : {}),
          ...(params.fromDate ? { from_date: params.fromDate } : {}),
          ...(params.toDate ? { to_date: params.toDate } : {}),
          include_manual: params.includeManual !== undefined ? params.includeManual : undefined,
        },
      },
    );

    return data;
  },

  getTimePerformance: async (
    params: AnalyticsQueryParams,
    token?: string,
  ): Promise<JournalAnalyticsTimePerformanceResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsTimePerformanceResponse>(
      "/journal/analytics/time-performance",
      {
        ...withAuth(token),
        params: {
          ...(params.accountId ? { account_id: params.accountId } : {}),
          ...(params.fromDate ? { from_date: params.fromDate } : {}),
          ...(params.toDate ? { to_date: params.toDate } : {}),
          ...(params.timeBasis ? { time_basis: params.timeBasis } : {}),
          include_manual: params.includeManual !== undefined ? params.includeManual : undefined,
        },
      },
    );

    return data;
  },


  getEvaluation: async (
    params: Omit<AnalyticsQueryParams, "timeBasis">,
    token?: string,
  ): Promise<JournalAnalyticsEvaluationResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsEvaluationResponse>(
      "/journal/analytics/evaluation",
      {
        ...withAuth(token),
        params: {
          ...(params.accountId ? { account_id: params.accountId } : {}),
          ...(params.fromDate ? { from_date: params.fromDate } : {}),
          ...(params.toDate ? { to_date: params.toDate } : {}),
          include_manual: params.includeManual !== undefined ? params.includeManual : undefined,
        },
      },
    );

    return data;
  },

  getDashboard: async (
    params: AnalyticsQueryParams,
    token?: string,
  ): Promise<JournalAnalyticsDashboardResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsDashboardResponse>(
      "/journal/analytics/dashboard",
      {
        ...withAuth(token),
        params: {
          ...(params.accountId ? { account_id: params.accountId } : {}),
          ...(params.fromDate ? { from_date: params.fromDate } : {}),
          ...(params.toDate ? { to_date: params.toDate } : {}),
          recent_limit: 5,
          ...(params.timeBasis ? { time_basis: params.timeBasis } : {}),
          include_manual: params.includeManual !== undefined ? params.includeManual : undefined,
        },
      },
    );
    return data;
  },

  getCurve: async (
    params: Omit<AnalyticsQueryParams, "timeBasis"> & { granularity: "daily" | "intraday" },
    token?: string,
  ): Promise<CurveResponse> => {
    const { granularity, ...queryParams } = params;
    const { data } = await apiClient.get<CurveResponse>(
      "/journal/analytics/curve",
      {
        ...withAuth(token),
        params: {
          ...(queryParams.accountId ? { account_id: queryParams.accountId } : {}),
          ...(queryParams.fromDate ? { from_date: queryParams.fromDate } : {}),
          ...(queryParams.toDate ? { to_date: queryParams.toDate } : {}),
          granularity,
          include_manual: queryParams.includeManual !== undefined ? queryParams.includeManual : undefined,
        },
      },
    );
    return data;
  },
};

