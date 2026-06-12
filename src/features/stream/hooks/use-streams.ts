import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  streamApi,
  Stream,
  StreamDetail,
  StreamDiscoverItem,
  CreateStreamPayload,
  PaginatedMemberListResponse,
  PaginatedJoinRequestResponse,
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

const MEMBERS_PAGE_SIZE = 50;

export const useStreamMembers = (streamId: string | undefined) => {
  const { data: session, status } = useSession();

  // TPageParam is string | null to match initialPageParam and the API cursor type.
  // getNextPageParam returns null (no more pages) or string (next cursor).
  return useInfiniteQuery<
    PaginatedMemberListResponse,
    Error,
    PaginatedMemberListResponse,
    unknown[],
    string | null
  >({
    queryKey: ["stream-members", streamId, session?.accessToken],
    queryFn: ({ pageParam }) =>
      streamApi.getStreamMembers(
        streamId!,
        MEMBERS_PAGE_SIZE,
        pageParam,
        session?.accessToken as string,
      ),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? null,
    enabled: status === "authenticated" && !!session?.accessToken && !!streamId,
  });
};

export const useStreamJoinRequests = (streamId: string | undefined) => {
  const { data: session, status } = useSession();

  return useInfiniteQuery<
    PaginatedJoinRequestResponse,
    Error,
    PaginatedJoinRequestResponse,
    unknown[],
    string | null
  >({
    queryKey: ["stream-join-requests", streamId, session?.accessToken],
    queryFn: ({ pageParam }) =>
      streamApi.getJoinRequests(
        streamId!,
        MEMBERS_PAGE_SIZE,
        pageParam,
        session?.accessToken as string,
      ),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? null,
    enabled: status === "authenticated" && !!session?.accessToken && !!streamId,
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
