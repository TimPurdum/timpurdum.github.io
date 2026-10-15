# Durable memory


- [Static HTML in wwwroot](static-assets-in-wwwroot.md): keep decks out of wwwroot/post; link folder pages as index.html
- [Running the Compiler locally](running-the-compiler-locally.md): appsettings values, lastmodified churn, no pipe tables
- [Where the sessions data lives](sessions-data-sources.md): geojson is repo-owned, the two Sessionize embeds are drift-prone snapshots
- [Deployment config secret](deployment-config-secret.md): APP_SETTINGS is the whole appsettings.json; never paste it into script text
- [Verifying maps locally](verifying-maps-locally.md): ArcGIS key is referrer-locked; localhost maps fail, so check production
- [Syncing talk decks](syncing-talk-decks.md): source decks live in D:\PresentationDemos; strip data-speaker-notes, check for blob: URLs
- [Blazor startup freeze](blazor-startup-freeze.md): AddGeoBlazorPro stalls 20s+ in the interpreter; loader + AOT fix, timing method
