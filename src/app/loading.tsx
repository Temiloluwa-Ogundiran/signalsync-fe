import { AppLoader } from "@/components/app-loader";

// Pre-auth app-boot loader: this renders before the dashboard chrome exists, so
// it legitimately covers the whole viewport.
export default function Loading() {
  return <AppLoader fullScreen />;
}
