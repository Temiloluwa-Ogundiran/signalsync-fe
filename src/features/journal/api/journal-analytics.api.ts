import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAnalyticsDashboardResponse,
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
          from_date: params.fromDate,
          to_date: params.toDate,
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
          from_date: params.fromDate,
          to_date: params.toDate,
          ...(params.timeBasis ? { time_basis: params.timeBasis } : {}),
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
          from_date: params.fromDate,
          to_date: params.toDate,
          recent_limit: 8,
          ...(params.timeBasis ? { time_basis: params.timeBasis } : {}),
          include_manual: params.includeManual !== undefined ? params.includeManual : undefined,
        },
      },
    );
    return data;
  },
};
