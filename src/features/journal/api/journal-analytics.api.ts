import apiClient, { withAuth } from "@/lib/api/client";
import type {
  JournalAnalyticsCalendarResponse,
  JournalAnalyticsSummaryResponse,
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
};
