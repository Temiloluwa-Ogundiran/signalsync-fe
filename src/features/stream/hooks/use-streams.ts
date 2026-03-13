import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  streamApi,
  Stream,
  StreamDetail,
  StreamDiscoverItem,
  CreateStreamPayload,
} from "../api/stream.api";
import { useSession } from "next-auth/react";

export const useMyStreams = () => {
  const { data: session, status } = useSession();

  return useQuery<Stream[]>({
    queryKey: ["my-streams", session?.accessToken],
    queryFn: () => streamApi.getMyStreams(session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken,
  });
};

export const useDiscoverStreams = () => {
  const { data: session, status } = useSession();

  return useQuery<StreamDiscoverItem[]>({
    queryKey: ["discover-streams", session?.accessToken],
    queryFn: () => streamApi.discoverStreams(session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken,
  });
};

export const useStreamById = (streamId: string | undefined) => {
  const { data: session, status } = useSession();

  return useQuery<StreamDetail>({
    queryKey: ["stream-detail", streamId, session?.accessToken],
    queryFn: () =>
      streamApi.getStream(streamId!, session?.accessToken as string),
    enabled: status === "authenticated" && !!session?.accessToken && !!streamId,
  });
};

export const useFollowStream = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) =>
      streamApi.followStream(streamId, session?.accessToken as string),
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({
        queryKey: ["discover-streams", session?.accessToken],
      });
      queryClient.invalidateQueries({
        queryKey: ["stream-detail", streamId],
      });
    },
  });
};

export const useUnfollowStream = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) =>
      streamApi.unfollowStream(streamId, session?.accessToken as string),
    onSuccess: (_data, streamId) => {
      queryClient.invalidateQueries({
        queryKey: ["discover-streams", session?.accessToken],
      });
      queryClient.invalidateQueries({
        queryKey: ["stream-detail", streamId],
      });
    },
  });
};

export const useCreateStream = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStreamPayload) =>
      streamApi.createStream(payload, session?.accessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-streams"] });
      queryClient.invalidateQueries({
        queryKey: ["discover-streams", session?.accessToken],
      });
    },
  });
};

export const useUploadImage = () => {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: ({
      file,
      bucketType,
    }: {
      file: File;
      bucketType: "avatar" | "banner";
    }) =>
      streamApi.uploadImage(file, bucketType, session?.accessToken as string),
  });
};
