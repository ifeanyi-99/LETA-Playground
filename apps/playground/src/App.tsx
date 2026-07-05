import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './shell/AppShell.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { MapPage } from './pages/MapPage.js';
import { ComingSoonPage } from './pages/ComingSoonPage.js';

/**
 * Playground routes. The four functional flow routes (`/orders`, `/orders/new`,
 * `/orders/:id`, `/map`) currently render Phase-0 placeholders (MapPage is real);
 * each is replaced by its wireframe-driven screen in Phase 1. Decorative nav
 * destinations render a "coming soon" empty state.
 */
export function App(): React.ReactElement {
  return (
    <Routes>
      {/* Redirect the index OUTSIDE the layout so the shell (and SideBar) first
          mounts at /orders with the correct active item — no remount needed. */}
      <Route path="/" element={<Navigate to="/orders" replace />} />
      <Route element={<AppShell />}>
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/new" element={<ComingSoonPage />} />
        <Route path="/orders/:id" element={<ComingSoonPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/dashboard" element={<ComingSoonPage />} />
        <Route path="/fleet" element={<ComingSoonPage />} />
        <Route path="/team" element={<ComingSoonPage />} />
        <Route path="/depots" element={<ComingSoonPage />} />
        <Route path="/settings" element={<ComingSoonPage />} />
        <Route path="/integrations" element={<ComingSoonPage />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Route>
    </Routes>
  );
}
