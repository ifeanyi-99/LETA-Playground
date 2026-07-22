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
  /**
   * Trip identifier (short, e.g. "TRP-103") — present once the order has been
   * assigned to a trip. Absent on unassigned orders and on orders cancelled
   * before assignment (their Trip cell renders "--").
   */
  tripId?: string;
  /** ISO datetime string (e.g. "2026-06-29T07:30:00") — used for the live duration timer. */
  createdAt: string;
  priority: OrderPriority;
  /** Cancellation reason codes captured by the Cancel Order modal (OM §11.1). */
  cancelReasons?: string[];
  /** Optional free-text cancellation note (required when "Other" is a reason). */
  cancelNote?: string;
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

/** A pickup depot the client operates. */
export interface DepotOption {
  id: string;
  name: string;
  /** Street address, shown as the single-depot field's helper line. */
  address: string;
}

/** A product in the client's Products module catalogue (product-mode Items). */
export interface ProductOption {
  id: string;
  name: string;
  /** Unit price in KES — summed into the derived Items value in product mode. */
  price: number;
}

/**
 * Per-client configuration — the platform manifests differently per company based
 * on the modules it uses and the depots/roles a user has access to. Until the
 * Configuration spec + wireframes exist, this is a hand-authored profile per client
 * that config-driven UI (starting with the Add Order drawer) reads. Switching the
 * active client (breadcrumb chip) swaps this profile.
 */
export interface ClientConfig {
  /** Depots this user can pick from. 1 → locked field; 2+ → searchable select. */
  depots: DepotOption[];
  /** Items module. `manual` → free-text item name; `product` → select from `products`. */
  items: { enabled: boolean; mode: 'manual' | 'product'; valueRequired: boolean };
  /** Product catalogue (product-mode only). */
  products: ProductOption[];
  /** Payment module — the Add Order "Payment Info" section. */
  payment: { enabled: boolean };
  /**
   * Auto-broadcast (`scheduling.autoBroadcast.enabled`, OM §2.3): Scheduled
   * orders transition straight to Broadcasted at T−1h; non-scheduled orders sit
   * in Pending for {@link orderWaitMinutes} before auto-broadcasting (§7.2 row 2b).
   */
  autoBroadcast: boolean;
  /** Order wait time (`dispatch.orderWaitTime`, minutes) — how long a
   *  non-scheduled order stays Pending before auto-broadcast. */
  orderWaitMinutes: number;
  /** Pickup confirmation (`pickup.confirmation.enabled`): the Pickup Code card +
   *  Proof of Pickup elements in the Order Detail view (OM §7.3). */
  pickupConfirmation: boolean;
  /** Proof of delivery (`delivery.pod.*`): recipient signature / POD photo in the
   *  Delivered detail view (OM §7.3). */
  proofOfDelivery: boolean;
}

/**
 * A client tenant. The playground represents the LETA SaaS product *for* a given
 * client (e.g. Acme Studios). The Top Bar's breadcrumb client chip switches between
 * client instances, swapping the active {@link ClientConfig}.
 */
export interface Client {
  id: string;
  name: string;
  config: ClientConfig;
}

/** A transient toast surfaced bottom-right by the AppShell. */
export interface ToastItem {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  subtitle?: string;
  /** Optional trailing CTA (e.g. the "Order created" toast's "View Order"). */
  cta?: { label: string; onClick: () => void };
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

/**
 * Leading icon rendered *inside* the delivery badge for a status. Per the DS
 * Delivery Badges (`Atoms/Badge/Delivery Badges`, Figma `68:36703`) only the
 * **Returning** order-status badge carries one (`Return`); every other status
 * badge is plain. Used by the table Status cell + the View Order drawer header.
 */
export const ORDER_STATUS_BADGE_ICON: Partial<Record<OrderStatus, IconName>> = {
  returning: 'Return',
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
