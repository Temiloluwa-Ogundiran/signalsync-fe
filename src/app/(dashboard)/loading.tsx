import { AppLoader } from "@/components/app-loader";

// Default route-group fallback (App Router renders this during suspense on
// navigation). Any dashboard route without its own loading.tsx paints the
// branded loader instead of a blank screen.
export default function Loading() {
  return <AppLoader />;
}
