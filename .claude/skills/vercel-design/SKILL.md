---
name: vercel-design
description: Vercel's design guidelines — clarity over decoration. Load before building or restyling any UI in this project: pages, layouts, components, dashboards, tables and charts. Use when choosing colour, type, spacing, layout composition or motion, and when a design looks dated, cluttered or generic. Source — https://vercel.com/design.md
---

# Vercel design guidelines

The house style for this project's UI. Source: <https://vercel.com/design.md>.

## Core philosophy

Prioritise **clarity over decoration**.

> Build confidence through clarity, proof, and command of the material. Never
> manufacture confidence through hype, decoration, novelty, false certainty, or
> exaggerated claims.

Serve readers who need evidence-led decision support, not marketing surfaces.

## Priorities, in order

1. Preserve supplied facts, formulas, units, qualifiers and constraints
2. Maintain the caller's framework, routes and Geist foundation
3. Make the reader's questions and the evidence immediately clear
4. Establish unmistakable authorship
5. Compose specifically for the material; avoid generic templates
6. Refine responsive behaviour without weakening hierarchy

## Typography

Geist Sans throughout. Geist Mono is reserved for code, commands and
identifiers — and, in this project, for numerals in tables so figures align.

Type roles:

| Role | Use |
| --- | --- |
| `display` | A single page-defining statement |
| `title` | Page titles |
| `heading-24` / `heading-20` / `heading-16` | Nested structure |
| `lede` | Orientation passages |
| `body` | Reading prose |
| `label` | Compact names |

Never use tiny muted prose. Maintain readable size and line height.

## Colour

**Monochromatic by default.**

> Use color only when it adds significant meaning to state, action, or data,
> and pair it with a non-color cue.

Surface tokens: `--vbg-surface-primary`, `--vbg-surface-secondary`,
`--vbg-surface-contrast`, each with a matching text layer. Charts use
`--vbg-chart-1` … `--vbg-chart-6`.

Never rely on colour alone to convey meaning (WCAG AA).

## Spacing

Tokens `--vbg-space-1` … `--vbg-space-16`. Within-group gaps are typically
`2–4`; major section turns `8–12`.

## Grid and composition

- Desktop 12 columns, tablet 6, mobile 4
- Reading prose occupies 6–7 desktop columns
- Tables, charts and major comparisons span full width
- All objects align to shared edges, baselines or grid lines
- **Large empty rectangles caused by underfilled splits indicate layout failure**

## Components

**Tables** — semantic HTML. Text headers and cells left-aligned; numeric
headers and cells right-aligned, marked `class="vbg-numeric"` or
`data-align="numeric"`. Full-width by default. Row labels on one line where
possible. Multi-line headers bottom-aligned; body cells baseline-aligned.

**Charts** — nest in `figure.vbg-chart` with a header, a focusable viewport
(inline SVG), a caption and an optional legend. Label directly; legends
supplement only when necessary.

**Statistics** — `.vbg-stat-strip` containing peer `.vbg-stat` blocks, each
with a label, a value and optional detail.

**Calculators** — one canonical state model. The working tool dominates the
first viewport; never precede it with a ceremonial static version. Native
controls with visible labels, units and focus states.

## Evidence and data visualisation

- Show units, periods, populations and qualifiers near the evidence
- Use zero baselines for length encodings, unless a range or delta better
  serves the question
- Make peer denominators explicit; never compare raw numerators with unequal
  bases
- Repeated horizontal bars share one layout: fixed label lane, plot lane,
  value column
- Captions state what to notice **and what the chart does not establish**

## Reject these defaults

- All-caps eyebrows, overlines, decorative section numbers
- Centred hero copy followed by card grids
- Repeated metric boxes — compose relationships instead
- Badges, pills or rounded capsules for ordinary metadata
- Nested cards or borders repairing weak hierarchy
- Dark rectangles around charts or calculators
- Decorative gradients, glows, blobs, glass effects
- Tiny muted prose
- Stock imagery, fake screenshots, Easter eggs, decorative motion
- Visible theme switchers or print-only UI

## Motion

> Default to stillness. Never add auto-scrolling marquees, simulated typing
> cursors, or decorative pulsing.

Motion may only explain a state change, preserve continuity, or confirm an
action. Respect `prefers-reduced-motion`.

## Accessibility

- One descriptive `h1`, ordered headings, a skip link
- Semantic tables, figures with captions, accessible names
- Visible focus states; text alternatives for images
- WCAG AA; never rely on colour alone
- Source order is reading order; preserve usability in light and dark modes

## Four-pass workflow

1. **Frame the reader's job** — the decision, the strongest answer, the
   supporting evidence, the material caveats
2. **Choose composition** — let the material, not a template, determine layout
3. **Apply the visual system** — published primitives, tokens, authorship shell
4. **Inspect privately** — check first read, language, hierarchy, typographic
   consistency, honesty of evidence, and restraint before handoff
