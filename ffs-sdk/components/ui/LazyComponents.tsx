/**
 * Lazy-loaded components for better performance
 *
 * These components are loaded on-demand to reduce initial bundle size
 * and improve application startup performance.
 */

import { lazy, Suspense } from "react";
import Spinner from "./Spinner";

// Lazy load heavy components
export const LazyDataTable = lazy(() => import("./DataTable"));
export const LazyForm = lazy(() => import("./Form"));
export const LazyNavigation = lazy(() => import("./Navigation"));
export const LazyThemeProvider = lazy(() => import("./ThemeProvider"));

// Lazy load blueprint components
export const LazyBillingDashboard = lazy(
  () => import("../billing/BillingDashboard")
);
export const LazyPOSDashboard = lazy(
  () => import("../blueprints/pos/POSDashboard")
);
export const LazyMessagingDashboard = lazy(
  () => import("../blueprints/messaging/MessagingDashboard")
);
export const LazyConsultingSite = lazy(() =>
  import("../blueprints/consulting-site/ConsultingSite").then((m) => ({
    default: m.ConsultingSite,
  }))
);
export const LazyInventoryManager = lazy(
  () => import("../blueprints/pos/InventoryManager")
);

// Loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center p-8">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Loading component...</span>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Convenience components with built-in lazy loading
export function LazyDataTableWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyDataTable {...props} />
    </LazyWrapper>
  );
}

export function LazyFormWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyForm {...props} />
    </LazyWrapper>
  );
}

export function LazyNavigationWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyNavigation {...props} />
    </LazyWrapper>
  );
}

export function LazyBillingDashboardWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyBillingDashboard {...props} />
    </LazyWrapper>
  );
}

export function LazyPOSDashboardWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyPOSDashboard {...props} />
    </LazyWrapper>
  );
}

export function LazyMessagingDashboardWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyMessagingDashboard {...props} />
    </LazyWrapper>
  );
}

export function LazyConsultingSiteWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyConsultingSite {...props} />
    </LazyWrapper>
  );
}

export function LazyInventoryManagerWithSuspense(props: any) {
  return (
    <LazyWrapper>
      <LazyInventoryManager {...props} />
    </LazyWrapper>
  );
}

export default {
  DataTable: LazyDataTableWithSuspense,
  Form: LazyFormWithSuspense,
  Navigation: LazyNavigationWithSuspense,
  BillingDashboard: LazyBillingDashboardWithSuspense,
  POSDashboard: LazyPOSDashboardWithSuspense,
  MessagingDashboard: LazyMessagingDashboardWithSuspense,
  ConsultingSite: LazyConsultingSiteWithSuspense,
  InventoryManager: LazyInventoryManagerWithSuspense,
};
