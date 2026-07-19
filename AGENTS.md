# Agent Guide

## Scope

This file applies to the whole `ankhorage/utility` repository.

`@ankhorage/utility` provides small, runtime-neutral utilities shared across multiple Ankhorage projects and suitable for compatible external consumers.

## Repository facts

- Package name: `@ankhorage/utility`.
- Runtime/tooling: Bun.
- Language: TypeScript, ESM, strict mode.
- Main source root: `src/`.
- Build output: `dist/`.
- Public APIs are exposed through explicit package subpaths such as `@ankhorage/utility/project` and `@ankhorage/utility/regex`.
- README/docs are generated through Paradox where applicable.

## Architectural rules

- Organize utilities by cohesive domain subpaths.
- Keep domain-core utilities pure and runtime-neutral.
- Keep filesystem, framework, UI, and platform concerns outside core utility domains unless a dedicated subpath explicitly owns that concern.
- Represent project detection as composable traits so consumers can apply their own policies.
- Add new subpaths when functionality is genuinely reusable across projects and belongs to a clear domain.
- Keep domain-specific business validation in the package that owns that domain.

## Public API rules

- Public exports are explicit and subpath-based.
- Keep exports narrow and stable.
- Add public types only when consumers need them directly.
- Prefer implementation-local types for internal shapes.
- Update package exports, tests, docs, and changesets together when public API changes.
- Treat each public subpath as an intentional package contract.

## Project detection rules

`@ankhorage/utility/project` provides pure project-trait detection based on typed manifest data.

- Detect overlapping traits rather than forcing one mutually exclusive project kind.
- Consider `dependencies`, `devDependencies`, and `peerDependencies` for framework/package signals.
- Keep filesystem access in callers or future dedicated filesystem-oriented utilities.
- Keep detection policy separate from consumer policy. For example, `@ankhorage/devtools` may map detected traits to ESLint profiles while other consumers use the full trait set.

## Regex rules

`@ankhorage/utility/regex` contains broadly reusable patterns and related predicates.

- Name patterns according to their actual semantics.
- Prefer predicates when they provide a clearer consumer API than direct regex access.
- Keep domain-specific validation with the domain package that owns it.

## Code quality

- Use strict TypeScript.
- Keep every function at 50 lines or fewer.
- Keep modules focused and cohesive.
- Add focused tests for exported behavior.
- Keep tests deterministic and runnable offline.
- Preserve runtime neutrality in core utility modules.

## Validation

Run the relevant checks before handing off:

```bash
bun run build
bun run lint:fix
bun run test
bun run knip
bun run typecheck
bun run format:check
bunx @ankhorage/ankh doctor validate .
```

Report clearly if any validation step could not be executed.

## Changesets

Add a changeset for published behavior or public API changes, including:

- new public subpaths
- new exported functions or types
- changed exported behavior
- changed package exports

Repository-documentation-only changes generally do not require a changeset.

## Working style for agents

Before coding:

1. inspect the relevant domain subpath and existing exports
2. identify whether the change belongs in this shared package or in a domain-specific package
3. identify whether a changeset is required

While coding:

1. keep changes narrow and focused
2. preserve strict TypeScript and runtime neutrality
3. keep functions within the 50-line limit
4. update tests with behavior changes
5. keep public exports intentional

Before final handoff:

1. run validation or report what could not be run
2. summarize public API changes
3. mention the changeset when one is required
4. mention any follow-up issue needed
