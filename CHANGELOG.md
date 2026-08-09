# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-09

First release.

### Added

- `CardStack` and `CardStack.Card`, a compound card stack carousel with no runtime dependencies.
- Depth-driven stacking. Cards are never reordered or unmounted, so looping works in both directions
  and a transition never restarts mid-flight. Each card keeps its own accent in every state, at the
  front of the stack as much as behind it.
- Automatic text contrast. Each card's resolved background is measured after render, and a face too
  dark for `--rf-ink` switches to `--rf-ink-inverse` through a `data-rf-dark` attribute.
- Advance by clicking the stack, by the prev and next arrows, by ArrowLeft, ArrowRight, Home, and
  End, or by horizontal swipe. Clicks that originate on an interactive descendant are left alone.
- Expand mode: unstack the deck into a responsive grid, animated with FLIP and no animation library.
  Clicking a card in the grid collapses back onto it, and Escape collapses in place.
- Accessibility: `role="group"` with `aria-roledescription="carousel"`, per-card slide labels,
  `inert` plus `aria-hidden` on non-front cards while stacked, and a visually hidden live region
  announcing position and expand state in place of dots or a counter.
- Controlled (`index` and `onChange`) and uncontrolled (`defaultIndex`) use, plus a `renderControls`
  escape hatch.
- A complete `--rf-` custom property system covering color, shape, stacking, motion, elevation,
  controls, grid, and type, declared on `:root` so overrides from a wrapper or from `:root` itself
  reach the component. No brand colors in the source.
- Optional `.rf-index`, `.rf-title`, and `.rf-body` utilities sized in container query units.
- `prefers-reduced-motion` support and an `@media print` rule that always renders the full grid.
- Demo site and a GitHub Actions workflow that deploys it to GitHub Pages.

[0.1.0]: https://github.com/marktoadvine/riffle/releases/tag/v0.1.0
