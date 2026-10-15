# Deployment config lives in a GitHub secret

`TimPurdum.Dev/wwwroot/appsettings.json` is gitignored (`.gitignore` line 7). CI writes it on every
deploy from the repository secret `APP_SETTINGS`, which holds the complete JSON document verbatim.
The workflow step `Copy AppSettings` passes the secret in through `env: APP_SETTINGS` and runs
`$env:APP_SETTINGS | Out-File -FilePath ./TimPurdum.Dev/wwwroot/appsettings.json -Encoding utf8`, which is
PowerShell 7, so `-Encoding utf8` means UTF-8 without a byte order mark.

Never paste the secret into script text. Until PR #11 the step read `$appSettings = "${{ secrets.APP_SETTINGS }}"`.
When the secret became multi-line, formatted JSON at 17:26 UTC on 2026-10-13, its first `"` ended that
string, and every deploy failed with a `ParserError` before building. That hit #8, #9, and #10. A deploy
failure at this step means the secret's text broke the script, not that the site's code is wrong.

`APP_SETTINGS` is repository-level rather than environment-level. The `github-pages` environment that
the deploy job names holds no secrets. The document has three top-level keys: `ArcGISApiKey`,
`GeoBlazor`, and `BlogSettings`.

Two consequences follow.

A value the Compiler reads from `BlogSettings` cannot be fixed in the repository. On 2026-10-13 the
home-page intro still came from `BlogSettings.SiteDescription`, and the dymaptic logo inside it pointed
at a retired dymaptic.com WordPress uploads path. The repo-side fix was to move the intro markup into
`TimPurdum.Dev.Source/Content/Pages/Index.razor` and reference the local
`TimPurdum.Dev/wwwroot/images/dymaptic-logo.svg`. The existing CSS rule `#intro img { width: 16px; }`
already sized it, so no stylesheet change was needed.

GitHub never returns a secret's value, so read what is actually deployed instead. A Blazor WebAssembly
app has to serve its configuration to the browser, which makes `https://www.timpurdum.dev/appsettings.json`
public. That file is the deployed secret, and comparing it against the local gitignored copy exposes
drift the local file hides. Config binding ignores key case, so `SiteName` and `siteName` both work; the
deployed copy used camelCase while the local copy uses PascalCase, and the deployed copy was missing
three of the five `HeaderLinks` entries.

Set the secret from a file with `gh secret set APP_SETTINGS -R TimPurdum/timpurdum.github.io < <file>`.

To prove an ArcGIS API key is dead, call the basemap styles service directly. A key that has been
revoked or has expired returns `498 Token Invalid`, where an absent key returns `499 Token Required`,
so a bare 401 does not distinguish the two.

Evidence: PR #8, 2026-10-13. The deployed logo URL answered `200` with `content-type: text/html` and
laid out at `122x29` against the GeoBlazor mark's `16x16`. The deployed key returned `498 Token Invalid`.
