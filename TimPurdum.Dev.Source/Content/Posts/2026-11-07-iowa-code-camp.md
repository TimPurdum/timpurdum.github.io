---
layout: post
title: Iowa Code Camp 2026 Presentation Links
subtitle: "Don't Feed the Machine Spaghetti: Code Quality Principles for the AI Era"
author: Tim Purdum
description: The two instruction files from my Iowa Code Camp 2026 talk, ready to copy into your own repositories.
lastmodified: 2026-11-07 04:40:10
---
If you came to my session at Iowa Code Camp this year, thanks for giving me an hour of your Saturday. The talk had one moving part, the file you put in your repository, and this page is that part, twice.

The deck is up as well: [view the slides](/slides/iowa-code-camp-2026/index.html). That is the same file I drove from the stage, and it runs in the browser with nothing else installed. Arrow keys or Space move through it, `T` toggles the thumbnail rail, `F` goes full screen, `P` opens a presenter view with my notes, and `N` toggles the notes panel over the slide.

## The Two Files

- [`AGENTS.md`](/files/iowa-code-camp-2026/AGENTS.md): my global instruction file, cut from 204 lines to 186. This is the file every session reads before it touches anything, in every repository I work in. Git discipline, the code quality gates, how prose gets written, and the rules for delegating work to subagents all live here.
- [`CODE_STYLE-CSHARP.md`](/files/iowa-code-camp-2026/CODE_STYLE-CSHARP.md): the C# half of our house style, cut from 264 lines to 184. Formatting, naming, member ordering, design defaults, and the two files that make half of it fail the build.

Both are plain Markdown with no dependencies, and both start with a comment describing what I cut and why. Read that comment first. The editing is the part worth arguing with, more than the rules themselves.

## Why These Two And Not The Rest

The instruction set is layered, and each layer fixes a different failure. Repository files fix invention and scope drift. Skills fix repetition. Orchestration fixes an agent that declares success before the work is done. I covered all of it in the talk, and I'm handing you the first layer only, because it is the one that pays on the first day and costs nothing to adopt.

My reason is concrete. A global file is read on every session whether or not anything triggers it. A skill is read only when its description matches the task, and I have watched that match not fire often enough to stop trusting it for anything I care about. The rule that has to hold every single time belongs in the file that is always loaded, or in a hook, and nowhere else.

## What Is Actually In The Global File

The three sections people tell me they copied first:

- **Git and commit discipline.** Never commit to the default branch, and when I say "commit everything," that means every modified and untracked file, not the ones the agent judges to be noise. My working tree is visible to me and it isn't visible to the model, so the model is the wrong party to decide what belongs.
- **Write so it can be read without a decoder.** Every project identifier gets a short gloss on first use, one decision per sentence, at most one bold span per paragraph, US spelling. This came out of two analyses that were technically correct and impossible for me to read, because every third phrase pointed at a decision I had recorded somewhere else.
- **What stays always-on.** Three tests for whether a line earns a place in a file that is billed to every session. If arriving late is the same as not arriving, it doesn't belong. If it's true in one repository rather than all of them, it belongs in that repository's file. If it must happen every time with no judgment, it belongs in a hook.

That last section is the one I would keep if I could keep only one. Without it the file grows forever, and a file that grows forever stops being read by anyone, including the model that has it in context.

## What Is Actually In The Style File

The divergence table is the most useful page in it. Every house style disagrees with some community standard, and ours disagrees with the Aviva C# guidelines on seven points. We keep `_camelCase` private fields, fully capitalized acronyms like `GIS` and `URL`, and the newspaper metaphor for member ordering. Naming those disagreements, with the community rule and its number beside each one, means an agent or a new hire stops "fixing" our style back to the default.

The enforcement section is the second most useful. Two files at the repo root, an `.editorconfig` and a `Directory.Build.props` that sets `EnforceCodeStyleInBuild`, turn the naming rules into `dotnet build` warnings. The acronym rule has no Roslyn analyzer, so it stays a review finding, and the file says so out loud instead of implying that the machine catches everything.

## Putting Them To Use

1. Copy `AGENTS.md` to the file your harness actually reads. Codex, OpenCode, and Pi read `AGENTS.md`; Claude Code reads `CLAUDE.md`. Check the name before you trust it, because an instruction file the harness never loads behaves exactly like no file at all, and you'll never get an error telling you so.
2. Delete every line in it that isn't true of your work. Mine is already a cut, and yours should be shorter, not longer.
3. Copy `CODE_STYLE-CSHARP.md` into the repository you're working in today, along with the two enforcement files it describes.
4. Run `dotnet build` and find out whether your existing code passes your own style. It won't! That gap is the most useful thing you'll learn about your repository this week, and it costs one command.

## What They Will Not Do

I'd rather be the person who told you the limits than the person who sold you a saving.

- **They will not make the model cheaper.** In the runs behind the talk, the arm with the instruction file spent more output tokens on two of the three tasks I measured. Context is a budget, and this spends some of it.
- **They will not fix architecture you didn't describe.** A file that never names your seams leaves the agent to invent one, which is how you get a second helper next to the one you already had.
- **They go stale, and stale instructions are worse than missing ones.** A file that pins a package version you upgraded last month is followed confidently and wrongly. Put the version in one place, and check it when you upgrade.
- **The sample sizes are small.** Three to five runs per cell, one machine, one week. I'm reporting a direction and an effect size, not a p-value, and the numbers are in the talk rather than on this page.

## Get In Touch

If you copy either file and change something that I should have gotten right, I want to hear about it. Ping me on Mastodon at @TimPurdum@dotnet.social, or email me at [tim.purdum@dymaptic.com](mailto:tim.purdum@dymaptic.com). Both reach me, and the file is better with your edits in it.


