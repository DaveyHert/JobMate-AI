// ============================================================================
// PortalApp — the full web-portal shell (layout + hash router)
// ============================================================================
// Shared between the extension build entry (src/dashboard.tsx) and the dev
// SPA (src/App.tsx) so both see the same sidebar and routing. Sub-pages
// like Settings parse their own sub-paths out of the hash.
// ============================================================================

import { useEffect, useState } from "react";
import Dashboard from "./pages/home/Home";
import { PortalLayout, PortalRoute } from "./components/PortalLayout";
import SettingsPage from "./pages/settings/Settings";
import { ApplicationsPage } from "./pages/applications/Applications";

function parseRoute(): PortalRoute {
  const hash = window.location.hash.toLowerCase();
  if (hash.startsWith("#/settings")) return "settings";
  if (hash.startsWith("#/applications")) return "applications";
  if (hash.startsWith("#/analytics")) return "analytics";
  return "dashboard";
}

export default function PortalApp() {
  const [route, setRoute] = useState<PortalRoute>(parseRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <PortalLayout currentRoute={route}>
      {route === "settings" ? (
        <SettingsPage />
      ) : route === "applications" ? (
        <ApplicationsPage />
      ) : (
        <Dashboard />
      )}
    </PortalLayout>
  );
}
