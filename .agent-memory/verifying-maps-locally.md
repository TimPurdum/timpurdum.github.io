# Verifying maps locally

Local runs can't show whether the site's ArcGIS maps work. The deployed ArcGIS API key (`ArcGISApiKey` in
`APP_SETTINGS`) is restricted to `timpurdum.dev`. Copied into a local `appsettings.json`, it is rejected on
`localhost`, so basemaps fail with `401 Token Invalid` and web maps, feature layers, and `RouteService` fail
with them. Compare against a baseline build of `main` run with the same settings, and treat production as
the real check. The GeoBlazor Pro key is different: its validator always accepts `localhost`.

On GeoBlazor 4.6.x those rejected basemaps also cause a misleading error:
`Cannot read properties of null (reading 'style') at setComponentTheme`, thrown from `MapView.SetTheme()`.
GeoBlazor blames every view's basemap error on the most recently built view and resets that view. The dead
view stays registered, so the next theme update throws. It only happens after a basemap fails, so it doesn't
occur in production. The fix exists only on GeoBlazor's `v5.0` branch, commit `98db04c26`.

After a deploy, the first page load can fail with `Failed to fetch dynamically imported module` for
`_content/dymaptic.GeoBlazor.Pro/js/geoBlazorPro.js` while the Pages CDN catches up. Reload before treating
it as a defect.

The Fleet sample's Esri traffic layer needs a traffic-authorized key, which the site doesn't have. Requesting
it opens a full-page ArcGIS sign-in dialog, so the embedded copy never offers it.

Evidence: PR #10, 2026-10-13. The localhost sweep compared the new and old packages, on ports 5287 and 5288,
across ten map pages. The production sweep with `?v=3` returned 0 console errors and no failed maps on all ten.

Verified: 2026-10-13
