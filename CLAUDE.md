# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog at mattbrailsford.dev. Uses GitHub Discussions as the content source, Astro as the static site generator, and Netlify for hosting/serverless functions.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type check (`astro check`) then build to `dist/`
- `npm run preview` — Preview production build locally

## Required Environment Variables

Copy `.env.example` to `.env`:
- `GITHUB_ACCESS_TOKEN` — GitHub API token for fetching discussions
- `GITHUB_REPO_OWNER` / `GITHUB_REPO_NAME` — Repository containing blog discussions
- `DOMAIN` — Site domain (e.g. `mattbrailsford.dev`)

## Architecture

### Content Pipeline

Blog posts are GitHub Discussions loaded via `github-discussions-blog-loader` into Astro Content Collections (see `src/content/config.ts`). Posts labeled `state/draft` or `state/scheduled` are excluded from builds. Metadata (tags, series, reading time, etc.) comes from discussion frontmatter.

### Automated Publishing

Netlify serverless functions in `netlify/functions/`:
- **webhook.mjs** — Receives GitHub Discussion webhook events, validates posts, handles scheduling, triggers deploys
- **tick.mjs** — Runs every 5 minutes, checks for scheduled posts due for publishing, triggers deploys

Shared helpers live in `netlify/functions/lib/`.

### Page Generation

Dynamic routes in `src/pages/`:
- `[...page].astro` — Paginated homepage (10 posts/page)
- `[slug].astro` — Individual blog posts
- `tag/[tag]/[...page].astro` — Tag archive pages
- `series/[series].astro` — Series pages
- `feed.xml.ts`, `tag/[tag]/feed.xml.ts`, `series/[series]/feed.xml.ts` — RSS feeds
- `open-graph/[...route].ts` — Dynamic OG image generation via `lib/astro-og-canvas/`

### Key Files

- `src/utils.ts` — Blog post fetching, sorting, and formatting helpers
- `src/consts.ts` — Site title, description constants
- `src/types.ts` — Type re-exports from the blog loader
- `src/layouts/Default.astro` — Main layout (includes analytics, webmentions)
- `lib/astro-og-canvas/` — Custom OG image generation using CanvasKit

### Styling

Tailwind CSS 3 with `@tailwindcss/typography`. Custom plugin in `tailwind.config.mjs` adds `prose-inline-code` variant. Global styles in `src/styles/global.css` handle code syntax highlighting.
