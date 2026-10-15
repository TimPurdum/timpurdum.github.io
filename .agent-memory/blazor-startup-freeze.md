# Blazor startup freeze

Blazor WebAssembly runs .NET on the browser's main thread, so slow startup code freezes the whole page.
On this site, GeoBlazor Pro 4.6.1's `AddGeoBlazorPro` took 20 to 32 seconds in the interpreter. Config
binding, `AddHttpClient`, and Pro's module constructor took under 40 ms, so the time sits in Pro's
obfuscated license setup. Don't decompile that part; the auto-mode classifier blocks it as credential
exploration. Runtime boot and the rest of `Program.cs` took about 0.4 seconds.

The site has two mitigations. `js/blazor-loader.js` starts Blazor only after a click, and only on pages
with a `.component-block`. CI publishes with AOT, which cut the startup freeze to under 1 second. A
freeze of about 3 seconds remains while the first map renders. It happens with and without AOT.

To time startup phases, add `Console.WriteLine` with a `Stopwatch` to `Program.cs`. Read the lines
through a `performance.now()` console hook in a devtools `initScript`. In Git Bash, pass `-p:RunAOT=true`;
Git Bash rewrites `/p:RunAOT=true` as a file path. A template change only reaches existing posts when
their HTML is older than the markdown. Backdate `wwwroot/post/**/*.html` with `touch -d 2000-01-01`, run
the Compiler, then revert the markdown front-matter churn.

Evidence: 2026-10-15. A production trace showed one 25.9-second task, and a text-only post froze for 17
seconds. Instrumented local Release publishes logged `T addHttpClient 270` and then
`T AddGeoBlazorPro 25535`. With the loader on an AOT build, the gaps after the click were all under 0.7
seconds before the map began rendering.

Verified: 2026-10-15
