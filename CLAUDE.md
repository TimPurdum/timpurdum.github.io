# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`timpurdum.github.io` (deployed at https://www.timpurdum.dev) is a Blazor WebAssembly personal site / blog. Pages are pre-rendered to static HTML at build time; the WASM runtime then "hydrates" the page by attaching interactive Blazor components into placeholder `<div id="...">` elements. This is a hybrid SSG + interactive WASM model — not a normal Blazor WASM app.

Target framework: **.NET 10** (Blazor WASM with optional AOT). C# `latest`, nullable enabled.

## Submodules — clone recursively

The repo depends on two git submodules that must be checked out before anything builds:

```
BlogGenerator/  (https://github.com/TimPurdum/BlogGenerator.git)
BlogGenerator/markdig/  (custom Markdig fork)
```

Always clone with `--recurse-submodules`, or run `git submodule update --init --recursive` after a fresh clone. CI does this via `actions/checkout@v4` with `submodules: recursive`.

## Solution layout & build chain

The solution has three groups of projects, and the build chain between them is non-obvious:

1. **`TimPurdum.Dev.Source`** — Razor class library containing the *content*: markdown posts (`Content/Posts/YYYY-MM-DD-*.md`), pages (`Content/Pages/*.razor`), and the site's custom Razor templates (`Templates/`, inheriting from `BasePageLayout` / `BasePostLayout` / `BaseRootTemplate`). Built first; its compiled DLL is loaded reflectively by the Compiler.

2. **`BlogGenerator/`** (submodule) — the static site generator:
   - `TimPurdum.Dev.BlogGenerator.Compiler` — console app. Reads markdown via `MarkupParser`, loads the Source DLL, renders templates with `Microsoft.AspNetCore.Components.Web.HtmlRenderer`, writes `.html` files into `TimPurdum.Dev/wwwroot/`, generates Razor components for embedded `blazor-component` code blocks into `TimPurdum.Dev/Components/`, and writes `feed.xml`.
   - `TimPurdum.Dev.BlogGenerator` — the package consumed by the WASM project. Its `TimPurdum.Dev.BlogGenerator.targets` file runs the Compiler `BeforeTargets="Build"`. Also exposes `WebAssemblyHostBuilder.AddGeneratedBlogContent()` (in `DependencyExtension.cs`), which at runtime inspects the loaded HTML and registers root components for every interactive component whose `id` matches `PascalToKebabCase(typeName)`.
   - `TimPurdum.Dev.BlogGenerator.Shared` — `BlogSettings`, `LinkData`, abstract template base classes, default templates.

3. **`TimPurdum.Dev`** — the Blazor WASM project that ships. References `BlogGenerator` (which transitively triggers the generator), references `Source`, and depends on `dymaptic.GeoBlazor.Pro`. `Program.cs` calls `await builder.AddGeneratedBlogContent()` to wire up interactive components in the pre-rendered HTML.

### Implication for ordering

`TimPurdum.Dev` cannot be built standalone from a clean state — the Compiler needs `Source.dll` on disk. The CI workflow captures this:

```bash
cd TimPurdum.Dev.Source && dotnet build -c Release   # build Source first
cd BlogGenerator/TimPurdum.Dev.BlogGenerator.Compiler && dotnet run -c Release   # generate HTML + components
cd TimPurdum.Dev && dotnet publish -c Release        # publish WASM app
```

Locally, `dotnet build TimPurdum.Dev.sln` usually works because the project references trigger the Source build first and the targets file runs the Compiler. If you're hitting "could not load Source assembly" errors, build `TimPurdum.Dev.Source` explicitly first.

## Embedded interactive components

Posts can embed live Blazor components by placing a fenced block in markdown:

````markdown
```blazor-component MyComponentName
<MyMapWidget Style="height:400px" />
```
````

The Compiler emits `MyComponentName.razor` into `TimPurdum.Dev/Components/` and replaces the block with `<div id="my-component-name"></div>`. At runtime, `AddGeneratedBlogContent()` reflects over the entry assembly's `ComponentBase` subclasses and binds each one whose kebab-cased name appears as an `id` in the current page. **Component class names must be unique across the project** (the matching is by `Type.Name`).

`Program.cs` is intentionally tiny — do not add per-component registration there; let the discovery mechanism handle it.

## Configuration & secrets

- `TimPurdum.Dev/wwwroot/appsettings.json` is **gitignored** (`.gitignore` line 7: `TimPurdum.Dev/wwwroot/appsettings.*`). It contains the ArcGIS API key, GeoBlazor license, and the `BlogSettings` block.
- CI injects it from the `APP_SETTINGS` GitHub secret in `.github/workflows/static.yml`.
- For local dev you need a populated `appsettings.json` with at minimum the `BlogSettings` section — the Compiler binds it via `IOptions<BlogSettings>` and will throw on missing required paths.

The `BlogSettings` paths (`SourceProject`, `PostsContentPath`, `SourceTemplatesPath`, etc.) are resolved relative to the WASM project folder by `Program.cs` of the Compiler before the generator runs. Don't hardcode absolute paths.

## NuGet feeds

`NuGet.Config` pins three sources: the `dotnet10` Azure DevOps feed (for .NET 10 preview/RC packages), `NuGet.org`, and `local`. If a restore fails for `Microsoft.*` 10.0.x packages, the dotnet10 feed is the likely cause — check connectivity to `pkgs.dev.azure.com`.

## Common commands

```bash
# Full build (uses MSBuild targets to chain Source → Compiler → WASM)
dotnet build TimPurdum.Dev.sln

# Local dev server (after at least one full build so generated files exist)
cd TimPurdum.Dev && dotnet run

# Regenerate site only (after editing posts/templates, without a full WASM rebuild)
cd BlogGenerator/TimPurdum.Dev.BlogGenerator.Compiler && dotnet run -c Release

# Production publish (matches CI output path TimPurdum.Dev/bin/Release/net10.0/publish/wwwroot)
cd TimPurdum.Dev && dotnet publish -c Release

# AOT publish (large; matches Docker build)
cd TimPurdum.Dev && dotnet publish -c Release /p:RunAOT=true

# Test the AOT build locally via Docker (requires Docker + ~5GB free)
docker compose up --build
# Site is served at http://localhost:8080 by nginx
```

There are no unit tests in this repo.

## Authoring content

- **New post**: add `TimPurdum.Dev.Source/Content/Posts/YYYY-MM-DD-slug.md` with YAML front matter (`layout: post`, `title`, `subTitle?`, `lastmodified`). Filename date is authoritative for sort order; the front matter `lastmodified` controls regeneration (`post.Update`).
- **New page**: add a Razor file under `Content/Pages/` with an `@page` directive and a `[Parameter] List<LinkData> NavLinks` if it needs nav data.
- **Custom template tweaks**: edit files in `TimPurdum.Dev.Source/Templates/` (`RootTemplate`, `PageLayout`, `PostLayout`, `Header`, `Footer`, `NavMenu`). They override the defaults in `BlogGenerator.Shared/DefaultImplementationTemplates/`.
- After editing markdown or templates, re-run the Compiler (or rebuild the solution) — generated HTML lives under `TimPurdum.Dev/wwwroot/post/YYYY/MM/` and `TimPurdum.Dev/wwwroot/*.html`. These are checked in (the deployed site serves the static HTML directly).

## Deployment

`.github/workflows/static.yml` builds on push to `main` (or `reset`) and deploys `TimPurdum.Dev/bin/Release/net10.0/publish/wwwroot` to GitHub Pages. The default publish (no `RunAOT=true`) is what ships — AOT is only used for the local Docker image. Don't enable AOT in the CI workflow without checking the resulting bundle size.
