# Running the Compiler locally

`TimPurdum.Dev/wwwroot/appsettings.json` is gitignored, and the Compiler needs it. These values reproduce production output byte for byte, with no diffs against the checked-in HTML:

- `SiteName` and `AssemblyNamespace` set to `TimPurdum.Dev`, and `SiteTitle` set to `Tim Purdum's Blog`.
- `SiteUrl` set to `https://www.timpurdum.dev`, and `SiteDescription` copied from the `<description>` element in `feed.xml`.
- `HeaderLinks` holding the five header `<link>` lines: two GeoBlazor `_content` lines, two font preconnects, and the Noto Color Emoji stylesheet.
- `SourceProject` set to `../TimPurdum.Dev.Source/TimPurdum.Dev.Source.csproj`.
- `PostsContentPath` set to `Content/Posts`, `PagesContentPath` to `Content/Pages`, and `SourceTemplatesPath` to `Templates`. These are relative to the Source project.

Every Compiler run rewrites `lastmodified` and trailing whitespace in other posts' markdown, including drafts. Revert those with `git checkout -- <file>` before committing.

This site's Markdig pipeline does not render pipe tables. A Markdown table comes out as a paragraph, so use a list or a raw HTML `<table>` instead.

Evidence: PR #6 baseline Compiler run. After `SiteTitle` was corrected, it produced no diffs. The draft `2026-09-23-upping-my-p-joy.md` was rewritten on every run. The Packages table rendered as `<p>Package</p>` with 0 `<table>` elements.

Verified: 2026-10-13
