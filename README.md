# timpurdum.github.io

Personal website and blog, deployed at [https://www.timpurdum.dev](https://www.timpurdum.dev).

A Blazor WebAssembly site with a hybrid SSG model: pages are pre-rendered to static HTML at build time by a custom static-site generator (**BlogGenerator**), then the WASM runtime hydrates any interactive components.

<a href="https://dotnet.social/@TimPurdum" rel="me">@TimPurdum@dotnet.social</a>

## Prerequisites

- **.NET 10 SDK**
- **Clone with submodules.** BlogGenerator (and its custom Markdig fork) are git submodules:
  ```bash
  git clone --recurse-submodules https://github.com/TimPurdum/timpurdum.github.io.git
  # or, after a plain clone:
  git submodule update --init --recursive
  ```
- **`TimPurdum.Dev/wwwroot/appsettings.json`** must exist (it is gitignored). The Compiler reads its `BlogSettings` section and will throw on missing required paths. CI injects it from the `APP_SETTINGS` secret.

## Running the BlogGenerator

The generator lives in `BlogGenerator/TimPurdum.Dev.BlogGenerator.Compiler` — a console app that finds the Blazor WASM host project, loads the compiled **content** assembly (`TimPurdum.Dev.Source.dll`) reflectively, renders the markdown posts and Razor templates to static HTML in `TimPurdum.Dev/wwwroot/`, generates Razor components for any embedded `blazor-component` blocks, and writes `feed.xml` / sitemap.

Because the Compiler loads `TimPurdum.Dev.Source.dll` from disk, **build the Source project first in the same configuration you run the Compiler in.** From the repo root:

```bash
# 1. Build the content project (do this first — the Compiler reflects over its DLL)
dotnet build TimPurdum.Dev.Source -c Release

# 2. Run the generator to (re)generate the static site
cd BlogGenerator/TimPurdum.Dev.BlogGenerator.Compiler && dotnet run -c Release
```

Use this two-step loop after editing markdown posts or templates — it regenerates the HTML without a full WASM rebuild. Generated output (`wwwroot/post/YYYY/MM/`, `wwwroot/*.html`) is checked in, since the deployed site serves the static HTML directly.

> If you hit a "could not load Source assembly" error, it's almost always a config mismatch — build `TimPurdum.Dev.Source` in the **same** `-c` configuration the Compiler is running in (Debug vs Release).

## Other common commands

```bash
# Full build — MSBuild targets chain Source -> Compiler -> WASM automatically
dotnet build TimPurdum.Dev.sln

# Local dev server (after at least one full build so generated files exist)
cd TimPurdum.Dev && dotnet run

# Production publish (matches CI: TimPurdum.Dev/bin/Release/net10.0/publish/wwwroot)
cd TimPurdum.Dev && dotnet publish -c Release

# AOT publish + local Docker test (nginx serves at http://localhost:8080)
docker compose up --build
```

## Authoring a new post

Add `TimPurdum.Dev.Source/Content/Posts/YYYY-MM-DD-slug.md` with YAML front matter (`layout: post`, `title`, optional `subTitle`, `lastmodified`), then re-run the BlogGenerator (above). The filename date drives sort order; `lastmodified` controls regeneration.

## Deployment

`.github/workflows/static.yml` builds on push to `main` and deploys `TimPurdum.Dev/bin/Release/net10.0/publish/wwwroot` to GitHub Pages.

---

See [CLAUDE.md](./CLAUDE.md) for the full architecture, the build-ordering rationale, embedded-component mechanics, and configuration details.
