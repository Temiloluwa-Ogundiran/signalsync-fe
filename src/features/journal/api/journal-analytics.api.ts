import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAnalyticsCalendarResponse,
  JournalAnalyticsDashboardResponse,
  JournalAnalyticsInstrumentsResponse,
  JournalAnalyticsSummaryResponse,
  JournalAnalyticsTimePerformanceResponse,
} from "../types";

interface AnalyticsQueryParams {
  accountId: string;
  fromDate: string;
  toDate: string;
}

export const journalAnalyticsApi = {
  getCalendar: async (
    params: AnalyticsQueryParams,
    token?: string,
  ): Promise<JournalAnalyticsCalendarResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsCalendarResponse>(
      "/journal/analytics/calendar",
      {
        ...withAuth(token),
        params: {
          account_id: params.accountId,
          from_date: params.fromDate,
          to_date: params.toDate,
        },
      },
    );

    return data;
  },

  getSummary: async (
    params: AnalyticsQueryParams,
    token?: string,
  ): Promise<JournalAnalyticsSummaryResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsSummaryResponse>(
      "/journal/analytics/summary",
      {
        ...withAuth(token),
        params: {
          account_id: params.accountId,
          from_date: params.fromDate,
          to_date: params.toDate,
        },
      },
    );

    return data;
  },

  getInstruments: async (
    params: AnalyticsQueryParams,
    token?: string,
  ): Promise<JournalAnalyticsInstrumentsResponse> => {
    const { data } = await apiClient.get<JournalAnalyticsInstrumentsResponse>(
      "/journal/analytics/instruments",
      {
        ...withAuth(token),
        params: {
          account_id: params.accountId,
          from_date: params.fromDate,
          to_date: params.toDate,
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
          account_id: params.accountId,
          from_date: params.fromDate,
          to_date: params.toDate,
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
          account_id: params.accountId,
          from_date: params.fromDate,
          to_date: params.toDate,
          recent_limit: 5,
        },
      },
    );
    return data;
  },
};
