<!--
  Condensed from the house C# standard the demo repo was built against. The original is 264 lines
  and cites one company's private process repository. What is left here is everything that changes
  written code, plus the two things that made the file work: a divergence table, so a reader knows
  where the tooling beats the community standard, and an enforcement section, so the checkable half
  does not depend on anyone reading this document.

  Copy to your repository root as CODE_STYLE-CSHARP.md, or fold the sections you enforce into
  AGENTS.md. Delete this comment.
-->

# C# styling guidelines

The C# half of the coding standard. Where this file is silent, follow the current Microsoft
documentation and the idioms of the language version in use.

## Sources and precedence

Highest authority first. Lower sources never override higher ones.

1. **The team's committed `.editorconfig` and `.sln.DotSettings`.** This is the standard. This
   document describes it and must track it, not the other way around.
2. **This file**, for what tooling cannot express: design, testability, and naming beyond the
   analyzers.
3. **The community standard** ([C# Coding Guidelines](https://csharpcodingguidelines.com/), Aviva
   Solutions, `AV####` references below). Advisory, and lower than the two above: where it disagrees
   with the repository's tooling, the tooling wins. Its value here is the design and quality guidance
   that house style documents tend to skip.

Handle every warning: fix it, or suppress it narrowly and say why. Never let them accumulate.

### Divergences from the community standard

Each of these is kept because the committed tooling enforces it repo-wide, so the document follows
the machine rather than arguing with it:

| Topic | Community default | House rule |
|---|---|---|
| Private instance fields | no prefix, `camelCase` (AV1705) | `_camelCase` |
| Three-letter-or-longer acronyms | `Json`, `Url`, `Gis` (AV1706) | fully capitalized: `JSON`, `URL`, `GIS`, `WMS` |
| Member ordering | private fields first, methods in call order (AV2406) | the newspaper metaphor below |
| Single-line `if` | always braces (AV1535) | brace-less `if (x) return;` when the whole statement fits on one line |
| Expression-bodied members | permitted for methods (AV2410) | block bodies only for methods, constructors, operators, and local functions |
| `using` ordering | System first, grouped by root namespace (AV2402) | no System-first sort, no separated import groups |
| Maximum line length | 130 (AV2400) | 120 |

## Formatting fundamentals

| Rule | Value |
|---|---|
| Indentation | 4 spaces, no tabs |
| Line endings | CRLF |
| Final newline | not inserted |
| Maximum line length | 120 characters, comments included; long strings excepted |
| Consecutive blank lines | 2 at most, where a double blank marks a grouping |

- **Allman braces.** A brace starts a new line, aligned with the declaration above. Brace-less is
  allowed only for a single-line `return`, `throw`, or `break` that fits, a file-scoped namespace, a
  `using` declaration, and inside a `case` label.
- **Wrap before the operator, not after it.** Continuation lines lead with `.` for a method chain and
  with `&&` or `||` for a condition. Wrapped initializers get one member per line. Do not align
  binary expressions into columns.
- **Blank lines:** two after the `using` block and around namespace-level elements; one before a
  multi-line construct, a single-line comment, and a control-transfer statement; none between
  adjacent fields or auto-properties.

## File and project layout

- **File-scoped namespaces** that match project namespace and folder structure.
- **`using` directives outside the namespace.**
- **One class per file.** Exceptions: related `record`s, nested classes, and a type used by exactly
  one class.
- **Global usings** at the top of `Program.cs`, or in `GlobalUsings.cs` for a library.
- **Extension methods** on framework or third-party types live in an `Extensions` folder, named
  `<TypeName>Extensions`. If you own the type, ask whether an instance method is better.
- **Regions** are acceptable for navigation and are a smell: they usually mean the class should be
  split.

## Naming

| Convention | Applies to |
|---|---|
| `PascalCase` | types, methods, properties (public or private), events, public fields, constants including `private const`, non-private fields |
| `IPascalCase` | interfaces, always with the `I` prefix |
| `camelCase` | locals, local constants, parameters, `private static readonly` fields |
| `_camelCase` | private instance fields |

- **Acronyms stay fully capitalized**, following the spelled-out form: `GIS`, `JSON`, `URL`, `ESRI`,
  `WMS`, `WMTS`, `KML`, `GPS`, `CSV`, `UTC`. This one has no analyzer and is the rule reviewers miss
  most often, which is why it is repeated in the global instruction file.
- **Do not suffix `Async` on every async method.** Be consistent within a repository.
- **Do not append the kind to a type name.** `RoleType`, not `RoleTypeEnum`.

## Member ordering: the newspaper metaphor

The public contract sits above the fold; the details are below it. The cleanup tool enforces this,
so do not hand-sort while writing. Opt out per type with `[NoReorder]`.

1. Constructors, static first
2. Operators
3. Events
4. Properties, public to private, static first within each
5. Public fields
6. Interface implementations, grouped by interface
7. Public methods, then protected, then private
8. Non-public fields, static and readonly first
9. Nested types

## Language features

- **`var` only when the type is evident** from the right-hand side. Prefer the predefined keyword
  (`int`, `string`) to the BCL name.
- **Nullable reference types on.** Resolve every nullable warning with a real check, a `?` where
  null is allowed, or a `!` where null is provably impossible.
- **Match the modern idioms:** `record` for immutable data with value equality, `required` or a
  constructor for initialization but not both, target-typed `new()`, collection expressions,
  primary constructors.
- **Pattern matching over the older idioms:** `is null` and `is not null`, never `== null`; `is
  MyType x` instead of `as` plus a null check; property patterns; `not` patterns.
- **A `switch` expression** rather than more than about four chained `if`/`else` blocks.
- **Expression bodies** for accessors, properties, indexers, and lambdas; **block bodies** for
  methods, constructors, operators, and local functions.
- **Parentheses for clarity** in arithmetic and relational expressions, and required in any mix of
  shift, bitwise, and conditional operators.
- **`readonly` wherever it holds**, and static anonymous functions where nothing is captured.

## Diagnostics and suppressions

Fix the warning rather than suppressing it. A suppression that is genuinely correct is scoped as
narrowly as the compiler allows and carries a comment saying why. One rule is disabled across the
repository for its public API shape, and it is named in the `.editorconfig` so the exclusion is
visible rather than folklore.

## Design and quality

The dimensions the formatting rules do not reach. These are defaults for judgment, not mechanical
edits.

- **Simplest thing that fully solves the problem,** and nothing built for a speculative future.
  Generalize on the third occurrence (AV0115, AV0120).
- **Own the code you commit.** Review and understand anything a tool produced; you are accountable
  for it as if you typed it (AV0135).
- **Composition over inheritance,** and only for a true is-a relationship (AV0110). Depend on an
  interface, not a concrete class (AV1004). Talk to immediate collaborators, not their internals
  (AV1014).
- **A class owns its state and its behavior.** A pure data holder is a DTO, a parameter object, or a
  `record` (AV1025, AV1030).
- **Duplicate inside a boundary, not across one.** Small duplication across boundaries, and in
  tests, is often clearer than a shared abstraction (AV0125).
- **Never return `null` for a string, a collection, or a task** (AV1135). Expose collections as
  read-only interfaces (AV1130).
- **Throw, with a message that states the cause and how to avoid it,** rather than returning a status
  code (AV1200, AV1202). Never `catch (Exception)` to hide a failure (AV1210).
- **Materialize a LINQ result you return,** so callers do not meet deferred execution by surprise
  (AV1250).
- **Small methods, few parameters, least visibility.** Past three parameters, introduce a parameter
  object. No `bool` parameters, because `DoThing(true)` is unreadable at the call site (AV1561,
  AV1564).
- **No magic numbers** (AV1515), **no commented-out code, and no `TODO` left behind**: track the work
  in an issue (AV1575).
- **Test observable behavior, not implementation.** Assert through the public surface, never against
  private state, and never compute an expected value with the same code under test (AV1605, AV1618).
- **`Any()` rather than `Count() > 0`** (AV1800). Never mix `await` with `.Wait()` or `.Result`
  (AV1830).
- **XML documentation on the public surface** states purpose, not implementation. Prefer a
  well-named method to a comment, and reserve comments for why a non-obvious decision exists
  (AV2305, AV2310, AV2316).

## Enforcement and tooling

- **Do not rely on a reader having opened this file.** Two files at the repository root turn the
  analyzer-checkable subset into build output: an `.editorconfig` with the naming and style rules,
  and a `Directory.Build.props` that sets `EnforceCodeStyleInBuild`. Together they make a misnamed
  private field fail `dotnet build` for every person and every agent, whether or not anyone read
  this document. The acronym rule has no analyzer and stays a review finding, which is why it is
  also stated in the global instructions.
- **`.editorconfig` at each repository root** drives `dotnet format`, Visual Studio, and Rider.
- **The ReSharper or Rider cleanup profile is the authoritative formatter.** Run it to apply
  formatting and the member reordering above.
- **Settings layer in one direction only:** machine, then the committed team-shared solution layer,
  then personal settings, which are never committed. Personal settings must not override team rules.
- **To change the house style,** edit the team-shared layer, export it, and open a pull request
  against the shared style repository, then re-import into affected solutions. A style change made
  locally has changed nothing.
