import { useQuery } from "@tanstack/react-query";
import { streamApi, Stream, StreamDiscoverItem } from "../api/stream.api";
import { useSession } from "next-auth/react";

export const useMyStreams = () => {
  const { data: session, status } = useSession();

  return useQuery<Stream[]>({
    queryKey: ["my-streams", session?.accessToken],
    queryFn: () => streamApi.getMyStreams(session?.accessToken as string),
    enabled: status === "authenticated",
  });
};

export const useDiscoverStreams = () => {
  const { data: session, status } = useSession();

  return useQuery<StreamDiscoverItem[]>({
    queryKey: ["discover-streams"],
    queryFn: () => streamApi.discoverStreams(session?.accessToken as string),
    enabled: status === "authenticated",
  });
};
