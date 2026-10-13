# Where the sessions data lives

Three files carry Tim's conference history, and they have three different owners.

`TimPurdum.Dev/wwwroot/files/sessions.geojson` is repo-owned. It holds one point feature per
conference and drives the map on `/sessions` through the `SessionizeMap` component. Adding an event
means adding a feature with `name`, `url`, `starting-date`, `ending-date`, `location`, `sessions`,
`session-titles`, and `marker-color`. Reuse the coordinates of the event's existing venue rather than
geocoding again. The `SessionizeMap` component reads `location` and `url`, and a few fields it names with
underscores where the file uses hyphens, so check a popup after editing.

`TimPurdum.Dev/wwwroot/js/sessionize-events.js` and `sessionize-sessions.js` are Sessionize-generated
snapshots of the profile at `https://sessionize.com/timpurdum/`. They are committed, so they drift
whenever the profile changes. Both were stale on 2026-10-13: the events list stopped at TechBash 2025 and
the sessions list held 9 of the profile's 19 sessions.

To refresh them, read the profile page and mirror its two sections rather than inventing entries, because
Sessionize owns both lists and its next export overwrites the files. The events list renders one
`<dt class="sz-group__title">MONTH YEAR</dt>` per month followed by a `<dd class="sz-item">` per event, with
the location span omitted for an event that has none. The sessions list is a `<ul>` of
`<li class="sz-item">` links to `https://sessionize.com/s/TimPurdum/<slug>/<id>`. Both live inside a
single-quoted JavaScript string, so apostrophes take a backslash escape and ampersands take `&amp;`.

An event on the site's map need not exist on the profile. Live! 360 Tech Con Orlando 2025 is in the
geojson and not on the Sessionize profile, so a re-export cannot add it to the events list.

Evidence: PR #9, 2026-10-13. The profile listed 7 events and 19 sessions against the files' 4 and 9.
