import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAnalyticsBalanceHistoryResponse,
  JournalAnalyticsCalendarResponse,
  JournalAnalyticsDashboardResponse,
  JournalAnalyticsInstrumentsResponse,
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

interface BalanceHistoryQueryParams extends Omit<AnalyticsQueryParams, "timeBasis"> {
  granularity: "intraday" | "day";
}

export const journalAnalyticsApi = {
  getCalendar: async (
    params: Omit<AnalyticsQueryParams, "timeBasis">,
    token?: string,
  ): Promise<JournalAnalyticsCalendarResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsCalendarResponse>(
      "/journal/analytics/calendar",
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

  getInstruments: async (
    params: Omit<AnalyticsQueryParams, "timeBasis">,
    token?: string,
  ): Promise<JournalAnalyticsInstrumentsResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsInstrumentsResponse>(
      "/journal/analytics/instruments",
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

  getBalanceHistory: async (
    params: BalanceHistoryQueryParams,
    token?: string,
  ): Promise<JournalAnalyticsBalanceHistoryResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsBalanceHistoryResponse>(
      "/journal/analytics/balance-history",
      {
        ...withAuth(token),
        params: {
          ...(params.accountId ? { account_id: params.accountId } : {}),
          from_date: params.fromDate,
          to_date: params.toDate,
          granularity: params.granularity,
          include_manual: params.includeManual !== undefined ? params.includeManual : undefined,
        },
      },
    );
    return data;
  },
};
