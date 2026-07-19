# @ankhorage/utility

## Purpose

This repository contains small, runtime-neutral utilities shared across multiple Ankhorage projects.

## Architecture

- Organize utilities by cohesive domain subpaths such as `@ankhorage/utility/project` and `@ankhorage/utility/regex`.
- Keep domain-core utilities pure and independent of filesystem or framework-specific runtime APIs.
- Represent project detection as composable traits so consumers can apply their own policy.
- Add new subpaths when functionality is genuinely reused across projects and belongs to a clear domain.
- Keep domain-specific business validation in the package that owns that domain.

## Code quality

- Use strict TypeScript.
- Keep every function at 50 lines or fewer.
- Add focused tests for exported behavior.
- Run build, typecheck, lint, format check, tests, Knip, and `ankh doctor validate .` before merging.

## Public API

Public APIs are exposed through explicit package subpaths. Keep exports narrow and stable.
