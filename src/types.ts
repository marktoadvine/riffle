import type { ReactNode } from 'react';

/**
 * Handles passed to `renderControls` so a consumer can build their own arrows,
 * dots, thumbnails, or anything else in place of the built-in controls.
 */
export interface CardStackControls {
  /** Index of the card currently at the front of the stack. */
  index: number;
  /** Total number of cards. */
  count: number;
  /** Move to the previous card. No-op at the start when `loop` is false. */
  prev: () => void;
  /** Move to the next card. No-op at the end when `loop` is false. */
  next: () => void;
  /** Bring an arbitrary card to the front. Out-of-range values are ignored. */
  goTo: (index: number) => void;
  /** Whether the deck is currently unstacked into a grid. */
  expanded: boolean;
  /** Toggle between the stacked and expanded layouts. */
  toggleExpanded: () => void;
  /** False at the first card when `loop` is false. */
  canPrev: boolean;
  /** False at the last card when `loop` is false. */
  canNext: boolean;
}

export interface CardStackProps {
  /**
   * Accessible name for the carousel, used as the container's `aria-label`.
   * Describe the set, for example "Retirement benefits".
   */
  label: string;
  /** One `CardStack.Card` per slide. */
  children: ReactNode;
  /**
   * How many cards behind the front one stay visible. Cards deeper than this
   * fade out and stop receiving pointer events.
   * @default 3
   */
  peek?: number;
  /**
   * Whether advancing past the last card wraps to the first, and vice versa.
   * @default true
   */
  loop?: boolean;
  /**
   * Whether to offer the toggle that unstacks the deck into a grid. The toggle
   * only appears when there are more than two cards.
   * @default true
   */
  expandable?: boolean;
  /** Front card index for controlled use. Pair with `onChange`. */
  index?: number;
  /** Front card index for uncontrolled use. @default 0 */
  defaultIndex?: number;
  /** Called with the new index whenever the front card changes. */
  onChange?: (index: number) => void;
  /** Replace the built-in prev/next arrows. */
  renderControls?: (controls: CardStackControls) => ReactNode;
  /** Appended to the root element's class list. */
  className?: string;
}

export interface CardProps {
  /**
   * Face color for this card, in every state: behind the stack, at the front
   * of it, and in the expanded grid. Any CSS color. Text on the card switches
   * to `--rf-ink-inverse` on its own when this is dark enough to need it.
   */
  accent?: string;
  /** Arbitrary card content. */
  children?: ReactNode;
  /** Appended to the card element's class list. */
  className?: string;
}
