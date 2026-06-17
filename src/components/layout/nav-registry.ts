import type { IconSvgElement } from "@hugeicons/react";
import {
  PencilEdit02Icon,
  Notebook01Icon,
  Book02Icon,
  AnalyticsUpIcon,
  Analytics01Icon,
  Wallet01Icon,
  AiMagicIcon,
  FlaskConicalIcon,
  Bookmark02Icon,
  Settings01Icon,
  Rocket01Icon,
  ChartLineData01Icon,
  Clock01Icon,
  Home04Icon,
  PlusSignIcon,
  UserIcon,
  SecurityCheckIcon,
  CreditCardIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import type { FeatureFlag } from "@/config/feature-flags";

/**
 * Two-tier navigation, defined as data.
 *
 * Tier 1 (icon rail) renders one entry per {@link NavApp}.
 * Tier 2 (contextual sidebar) renders the active app's {@link NavGroup}s.
 *
 * Adding a future app/page is a registry change — no component edits.
 */

export interface NavItem {
  icon: IconSvgElement;
  label: string;
  /** Target route. Items whose route does not exist yet should set `comingSoon`. */
  route: string;
  /** Right-aligned quiet metadata badge (open positions, unread insights, …). */
  count?: number;
  /** Renders muted + "Soon", does not navigate (route not built yet). */
  comingSoon?: boolean;
}

export interface NavGroupAction {
  icon: IconSvgElement;
  label: string;
  onClick: () => void;
}

export interface NavGroup {
  /** Optional uppercase section label, e.g. "STRATEGIES". */
  header?: string;
  /** Optional icon shown before the section label. */
  headerIcon?: IconSvgElement;
  /** Optional inline "+" action rendered on the right of the header. */
  action?: NavGroupAction;
  /** When true the group can expand/collapse (state persisted per group). */
  collapsible?: boolean;
  items: NavItem[];
}

export interface NavApp {
  id: string;
  name: string;
  icon: IconSvgElement;
  /** Route the rail icon points at (usually the app's first page). */
  route: string;
  /** Partna AI gets the violet sparkle treatment even at rest. */
  isAI?: boolean;
  /** Hidden entirely when the flag is off. */
  flag?: FeatureFlag;
  /**
   * A context you enter and exit (e.g. Settings) rather than switch between like
   * the main apps. Its tier-2 header is a back button + title, not the switcher.
   */
  standalone?: boolean;
  groups: NavGroup[];
}

/**
 * The single source of truth for navigation. `actionFns` lets the registry stay
 * pure data while still wiring real handlers (modals, etc.) supplied by the shell.
 */
export function buildNavRegistry(actionFns: {
  onNewBacktest?: () => void;
}): NavApp[] {
  return [
    {
      id: "partna-ai",
      name: "Partna AI",
      icon: AiMagicIcon,
      route: "/ai",
      isAI: true,
      flag: "AI" as FeatureFlag,
      groups: [
        {
          items: [{ icon: AiMagicIcon, label: "Assistant", route: "/ai" }],
        },
      ],
    },
    {
      id: "performance",
      name: "Journal",
      icon: PencilEdit02Icon,
      route: "/dashboard",
      groups: [
        {
          items: [
            {
              icon: Home04Icon,
              label: "Dashboard",
              route: "/dashboard",
            },
            {
              icon: Book02Icon,
              label: "Day Journal",
              route: "/journal",
            },
            {
              icon: Analytics01Icon,
              label: "Trades",
              route: "/trade-history",
            },
            {
              icon: Notebook01Icon,
              label: "Notebook",
              route: "/diary",
            },
            {
              icon: AnalyticsUpIcon,
              label: "Reports",
              route: "/reports",
              comingSoon: true,
            },
          ],
        },
      ],
    },
    {
      id: "backtesting",
      name: "Backtesting",
      icon: FlaskConicalIcon,
      route: "/backtesting",
      groups: [
        {
          header: "STRATEGIES",
          collapsible: true,
          action: actionFns.onNewBacktest
            ? {
                icon: PlusSignIcon,
                label: "New strategy",
                onClick: actionFns.onNewBacktest,
              }
            : undefined,
          items: [
            {
              icon: Bookmark02Icon,
              label: "My Strategies",
              route: "/backtesting/strategies",
              comingSoon: true,
            },
            {
              icon: Rocket01Icon,
              label: "New Backtest",
              route: "/backtesting/new",
              comingSoon: true,
            },
          ],
        },
        {
          header: "RESULTS",
          collapsible: true,
          items: [
            {
              icon: ChartLineData01Icon,
              label: "Results",
              route: "/backtesting/results",
              comingSoon: true,
            },
            {
              icon: Clock01Icon,
              label: "History",
              route: "/backtesting/history",
              comingSoon: true,
            },
          ],
        },
      ],
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings01Icon,
      // Rail icon lands on the first real page (Accounts) until /settings exists.
      route: "/accounts",
      standalone: true,
      groups: [
        {
          items: [
            {
              icon: UserIcon,
              label: "Profile",
              route: "/settings/profile",
            },
            {
              icon: SecurityCheckIcon,
              label: "Security",
              route: "/settings/security",
            },
            { icon: Wallet01Icon, label: "Accounts", route: "/accounts" },
            {
              icon: Tag01Icon,
              label: "Custom Tags",
              route: "/settings/tags",
            },
            {
              icon: CreditCardIcon,
              label: "Subscription",
              route: "/settings/subscription",
              comingSoon: true,
            },
          ],
        },
      ],
    },
  ];
}

function routeMatches(route: string, pathname: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * Resolve the active app for a pathname. An app owns a pathname if the app's own
 * route matches OR any of its (real, non-comingSoon) item routes match. The
 * longest matching route wins, so the most specific app is chosen regardless of
 * registry order. Falls back to the first app.
 */
export function findActiveApp(apps: NavApp[], pathname: string): NavApp {
  let best: NavApp | undefined;
  let bestLen = -1;

  for (const app of apps) {
    const candidateRoutes = [
      app.route,
      ...app.groups.flatMap((g) =>
        g.items.filter((it) => !it.comingSoon).map((it) => it.route),
      ),
    ];
    for (const route of candidateRoutes) {
      if (routeMatches(route, pathname) && route.length > bestLen) {
        best = app;
        bestLen = route.length;
      }
    }
  }

  return best ?? apps[0];
}

/** True when `pathname` is on (or under) this item's route. */
export function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.comingSoon) return false;
  return pathname === item.route || pathname.startsWith(`${item.route}/`);
}
