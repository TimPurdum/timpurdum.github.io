---
layout: post
title: Iowa Code Camp 2026 Presentation Links
subtitle: "Don't Feed the Machine Spaghetti: Code Quality Principles for the AI Era"
author: Tim Purdum
description: The two instruction files from my Iowa Code Camp 2026 talk, plus the deck, ready to copy into your own repositories.
lastmodified: 2026-11-07 04:41:20
---
At Iowa Code Camp this year I spent the hour arguing that tangled code charges you twice: once when a person reviews it, and again on every turn a model re-reads it. If you were in the room, thanks for spending an hour of your Saturday on that. This page has the two files I use to keep the second bill down, an `AGENTS.md` and a C# style guide, plus the deck I used to argue it.

The slides are already online, one HTML file with no build step behind them: [view the deck](/slides/iowa-code-camp-2026/index.html). Arrow keys or Space move through it, `T` toggles the thumbnail rail, `F` goes full screen, `P` opens a presenter view with my notes, and `N` pulls the notes over the current slide.

## The Two Files

- [`AGENTS.md`](/files/iowa-code-camp-2026/AGENTS.md): the file every session reads before it touches anything, cut from 204 lines to 186.
- [`CODE_STYLE-CSHARP.md`](/files/iowa-code-camp-2026/CODE_STYLE-CSHARP.md): the C# half of our house style, cut from 264 lines to 184.

Nothing to install. Both are Markdown, and each one opens with a comment saying what I cut and why, which is the part I expect you to argue with.

## What Is In The Global File

The section I would keep if the rest had to go is the last one, "What stays always-on". It asks three questions of any rule that wants a line in a file that every session pays for. Would arriving late be the same as not arriving at all? Then the agent can fetch it when the task calls for it, and it does not belong here. Is it only true in one repository? Then it belongs in that repository's own file. Does it have to happen every time, with no judgment in it? Then it belongs in a hook.

Without that section the file grows forever, and a file that grows forever stops being read by anyone, including the model holding it in context.

Two of the remaining rules earned their place the hard way. One says to target the latest released version of the framework and not the oldest one you are sure of, because an agent once defaulted a new tool to an old long-term-support release "for compatibility" while the current SDK sat installed on the same machine. The other says a defect you stumble onto outside the task is a report and not an edit, after an agent "fixed" a bug in a patch release that turned out to be four years old and nowhere near the work I had asked for.

The git section is short and blunt. Never commit or push to the default branch. When I say "commit everything", that means every modified and untracked file, because my working tree is visible to me and it is not visible to the model, so the model is the wrong party to decide what counts as noise.

## What The Style File Does Differently

Seven rows in the style file name a spot where our house rules disagree with the Aviva C# guidelines, with the community rule and its `AV####` number written beside ours. I think the Aviva standard is quite good, which is why those seven disagreements are worth writing down instead of leaving them to be discovered in review. We keep `_camelCase` private fields against their plain `camelCase`, fully capitalized acronyms (`GIS`, `URL`, `WMS`) against their `Gis` and `Url`, block bodies for methods against their expression bodies, and 120 columns against their 130. Saying it out loud, with the source cited, is what stops an agent from repairing your code back to the community default with the best intentions.

The last section is worth copying on its own. Two files at the repository root, an `.editorconfig` and a `Directory.Build.props` that sets `EnforceCodeStyleInBuild`, turn the naming rules into `dotnet build` warnings, so a private field named the wrong way fails the build for every person and every agent who tries to build. The acronym rule has no Roslyn analyzer behind it and stays a review finding. The file says so rather than implying the build catches everything.

## Installing Them

1. Put `AGENTS.md` where the tool that runs your agent actually looks. Codex, OpenCode, and Pi read that name, and Claude Code reads `CLAUDE.md`, so use that name there or leave a one-line pointer to the file. I have not tested Cursor or Windsurf, and I do not know whether either picks up `AGENTS.md` without being pointed at it.
2. Delete every line in it that is not true of your work. Mine is already a cut. Yours should end up shorter than 186 lines, and if it ends up longer you will stop reading it.
3. Drop `CODE_STYLE-CSHARP.md` into the repository you are working in today, along with the two enforcement files it describes.
4. Run `dotnet build` and read the warning list. I really did not expect mine to be as long as it was the first time, and that list is the honest place to start.

## What They Will Not Do

They will not save you tokens. In the benchmark behind the talk, the arm with the instruction file spent more output tokens on two of the three tasks I measured. Context is the budget, and this spends some of it.

They will not fix architecture you never described. A file that does not name your seams leaves the agent to invent one, which is how you end up with a second helper sitting next to the one you already had.

They also go stale, and a stale instruction is worse than a missing one, because it gets followed confidently. Pin the package version in one place (the global file is a good spot, since every session reads it) and look at it when you upgrade.

The sample sizes are small besides: three to five runs per cell, on one machine, in one week. Read the direction and skip the p-value.

## Get In Touch

Copy them, change something, and tell me which line you deleted first, because that is the one I got wrong. Ping me on Mastodon at @TimPurdum@dotnet.social, or email me at [tim.purdum@dymaptic.com](mailto:tim.purdum@dymaptic.com).

