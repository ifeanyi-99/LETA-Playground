import type { AvatarTone, BadgeColor } from '@leta/components';
import type { IconName } from '@leta/icons';

/**
 * Order lifecycle (per user, 2026-06-25). Happy path:
 *   scheduled → pending → broadcasted → assigned → at-store → in-transit → arrived → delivered
 * `scheduled` is optional (not every order is scheduled). Off-path: cancelled / returning / returned.
 *
 * Transition rules are intentionally NOT enforced yet — they come from the PRD/Jira in Phase 1.
 */
export type OrderStatus =
  | 'scheduled'
  | 'pending'
  | 'broadcasted'
  | 'assigned'
  | 'at-depot'
  | 'in-transit'
  | 'arrived'
  | 'delivered'
  | 'cancelled'
  | 'returning'
  | 'returned';

export type DriverStatus = 'available' | 'busy' | 'offline';

export type VehicleType = 'bike' | 'car' | 'van';

export type OrderPriority = 'standard' | 'express';

/** A geocoded location used for map markers + display. */
export interface GeoPoint {
  label: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  /** Pickup depot / warehouse name (e.g. "Arc Kitisuru Depot"). Displayed as the route origin header. */
  depot?: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  /** Free-text package / item description. */
  package: string;
  /** Item count. */
  items: number;
  status: OrderStatus;
  /** Assigned driver, or null while unassigned. */
  driverId: string | null;
  /** Broadcast batch identifier — present only on broadcasted orders (surfaced in the Broadcasted view's Batch ID column). */
  batchId?: string;
  /** ISO datetime string (e.g. "2026-06-29T07:30:00") — used for the live duration timer. */
  createdAt: string;
  priority: OrderPriority;
}

export interface Driver {
  id: string;
  name: string;
  tone: AvatarTone;
  vehicle: VehicleType;
  phone: string;
  status: DriverStatus;
  location: GeoPoint;
  /** The order this driver is currently fulfilling, or null. */
  currentOrderId: string | null;
}

/**
 * A client tenant. The playground represents the LETA SaaS product *for* a given
 * client (e.g. Acme Studios). The Top Bar's breadcrumb client chip is the
 * (future) switcher between client instances — see [[client-instance-switching]].
 */
export interface Client {
  id: string;
  name: string;
}

/** A transient toast surfaced bottom-right by the AppShell. */
export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  subtitle?: string;
}

/**
 * Order status → Badge colour, matching the design-system **Delivery Badges**
 * (`Badge.Delivery.stories.tsx`) so the table and the status-filter badge use the
 * exact same delivery badge per status.
 */
export const ORDER_STATUS_BADGE: Record<OrderStatus, BadgeColor> = {
  scheduled: 'primary', // Coral Red
  pending: 'caution',
  broadcasted: 'secondary',
  assigned: 'highlight',
  'at-depot': 'notice',
  'in-transit': 'highlight',
  arrived: 'notice',
  delivered: 'success',
  cancelled: 'error',
  returning: 'highlight',
  returned: 'warning',
};

/**
 * Order status → leading icon for the status-filter dropdown options. Base names
 * match the exact `Leading Icon` instance-swap each Figma dropdown row uses
 * (`DesktopMenuOptions` renders them outlined). Bridge-verified from
 * `606:138936` / `608:74407` / `852:166443`.
 */
export const ORDER_STATUS_ICON: Record<OrderStatus, IconName> = {
  scheduled: 'Calendar',
  pending: 'Clock',
  broadcasted: 'Broadcast',
  assigned: 'User-Available',
  'at-depot': 'Depot',
  'in-transit': 'Moving-Vehicle',
  arrived: 'Front-Door',
  delivered: 'Check-Circle',
  cancelled: 'Cancel',
  returning: 'Return',
  returned: 'Inventory',
};

/** Human-readable status label. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  scheduled: 'Scheduled',
  pending: 'Pending',
  broadcasted: 'Broadcasted',
  assigned: 'Assigned',
  'at-depot': 'At Depot',
  'in-transit': 'In Transit',
  arrived: 'Arrived',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returning: 'Returning',
  returned: 'Returned',
};

/** Driver status → semantic Badge colour. */
export const DRIVER_STATUS_BADGE: Record<DriverStatus, BadgeColor> = {
  available: 'success',
  busy: 'warning',
  offline: 'neutral',
};

export const DRIVER_STATUS_LABEL: Record<DriverStatus, string> = {
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
};
