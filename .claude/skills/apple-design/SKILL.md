---
name: apple-design
description: Apple's design language — photography-first, minimal chrome, one accent colour. The house style for this project's UI. Load before building or restyling any page, layout or component, and when choosing colour, type, spacing, radii, elevation or motion. Source — https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md
---

# Apple design system

The house style for this project's UI.
Source: <https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md>

## Core philosophy

UI is a transparent frame for the content. A photography-first interface that
turns marketing into a museum gallery: edge-to-edge tiles, minimal chrome, and
a **single accent colour**.

## Colour

**Interactive — one accent, no second**

| Token | Value | Use |
| --- | --- | --- |
| Action Blue | `#0066cc` | Every interactive element on light surfaces |
| Focus | `#0071e3` | Keyboard interaction |
| Dark-surface blue | `#2997ff` | Links on near-black tiles only |

**Surfaces**

| Value | Use |
| --- | --- |
| `#ffffff` | Light tiles |
| `#f5f5f7` | Parchment; alternates with white for rhythm |
| `#272729`, `#2a2a2c`, `#252527` | Three near-blacks, for micro-separation between stacked dark tiles |
| `#000000` | Global nav and void spaces only |

**Text**

- `#1d1d1f` near-black ink — body copy never uses true black
- `#ffffff` on dark surfaces
- `#7a7a7a`, `#cccccc` for secondary content

## Typography

SF Pro Display for headlines ≥19px, SF Pro Text for body and UI, with system
fallbacks. Negative letter-spacing (−0.28px to −0.374px) at display sizes
creates the signature tight headline.

| Role | Size | Weight | Tracking |
| --- | --- | --- | --- |
| Display | 56px | 600 | −0.28px |
| Display Large | 40px | 600 | — |
| Body | **17px** | 400 | line-height 1.47 |
| Caption | 14px | 400 | — |

Weight ladder is **300 / 400 / 600 / 700** — never 500. Weight 300 is used
sparingly, for button labels and airy lead paragraphs.

Body is 17px, not 16px; the extra pixel sets the reading pace.

## Spacing

Eight-pixel base. Tokens: `4, 8, 12, 17, 24, 32, 48, 80`. Sections use 80px.
Product tiles use 80px vertical padding, stack full-bleed edge to edge with
zero gaps — **the colour change is the divider**.

## Shape

| Radius | Use |
| --- | --- |
| `9999px` pill | Primary CTAs, search input, chips |
| `18px` | Utility card grids |
| `11px` | Secondary buttons |
| `8px` | Compact utility buttons |
| `0` | Full-bleed tiles stay rectangular |

Never mix radius grammars.

## Elevation

**One shadow exists:** `rgba(0, 0, 0, 0.22) 3px 5px 30px`, applied only to
product renders resting on a surface — never to cards, buttons or text.

Depth otherwise comes from surface-colour alternation and `backdrop-filter`
blur (sub-nav, sticky bar). No decorative gradients.

## Components

**Buttons**

- Primary pill — Action Blue, full capsule, 11px × 22px padding, 17px text
- Secondary pill — transparent, 1px Action Blue border
- Utility (dark) — ink background, 8px × 15px, small radius
- Icon circular — 44 × 44px, translucent grey chip, full radius
- Active state — `transform: scale(0.95)`, universal

**Utility cards** — white, 18px radius, 24px padding, 1px hairline border,
1:1 image crops.

**Navigation** — global nav 44px tall, pure black, 12px links. Sub-nav 52px,
parchment at 80% opacity with backdrop blur.

**Sticky bar** — parchment, 80% opacity + blur, 64px, floating above content.

## Responsive

| Width | Behaviour |
| --- | --- |
| ≤419px | Single column, hero 28px, tile padding 48px |
| 420–640px | Single column, hero 34px |
| 641–833px | Tiles compress, nav transitions |
| 834–1023px | Desktop nav; utility grids 3-col → 2-col |
| 1024–1440px | Full layout, content locks at 1440px |

Touch targets minimum 44 × 44px. Below 833px the nav collapses to a hamburger.

## Do

- Use Action Blue for all interactive elements — no second accent
- Set headlines with negative letter-spacing
- Run body at 17px / 400 / 1.47 — never 16px
- Alternate light and dark tiles; colour change is the divider
- Apply the single product shadow to renders only
- Use `scale(0.95)` for press states
- Keep the global nav pure black

## Don't

- No second accent colour
- No shadows on cards, buttons or text
- No decorative gradients
- No weight 500
- Don't round full-bleed tiles
- Don't tighten body line-height below 1.47
- Don't mix radius grammars
- Don't use dark-surface blue on light surfaces

## Undocumented

Form validation states, dark-mode variants and the exact backdrop-filter blur
radius are not specified in the source. Choose sensibly and stay consistent.
