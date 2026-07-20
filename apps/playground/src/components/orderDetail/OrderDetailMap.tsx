import * as React from 'react';
import type { Map as LeafletMap, Polyline } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, MapView, NotificationBanner } from '@leta/components';
import { Icon } from '@leta/icons';
import { MarkerLayer, type MapMarkerSpec } from '../../shell/mapMarkers.js';
import type { Order, OrderStatus } from '../../store/types.js';
import { idHash } from '../../lib/orderMeta.js';

/**
 * The View Order drawer's map — "the route's biography" (OM §7.2 map matrix).
 *
 * - **Mini map** (drawer overview card, 368×168): non-interactive `MapView`
 *   (drag/zoom disabled, no zoom control) with state-driven pins/route + an
 *   expand button top-right.
 * - **Expanded map** (fullscreen dimmed overlay, 768×768): interactive MapView
 *   with the zoom control, depot + drop-off info cards affixed to their pins,
 *   and a floating banner — the dispatch nudge for undispatched orders, or the
 *   driver-progress line once a driver holds the order.
 *
 * Route rendering per state: pre-dispatch = pins only; Assigned→Arrived =
 * planned route + live driver marker; Returning = route + driver + failed
 * drop-off; Delivered = planned + actual path (grey); Returned = planned +
 * trail to the failure point; Cancelled = route only if dispatched (§11.1).
 */

const DISPATCHED: OrderStatus[] = ['assigned', 'at-depot', 'in-transit', 'arrived', 'returning'];

function cssColor(varName: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

/** Deterministic gentle bend so mock routes read as roads, not rulers. */
function routePoints(o: Order): [number, number][] {
  const a = o.pickup;
  const b = o.dropoff;
  const h = idHash(o.id);
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  // two interpolated bend points, offset perpendicular to the segment
  const off = ((h % 7) - 3) * 0.0022;
  return [
    [a.lat, a.lng],
    [a.lat + dy * 0.35 + off * (dx > 0 ? 1 : -1) * 0.6, a.lng + dx * 0.3 - off],
    [a.lat + dy * 0.7 - off * 0.5, a.lng + dx * 0.72 + off * 0.8],
    [b.lat, b.lng],
  ];
}

/** The actual driven path (Delivered) — the planned route, nudged. */
function actualPoints(o: Order): [number, number][] {
  return routePoints(o).map(([lat, lng], i) =>
    i === 0 || i === 3 ? [lat, lng] : [lat + 0.0016, lng - 0.0014],
  );
}

interface RouteState {
  planned: boolean;
  actual: boolean;
  /** Fraction of the planned route the trail covers (Returned = to the failure point). */
  trailTo?: number;
  driver: boolean;
  failedDropoff: boolean;
}

function routeStateFor(o: Order): RouteState {
  const s = o.status;
  if (DISPATCHED.includes(s)) {
    return { planned: true, actual: false, driver: true, failedDropoff: s === 'returning' };
  }
  if (s === 'delivered') return { planned: true, actual: true, driver: false, failedDropoff: false };
  if (s === 'returned') return { planned: true, actual: false, trailTo: 0.7, driver: false, failedDropoff: true };
  if (s === 'cancelled') {
    return { planned: !!o.tripId, actual: false, driver: false, failedDropoff: false };
  }
  return { planned: false, actual: false, driver: false, failedDropoff: false };
}

/** Driver's mock position along the route, per status. */
function driverFraction(status: OrderStatus): number {
  switch (status) {
    case 'assigned': return 0.12;
    case 'at-depot': return 0.02;
    case 'in-transit': return 0.55;
    case 'arrived': return 0.97;
    case 'returning': return 0.6;
    default: return 0;
  }
}

function pointAt(points: [number, number][], t: number): [number, number] {
  const idx = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
  const local = t * (points.length - 1) - idx;
  const [aLat, aLng] = points[idx]!;
  const [bLat, bLng] = points[idx + 1]!;
  return [aLat + (bLat - aLat) * local, aLng + (bLng - aLng) * local];
}

/** Build the pin + driver marker specs for a given order state. */
function markerSpecs(o: Order, expanded: boolean): MapMarkerSpec[] {
  const rs = routeStateFor(o);
  const specs: MapMarkerSpec[] = [
    {
      id: 'depot',
      lat: o.pickup.lat,
      lng: o.pickup.lng,
      icon: { variant: 'badge', icon: 'Depot', color: 'var(--surface-primary-bg)' },
    },
    {
      id: 'dropoff',
      lat: o.dropoff.lat,
      lng: o.dropoff.lng,
      icon: rs.failedDropoff
        ? { variant: 'object-pin', icon: 'Cancel', color: 'var(--surface-error-bg)' }
        : { variant: 'object-pin', icon: 'Location', color: 'var(--surface-secondary-bg)' },
    },
  ];
  if (rs.driver) {
    const [lat, lng] = pointAt(routePoints(o), driverFraction(o.status));
    specs.push({
      id: 'driver',
      lat,
      lng,
      icon: { variant: 'bike-delivery' },
      zIndexOffset: 500,
    });
  }
  void expanded;
  return specs;
}

/** White floating info card affixed beside a pin (expanded mode). */
function infoCardHtml(icon: string, name: string, address: string): string {
  return renderToStaticMarkup(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px 10px 10px',
        background: 'var(--surface-neutral-bg-default)',
        border: 'var(--stroke-xs) solid var(--border-neutral-default)',
        borderRadius: 'var(--rounding-lg)',
        boxShadow: 'var(--shadow-neutral-2)',
        width: 250,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--rounding-lg)',
          background: 'var(--surface-neutral-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--icons-neutral-default)',
        }}
      >
        <Icon name={icon as never} outlined size={20} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span className="text-label-m-semibold" style={{ color: 'var(--text-default-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
        <span className="text-label-s-regular" style={{ color: 'var(--text-default-sub-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {address}
        </span>
      </div>
    </div>,
  );
}

/** Attach pins/route/driver to a Leaflet map; returns a cleanup. */
function decorate(map: LeafletMap, order: Order, expanded: boolean, depotName: string, depotAddress: string): () => void {
  const rs = routeStateFor(order);
  const layer = new MarkerLayer(map);
  layer.sync(markerSpecs(order, expanded));

  const lines: Polyline[] = [];
  // Leaflet needs concrete colors — resolve the tokens at runtime.
  const red = cssColor('--icons-primary-default', '#ff3941');
  const grey = cssColor('--icons-neutral-idle', '#8f8f8f');
  void import('leaflet').then((L) => {
    if (rs.planned) {
      const pts = routePoints(order);
      const planned = rs.trailTo != null ? [...pts.slice(0, 3), pointAt(pts, rs.trailTo)] : pts;
      lines.push(L.polyline(rs.trailTo != null ? pts : planned, { color: red, weight: 3, opacity: rs.actual ? 0.9 : 1 }).addTo(map));
      if (rs.trailTo != null) {
        // Returned: the driver's trail up to the failure point, over the planned line.
        lines.push(L.polyline(planned, { color: grey, weight: 3, dashArray: '6 6' }).addTo(map));
      }
    }
    if (rs.actual) {
      lines.push(L.polyline(actualPoints(order), { color: grey, weight: 3, dashArray: '6 6' }).addTo(map));
    }
  });

  // Expanded mode: info cards affixed to the depot + drop-off.
  const infoMarkers: ReturnType<LeafletMap['addLayer']>[] = [];
  if (expanded) {
    void import('leaflet').then((L) => {
      const depotCard = L.marker([order.pickup.lat, order.pickup.lng], {
        icon: L.divIcon({ html: infoCardHtml('Depot', depotName, depotAddress), className: 'leta-map-infocard', iconSize: [250, 56], iconAnchor: [270, 28] }),
        interactive: false,
        zIndexOffset: 400,
      }).addTo(map);
      const dropCard = L.marker([order.dropoff.lat, order.dropoff.lng], {
        icon: L.divIcon({ html: infoCardHtml('Location', order.customer, order.dropoff.label), className: 'leta-map-infocard', iconSize: [250, 56], iconAnchor: [-20, 28] }),
        interactive: false,
        zIndexOffset: 400,
      }).addTo(map);
      infoMarkers.push(depotCard as never, dropCard as never);
    });
  }

  // Frame both pins.
  void import('leaflet').then((L) => {
    const bounds = L.latLngBounds([
      [order.pickup.lat, order.pickup.lng],
      [order.dropoff.lat, order.dropoff.lng],
    ]);
    if (expanded) {
      // Asymmetric padding: the info cards hang ~270px left of their pins.
      map.fitBounds(bounds, { paddingTopLeft: [300, 110], paddingBottomRight: [120, 140] });
    } else {
      map.fitBounds(bounds, { padding: [28, 28] });
    }
  });

  return () => {
    layer.clear();
    lines.forEach((l) => l.remove());
    infoMarkers.forEach((m) => (m as never as { remove: () => void }).remove());
  };
}

// ── Mini map (overview card, left half) ─────────────────────────────────────────

export function OrderMiniMap({
  order,
  depotName,
  depotAddress,
  onExpand,
}: {
  order: Order;
  depotName: string;
  depotAddress: string;
  onExpand: () => void;
}): React.ReactElement {
  const cleanupRef = React.useRef<(() => void) | null>(null);
  const handleReady = React.useCallback(
    (map: LeafletMap) => {
      // Static thumbnail behaviour — the expand affordance is the interaction.
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      const tap = (map as unknown as { tap?: { disable(): void } }).tap;
      if (tap) tap.disable();
      cleanupRef.current = decorate(map, order, false, depotName, depotAddress);
    },
    [order, depotName, depotAddress],
  );
  React.useEffect(() => () => cleanupRef.current?.(), []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapView onReady={handleReady} showZoomControl={false} style={{ width: '100%', height: '100%' }} />
      {/* Expand control — top-right (§7.2 expanded map mode, every status). */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 800 }}>
        <Button variant="secondary" size="small" iconOnly="Expand" aria-label="Expand map" onClick={onExpand} />
      </div>
    </div>
  );
}

// ── Expanded map overlay (fullscreen dimmed, 768×768 panel) ─────────────────────

export function ExpandedMapOverlay({
  order,
  depotName,
  depotAddress,
  banner,
  onClose,
}: {
  order: Order;
  depotName: string;
  depotAddress: string;
  /** The floating banner: dispatch nudge (undispatched) or driver progress. */
  banner: { text: string; ctaLabel: string; onCta: () => void };
  onClose: () => void;
}): React.ReactElement {
  const cleanupRef = React.useRef<(() => void) | null>(null);
  const handleReady = React.useCallback(
    (map: LeafletMap) => {
      // The overlay mounts mid-transition — Leaflet can measure the container
      // early, leaving blank tiles + a mis-framed viewport. Re-measure once
      // painted and once post-transition, THEN decorate (whose fitBounds must
      // run against the final size, or a pin lands out of frame).
      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => {
        map.invalidateSize();
        cleanupRef.current = decorate(map, order, true, depotName, depotAddress);
      }, 420);
    },
    [order, depotName, depotAddress],
  );
  React.useEffect(() => () => cleanupRef.current?.(), []);

  // Escape closes the overlay (it renders above the drawer).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <>
      <div aria-hidden onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,16,16,0.4)', zIndex: 1700 }} />
      <div
        role="dialog"
        aria-label="Expanded order map"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 768,
          height: 768,
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100dvh - 48px)',
          borderRadius: 'var(--rounding-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-neutral-3)',
          backgroundColor: 'var(--surface-neutral-bg-default)',
          zIndex: 1701,
        }}
      >
        <MapView onReady={handleReady} style={{ width: '100%', height: '100%' }} />
        {/* Collapse — mirrors the mini map's expand control. */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 800 }}>
          <Button variant="secondary" size="small" iconOnly="Collapse" aria-label="Collapse map" onClick={onClose} />
        </div>
        {/* Floating banner (bottom-center): dispatch nudge / driver progress. */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 800,
            width: 'min(600px, calc(100% - 120px))',
            background: 'var(--surface-neutral-bg-default)',
            borderRadius: 'var(--rounding-lg)',
            boxShadow: 'var(--shadow-neutral-2)',
          }}
        >
          <NotificationBanner
            type="info"
            variant="subtle"
            description={banner.text}
            icon="Moving-Vehicle"
            cta={
              <Button variant="secondary" size="small" onClick={banner.onCta}>
                {banner.ctaLabel}
              </Button>
            }
            style={{ padding: 'var(--padding-8px) var(--padding-12px)' }}
          />
        </div>
      </div>
    </>
  );
}
