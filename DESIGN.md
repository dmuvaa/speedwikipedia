# SpeedWikipedia design

## Direction

**Link race.** Wikipedia’s hyperlink is the game piece. The UI should feel like a stopwatch strapped to an encyclopedia — kinetic, clear, and readable under pressure.

Not a brochure. Not a dashboard. First job of every screen: make someone want to click a link and chase a target.

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Paper | `#F3F6F3` | `#0B120E` |
| Ink | `#14201A` | `#E8F0EB` |
| Muted | `#5A6B62` | `#9AAFA3` |
| Line | `#D2DDD6` | `#243028` |
| Card | `#FBFDFB` | `#121A15` |
| Accent (CTAs) | `#167A45` | `#5ECF8A` |
| Accent ink | `#F0FDF4` | `#062816` |
| Signal (win) | `#0F766E` | `#5EEAD4` |
| Soft | `#E4EFE8` | `#18241C` |

Forest green UI. In-article Wikipedia links stay authentic wiki blue (`#36c`) inside `.wiki-page` only.

## Type

- **UI / brand / scores:** system-ui (Apple-native feel, no novelty display face)
- **Reading / article titles:** Source Serif 4 — Wikipedia headings and editorial titles only

Tracking: slight tighten on large titles (`-0.02em`); body near `0`. No all-caps tracked eyebrows.

## Layout

- Home is one composition: brand, one race line, one CTA, then daily + challenges below.
- In-game: translucent HUD over scrolling article; target always visible; timer and clicks are the scoreboard.
- Results: score is the hero; path is a hop chain; share is secondary.

## Motion

- Press feedback on `pointerdown` (`scale` 0.97, ~100ms).
- Critically damped settles for HUD / panels (no bounce on enter).
- Wiki links flash a brief pulse on activate.
- Win: short score settle + path dots light in sequence.
- Honor `prefers-reduced-motion` and `prefers-reduced-transparency`.

## Signature

The **race line** — start and target connected by a dotted hop track — appears on home, in the HUD, and on the result path.

## Wikipedia reading surface

In-game articles mimic Vector 2022: white paper, serif title, sans body, `#36c` links, Article/Read tabs, gray infobox. The game HUD stays on the SpeedWikipedia system; only the article pane looks like Wikipedia.
