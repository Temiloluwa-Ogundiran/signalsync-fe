import apiClient, { withAuth } from "@/lib/api/client";
import type {
  CSVConfirmResult,
  CSVPreviewResponse,
  PlatformInfo,
} from "../types";

export const csvImportApi = {
  listPlatforms: async (token?: string): Promise<PlatformInfo[]> => {
    const { data } = await apiClient.get<PlatformInfo[]>(
      "/csv-import/platforms",
      withAuth(token),
    );
    return data;
  },

  previewImport: async (
    file: File,
    platformId: string,
    timezone: string,
    token?: string,
  ): Promise<CSVPreviewResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("platform_id", platformId);
    formData.append("timezone", timezone);

    const { data } = await apiClient.post<CSVPreviewResponse>(
      "/csv-import/preview",
      formData,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },

  confirmImport: async (
    payload: {
      file: File;
      platformId: string;
      timezone: string;
      displayName: string;
      accountId?: string;
    },
    token?: string,
  ): Promise<CSVConfirmResult> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("platform_id", payload.platformId);
    formData.append("timezone", payload.timezone);
    formData.append("display_name", payload.displayName);
    if (payload.accountId) {
      formData.append("account_id", payload.accountId);
    }

    const { data } = await apiClient.post<CSVConfirmResult>(
      "/csv-import/confirm",
      formData,
      {
        ...withAuth(token),
        headers: {
          ...withAuth(token).headers,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },
};
