# Static HTML assets in wwwroot

Hand-placed HTML (slide decks, standalone pages) must live outside `TimPurdum.Dev/wwwroot/post/`. The Compiler's `OutputSweeper` deletes every `.html` file under `post/` that no post claims. `wwwroot/slides/<event>/` is the established home for decks.

Link a folder's page as `.../index.html`, not `.../`. GitHub Pages maps a folder URL to its `index.html`, but the local `dotnet run` dev server returns the 19 KB SPA shell instead, which hides broken links during local checks.

Evidence: `BlogGenerator/TimPurdum.Dev.BlogGenerator.Compiler/OutputSweeper.cs` sweeps `Path.Combine(OutputWebRootPath, "post")`. In PR #6, `fetch('/slides/techbash-2026/spatial-data-in-dotnet/')` returned 19,756 bytes of `index.html`, while the explicit `index.html` path returned the 9.5 MB deck.

Verified: 2026-10-13
