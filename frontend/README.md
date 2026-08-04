# dolgiy.fun Frontend

Standalone React + TypeScript + Vite application for `dolgiy.fun`.

## Responsibilities

* Render the public website UI.
* Talk to the Laravel backend through `VITE_API_URL`.
* Keep reusable UI in `src/components`.
* Keep static UI data in `src/data` until it moves behind API endpoints.

## Local Development

From the repository root:

```bash
make build
make up
```

Frontend URL:

```text
http://localhost:5173
```

API base URL is configured in `.env`:

```text
VITE_API_URL=http://localhost:8080/api
```

## Project Layout

* `src/main.tsx` mounts the React application.
* `src/App.tsx` composes the current page.
* `src/components/layout` contains page-level layout primitives.
* `src/components/sections` contains larger page sections.
* `src/components/ui` contains reusable UI components.
* `src/styles` contains global, reset and variable styles.

## Quality Commands

```bash
npm run lint
npm run format:check
npm run build
```

Use the Makefile wrappers from the repository root when working inside Docker:

```bash
make frontend-lint
make frontend-format
make npm-build
```
