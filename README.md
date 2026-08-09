# riffle

An accessible card stack carousel for React. A layered deck where the front card sits straight on and
the cards behind it lean so their colored edges show past the sides, the top, and the bottom.
Advance it by clicking, by the arrows, by keyboard, or by swipe, or unstack the whole deck into a
grid to read every card at once.

Brand agnostic by construction: every visual value is a CSS custom property, and there is not a
single brand color in the source.

[Live demo](https://marktoadvine.github.io/riffle/)

## Install

```sh
npm install riffle
```

React 18 or 19 is a peer dependency. There are no runtime dependencies.

```tsx
import { CardStack } from 'riffle';
import 'riffle/styles.css';
```

The stylesheet ships separately so bundlers can tree-shake it correctly. Import it once, anywhere in
your app.

### Or copy and paste

The component is three files with no imports from anywhere else in this repo. Copy `src/CardStack.tsx`,
`src/CardStack.css`, and `src/types.ts` into your project and you are done. `CardStack.tsx` imports
only `./types` and `./CardStack.css`, and the icons are inlined SVG rather than an icon font, so
nothing else needs to come with it.

## Usage

```tsx
<CardStack label="Retirement benefits" peek={3} loop expandable onChange={(i) => console.log(i)}>
  <CardStack.Card accent="#8AB4DC">
    <span className="rf-index">#1</span>
    <div>
      <h3 className="rf-title">Lifetime income</h3>
      <p className="rf-body">Turn your retirement savings into a lifetime income stream.</p>
    </div>
  </CardStack.Card>
  <CardStack.Card accent="#E9A567">
    <span className="rf-index">#2</span>
    <div>
      <h3 className="rf-title">Flexible timing</h3>
      <p className="rf-body">Start when it suits you, not when a calendar says so.</p>
    </div>
  </CardStack.Card>
</CardStack>
```

Controlled use is the same component with `index` supplied:

```tsx
const [index, setIndex] = useState(0);

<CardStack label="Retirement benefits" index={index} onChange={setIndex}>
  ...
</CardStack>;
```

## Card anatomy

`CardStack.Card` renders whatever children you give it and never inspects their shape, so any content
works. That said, these cards are large feature cards, and they read best with three things: a number
marker, a short title, and one or two sentences of body copy. Three optional utility classes are
included for exactly that, all sized in container query units so they scale with the card rather than
the viewport:

| Class       | Size token        | Role                                             |
| ----------- | ----------------- | ------------------------------------------------ |
| `.rf-index` | `--rf-index-size` | Large number marker, sits at the top of the card |
| `.rf-title` | `--rf-title-size` | Short title, above the body                      |
| `.rf-body`  | `--rf-body-size`  | One to two sentences, sits at the bottom         |

The card is a flex column with `space-between`, which is what pushes the marker to the top and the
text to the bottom. Skip the classes entirely if you want your own typography.

## Props

### `CardStack`

| Prop             | Type                      | Default  | Description                                                                                             |
| ---------------- | ------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `label`          | `string`                  | required | Accessible name for the carousel. Becomes the container's `aria-label`.                                 |
| `children`       | `ReactNode`               | required | One `CardStack.Card` per slide.                                                                         |
| `peek`           | `number`                  | `3`      | How many cards behind the front one stay visible. Deeper cards fade out and stop taking pointer events. |
| `loop`           | `boolean`                 | `true`   | Whether advancing past the last card wraps to the first. When false, the arrows disable at the ends.    |
| `expandable`     | `boolean`                 | `true`   | Whether to offer the unstack toggle. The toggle only appears when there are more than two cards.        |
| `index`          | `number`                  |          | Front card index for controlled use. Pair with `onChange`.                                              |
| `defaultIndex`   | `number`                  | `0`      | Front card index for uncontrolled use.                                                                  |
| `onChange`       | `(index: number) => void` |          | Called with the new index whenever the front card changes.                                              |
| `renderControls` | `(controls) => ReactNode` |          | Replaces the built-in arrows. Rendered in the action row beneath the stack.                             |
| `className`      | `string`                  |          | Appended to the root element's class list.                                                              |

`renderControls` receives `{ index, count, prev, next, goTo, expanded, toggleExpanded, canPrev, canNext }`.

### `CardStack.Card`

| Prop        | Type        | Default | Description                                                                                                              |
| ----------- | ----------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `accent`    | `string`    |         | Face color for this card, in every state: behind the stack, at the front of it, and in the expanded grid. Any CSS color. |
| `children`  | `ReactNode` |         | Arbitrary card content.                                                                                                  |
| `className` | `string`    |         | Appended to the card element's class list.                                                                               |

`accent` is written to the card as `--rf-accent`, which is what the stylesheet reads to paint the
face. A card with no `accent` falls back to `--rf-surface`, so an all-neutral deck is the default.
Card text follows the face automatically, so a dark accent is safe. See
[Accessibility](#accessibility).

## Custom properties

Every visual value in the component comes from this table. The defaults are declared on `:root`, so
you can override them from anywhere that reaches the component: on `:root`, on any ancestor, on the
`className` you pass, or inline. A rule that targets `.rf-root` directly ties with the library's own
selector, in which case stylesheet order decides, so prefer something more specific like
`.my-page .rf-root` if you go that route.

| Property                      | Default                                 | What it does                                 |
| ----------------------------- | --------------------------------------- | -------------------------------------------- |
| `--rf-paper`                  | `#fafaf9`                               | Background behind the deck                   |
| `--rf-surface`                | `#ffffff`                               | Face of a card that has no `accent`          |
| `--rf-ink`                    | `#18181b`                               | Text, arrow borders, arrow glyphs            |
| `--rf-ink-inverse`            | `#fafaf9`                               | Text on a card too dark for `--rf-ink`       |
| `--rf-muted`                  | `#71717a`                               | Expand toggle in its resting state           |
| `--rf-focus`                  | `#2563eb`                               | Focus ring color                             |
| `--rf-radius`                 | `44px`                                  | Card corner radius                           |
| `--rf-width`                  | `clamp(280px, 84vw, 440px)`             | Stack width while stacked                    |
| `--rf-aspect`                 | `1 / 1.04`                              | Card aspect ratio, in both layouts           |
| `--rf-card-padding`           | `8%`                                    | Card inner padding                           |
| `--rf-offset`                 | `10px`                                  | Vertical offset added per depth step         |
| `--rf-tilt`                   | `5deg`                                  | Lean of the two cards behind the front one   |
| `--rf-scale-step`             | `0`                                     | Scale removed per depth step                 |
| `--rf-duration`               | `460ms`                                 | Transform, shadow, and opacity transition    |
| `--rf-ease`                   | `cubic-bezier(0.34, 1.7, 0.5, 1)`       | Transform easing. Overshoots, then settles   |
| `--rf-ease-soft`              | `cubic-bezier(0.22, 1, 0.36, 1)`        | Easing for anything that must not overshoot  |
| `--rf-press-duration`         | `120ms`                                 | Press state and control transitions          |
| `--rf-hover-lift`             | `-6px`                                  | How far the front card rises on hover        |
| `--rf-hover-scale`            | `1.012`                                 | How much it grows on hover                   |
| `--rf-press-scale`            | `0.985`                                 | Scale while the stack is held down           |
| `--rf-fan-offset`             | `5px`                                   | Extra offset the back cards fan out on hover |
| `--rf-fan-tilt`               | `1deg`                                  | Extra lean they fan out on hover             |
| `--rf-shadow`                 | `0 10px 30px -14px rgb(24 24 27 / 30%)` | Card shadow at rest                          |
| `--rf-shadow-lift`            | `0 22px 46px -18px rgb(24 24 27 / 38%)` | Card shadow while lifted                     |
| `--rf-arrow-size`             | `24px`                                  | Diameter of the arrow buttons                |
| `--rf-arrow-gap`              | `20px`                                  | Gap between an arrow and the card edge       |
| `--rf-arrow-border`           | `1px`                                   | Arrow outline width                          |
| `--rf-arrow-disabled-opacity` | `0.32`                                  | Arrow opacity when `loop` is off at an end   |
| `--rf-arrow-row-gap`          | `24px`                                  | Space above the arrow row and the toggle     |
| `--rf-icon-size`              | `16px`                                  | Inlined glyph size inside the arrows         |
| `--rf-toggle-gap`             | `8px`                                   | Space between the toggle icon and its label  |
| `--rf-toggle-size`            | `14px`                                  | Toggle label size                            |
| `--rf-grid-gap`               | `16px`                                  | Gap between cards in the expanded grid       |
| `--rf-grid-min`               | `240px`                                 | Minimum column width in the expanded grid    |
| `--rf-font`                   | Inter, then a system stack              | Font family                                  |
| `--rf-index-size`             | `18cqw`                                 | `.rf-index` size                             |
| `--rf-title-size`             | `8.5cqw`                                | `.rf-title` size                             |
| `--rf-body-size`              | `6.5cqw`                                | `.rf-body` size                              |
| `--rf-focus-width`            | `2px`                                   | Focus ring width                             |
| `--rf-focus-offset`           | `3px`                                   | Focus ring offset                            |

Two notes. `--rf-icon-size` defaults to `16px` rather than matching `--rf-arrow-size`, because a 24px
glyph inside a 24px circle leaves the arrow no breathing room. And the 560px threshold where the
arrows drop below the stack is a literal in the stylesheet, not a token, because container queries
cannot read custom properties.

### Type

The font stack names Inter first and falls back to system fonts. To use Inter, install it and import
it yourself:

```sh
npm install @fontsource-variable/inter
```

```ts
import '@fontsource-variable/inter';
```

It is declared as an optional peer dependency, so nothing breaks if you skip it.

## Accessibility

The stacked state deliberately hides most of the content, which makes the accessibility work load
bearing rather than cosmetic.

- The container is `role="group"` with `aria-roledescription="carousel"` and an `aria-label` taken
  from `label`. Each card is `aria-roledescription="slide"` with an `aria-label` of the form
  "2 of 4".
- **Non-front cards are unreachable while stacked.** They carry both `inert` and `aria-hidden="true"`,
  so their contents are out of the tab order and out of the accessibility tree. A link on a buried
  card cannot be focused, which is the correct behavior: it is not visible, so it should not be
  reachable. Expanding removes both attributes from every card.
- **Position is announced, not drawn.** There are no dots, no counter, and no progress bar. A visually
  hidden `aria-live="polite"` region announces "Showing card 2 of 4" when the front card changes and
  "Showing all 4 cards" when the deck unstacks. This keeps the visual design clean without leaving
  screen reader users with no feedback at all.
- **Card text follows the card.** Because a card keeps its accent even at the front of the stack, a
  dark accent would otherwise leave unreadable text on the one card the reader is looking at. After
  each render the component measures every card's resolved background, and any face too dark for
  `--rf-ink` gets `data-rf-dark` and switches to `--rf-ink-inverse`. The background is read back out
  of the DOM rather than parsed off the prop, so it works for any color syntax, including named
  colors, `hsl()`, and `oklch()`. Cards with a mostly transparent face are left on `--rf-ink`, on
  the assumption that the paper behind them is showing through. Consumer CSS can still override the
  result, since the switch is an attribute rather than an inline style.
- **Why expand mode exists.** A stack is a fundamentally lossy way to present a set: to read card
  seven you have to advance past six others, and if you use a screen reader you have to do it without
  the visual cue that there is more behind. Unstacking into a grid makes every card live at once,
  in DOM order, with no motion required. It is the accessible path through the same content, not a
  decorative extra, which is why it is on by default.
- Keyboard on the container: ArrowLeft, ArrowRight, Home, End, and Escape to collapse the grid.
  Arrow keys stand down when focus is inside a link, button, or field on a card, so typing in a card
  never moves the stack.
- Clicking the stack advances it, unless the click came from an `a`, `button`, `input`, `select`,
  `textarea`, or `[role="button"]`. Links inside cards behave like links.
- The card element is not given `role="button"`. It is a region of content that happens to be
  clickable, and announcing it as a button would misrepresent it. The arrows and the toggle are real
  buttons and carry the interaction semantics.
- Focus stays on the expand toggle across the transition, so keyboard users do not lose their place.
- `:focus-visible` rings show on the arrows, the toggle, the container, and any focusable content
  inside a live card. Nothing in the component uses `overflow: hidden`, so a ring inside a card with
  a 44px corner radius is never clipped.
- Swipe uses pointer events with a 40px horizontal threshold and ignores gestures that travel further
  vertically than horizontally, so vertical page scrolling is untouched.
- Motion springs rather than glides: `--rf-ease` overshoots its target and settles back, so a card
  arriving at the front swings about 14% past its resting angle before coming to rest. Color,
  shadow, opacity, and the 120ms press use `--rf-ease-soft` instead, since an overshoot there
  reads as a wobble rather than a spring.
- Under `prefers-reduced-motion: reduce` the stack-to-grid transition is skipped, layouts swap
  instantly, and the hover lift is dropped.
- Printing always renders the expanded grid, so a printed page contains every card.

One thing left on your side: the automatic ink switch picks whichever of your two ink tokens reads
better, but it cannot invent contrast that neither provides. A mid-tone accent can still land short
of 4.5:1 against both. Check your accents against `--rf-ink` and `--rf-ink-inverse`, and adjust the
accent or the tokens if neither clears the bar.

## Browser support

Recent Chrome, Edge, Firefox, and Safari. The component depends on container queries, the `inert`
attribute, and `:focus-visible`, which puts the floor at roughly Chrome and Edge 111, Firefox 113,
and Safari 16.4.

## License

MIT
