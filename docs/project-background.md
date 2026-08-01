# Project Background

Last updated: 2026-07-07

## Purpose

This project is a customizable personal-site template with optional resume content. The goal is to let people fork or clone it, replace the sample content, deploy it on Vercel, and maintain their profile through a visual admin editor.

The project should feel like an individual, lived-in personal page rather than a formal recruiting portfolio or a marketing landing page for the template itself. `/` is an independent welcome cover; `/profile` contains the owner's profile, interests, projects, and resume material.

## Product Model

- The public site has an independent welcome route and a personal-home route.
- The admin site is a visual editor for the same homepage.
- The content source of truth is a single validated `SiteConfig` object.
- Vercel Blob stores the production config and uploaded images.
- `lib/default-site-config.ts` is sample fallback content for local development and fresh deployments.

`SiteConfig` still stays as one Blob-backed document, but it now has two layers:

- The root `profile`, `blocks`, `theme`, and core metadata are the main version and main language content.
- `contentVariants` stores optional content snapshots keyed as `variantId:locale`, for example `u1:en`.

When a version/language snapshot does not exist, rendering falls back to the nearest available content in this order:

1. Requested version + requested locale.
2. Requested version + main locale.
3. Main version + requested locale.
4. Root main version + main locale.

## Important Mental Model

The old `sections` concept is now represented as `Block` records with `type: "section"` and `size: "section-text"`. They are full-width text blocks, not containers that own block cards.

All content blocks use the internal `__top_level__` section id. Normal cards and full-width text blocks share one vertical content-order axis. This lets a text block move above, below, or between card groups without making cards feel like children of that text block.

Do not normalize top-level block `sortOrder` as if it were section-local order. A top-level block's `sortOrder` controls where it appears relative to text sections, so unrelated top-level siblings should keep their global order when another block is dragged or resized.

Block cards should be able to move before or after a text block on the shared content axis. The editor should not force a card into a hidden section-owned grid just because the pointer is near a heading.

If an older config has `sections`, normalize each section into a `type: "section"` block. If an older config has `block.sectionId` pointing at a section, normalize it into the shared content flow and rewrite the block to `__top_level__`; do not preserve section-owned card groups.

Do not reintroduce visible blank sections as placeholders. If blocks are detached from a section, make them top-level blocks.

## Language and Variant Routing

Variants are role or audience versions of the same personal site, such as a developer version, internship version, or company-facing version. Languages are edited inside the selected variant.

The admin editor keeps a `baseConfig` plus a materialized editing view. Switching the top-bar version or language calls `materializeSiteConfig(...)`; edits to non-main content write back through `writeSiteContentSnapshot(...)` into `contentVariants`. Global project settings and the variant list still belong to `baseConfig`. Scoped JSON import/export uses the currently selected top-bar version/language: export serializes that materialized snapshot, and import writes the imported snapshot back through `writeSiteContentSnapshot(...)` into the current scope. Languages are stored inside each variant as `settings.variants.variants[].languages`; `settings.languages` is retained as a legacy compatibility mirror of the main variant only.

The top-bar language picker is filtered by the selected variant. The main locale is always available; other enabled languages appear only when they belong to that selected variant. This prevents one version's language records from leaking into another version.

In project settings, languages and variants share one `多版本&多语言` branch. The main interaction starts from version cards: add a version, then use the plus control inside that version to open the add-language dialog. The dialog lets the editor choose a fixed language code from supported BCP 47-style options and set an editor-only remark name; users do not type locale codes manually. Adding a language to a version creates the matching `variantId:locale` snapshot and a language record only inside that version. The language capsule can be renamed, hidden with its checkbox, promoted to that version's main language after confirmation, or deleted with typed confirmation. The main language is stored per variant so one version's fallback language does not affect another version.

The editor top bar exposes a `版本覆盖` action next to the version selector. It copies a full source snapshot from a selected source version and source language into the currently selected top-bar version/language, including profile data, blocks, theme, web title/description, and SEO fields. The overwrite requires a second confirmation because the target snapshot is replaced directly.

The `网页与域名` and `SEO` settings panels edit the currently selected version/language content snapshot. The web panel is the primary place for browser/page title and description and writes both the legacy site fields and the SEO metadata fields so the visible editor label matches the browser title behavior. The SEO panel is reserved for advanced fields such as canonical URL and OG image. The panels show variant and language badges so the editor can see which public metadata module is being edited. The public site URL remains a global origin; public variant access still uses hidden short suffixes such as `/u1` rather than changing the canonical origin per version.

Search indexing is controlled per variant with `allowSeoIndex`. Existing configs default to index the main variant and noindex other variants; newly added variants also default to noindex. The editor can manually enable indexing for a non-main variant when it should be discoverable.

Public routing uses hidden short access codes:

- `app/[accessCode]/route.ts` also recognizes an enabled main-version locale such as `/en`; it clears any hidden-version session, selects that language, and redirects to `/`.
- `app/[accessCode]/route.ts` checks whether the path matches an enabled variant access code such as `/u1`.
- `app/[accessCode]/[locale]/route.ts` selects both a hidden version and one of its enabled languages, such as `/u1/en`.
- A valid access code writes HTTP-only variant cookies and redirects to `/`, so visitors still enter through the welcome cover.
- A hidden access code without a locale resets that hidden version to its own main language.
- `proxy.ts` decrements the variant view counter on `/profile`; opening the welcome cover does not consume a view.
- `/reset` and `/?reset` clear the public variant cookies immediately and redirect to the main homepage.
- `lib/public-site-context.ts` resolves the active variant and locale for both public routes and emits route-specific metadata from the active variant's `allowSeoIndex` setting.
- The public language switcher is only shown on `/profile` when the active variant has more than one enabled language. It writes the selected locale through the public locale API and returns to `/profile`. A short-lived transition cookie keeps the preparation layer mounted across the redirect. The server accepts only locales enabled for the active variant; otherwise rendering falls back to browser language or the variant main language. `/reset` clears the variant cookies and the manual language cookie.

The short access code namespace must not collide with system paths such as `admin`, `api`, `icon`, `_next`, `favicon.ico`, `reset`, or `profile`. `lib/validators.ts` enforces this before config save.

## Main Files

- `app/page.tsx`: independent welcome-page entry.
- `app/profile/page.tsx`: personal-home entry.
- `app/[accessCode]/route.ts`: hidden variant access-code entry and redirect.
- `app/[accessCode]/[locale]/route.ts`: hidden variant plus explicit locale entry and redirect.
- `app/admin/page.tsx`: protected admin entry.
- `proxy.ts`: public variant cookie view-count expiry.
- `components/admin/AdminVisualEditor.tsx`: primary admin editor.
- `components/admin/AdminLoginForm.tsx`: flat admin login surface; it reuses the saved editor language and otherwise follows the browser language.
- `components/admin/ImageCropUploader.tsx`: shared image upload/crop dialog.
- `components/admin/BlockForm.tsx`: block editing form.
- `components/site/SiteLayout.tsx`: personal-home layout shell.
- `components/site/ContentArea.tsx`: ordered public content rendering.
- `components/blocks/BlockCard.tsx`: main block card renderer.
- `lib/utils.ts`: render model, ordering helpers, top-level block id, language/variant materialization helpers.
- `lib/validators.ts`: config validation.
- `lib/blob-config.ts`: Vercel Blob read/write.
- `lib/public-variant-cookies.ts`: public variant cookie names and 10-view limit.
- `lib/default-site-config.ts`: sample fallback config.

## Design Direction

- Individual, content-first personal page with resume material as one part of the story.
- Dense but approachable admin UI.
- Avoid large hero marketing sections.
- Avoid decorative gradient blobs or one-note palettes.
- Keep controls direct and concrete: icons for actions, segmented choices for layout, handles for drag/resize.
- Admin behavior should match the visual public page closely.

## Public Responsive Layout

The public page has three layout modes:

- Wide desktop: if the viewport has enough width, render the profile module as the left desktop column and render the content modules on the right. The whole shell is centered as `left profile + right content`.
- Narrow desktop / tablet: if the viewport is not wide enough for the two-column desktop shell, stack the profile area above the content area. The content area should keep the personal-site module layout below it instead of forcing a cramped side-by-side layout.
- Mobile: at the narrow phone breakpoint, use the mobile module layout. Block grids use the mobile two-column logical grid, so square blocks can sit left/right and wider blocks span the full mobile content width.

The right content width should be content-aware on desktop. It should use at least two logical columns because text blocks need readable width, and expand to three logical columns only when visible blocks actually use the third column. Text blocks themselves should not force the content area to become three columns.

## Current Constraints

- No database beyond Vercel Blob.
- No multi-user accounts.
- No public write APIs.
- Admin authentication is a single password hash plus signed session cookie.
- Image uploads are public Blob objects.
- Config history and migrations are not yet implemented.
- Public variant selection is cookie-based and intentionally lightweight; it is not authentication or access control.

## Future Development Ideas

- Template initialization wizard.
- Import/export config JSON.
- Config backup and restore.
- Richer block templates.
- Better migration handling for older configs.
- Optional analytics integration.
- Theme presets.
