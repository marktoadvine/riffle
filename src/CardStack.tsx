'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { CardProps, CardStackControls, CardStackProps } from './types';
import './CardStack.css';

/*
 * A click that starts on one of these should do whatever that element does,
 * not advance the stack.
 */
const INTERACTIVE = 'a, button, input, select, textarea, [role="button"]';

/** Horizontal travel, in px, that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 40;

/**
 * Direction each depth leans. Depth 0 faces straight on, the next two lean
 * opposite ways so their edges show at the sides, and everything deeper sits
 * square behind the deck showing only along the bottom.
 */
const TILT_SIGN = [0, -1, 1, 0];

/** useLayoutEffect that does not warn when rendered on a server. */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vars = (style: Record<string, string | number>) => style as CSSProperties;

/**
 * Below this relative luminance a face is dark enough that light text reads
 * better than dark. It is the standard crossover point between black and
 * white text.
 */
const DARK_FACE = 0.18;

/**
 * WCAG relative luminance of a browser-resolved color. Input comes from
 * getComputedStyle, so it is always `rgb(r, g, b)` or `rgba(r, g, b, a)`
 * whatever syntax the consumer wrote. Returns null when the color is too
 * transparent to judge, since then it is the page showing through, not the
 * card.
 */
const faceLuminance = (color: string): number | null => {
  const parts = color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  const [r, g, b, alpha = 1] = parts.map(Number) as [number, number, number, number?];
  if (alpha < 0.5) return null;

  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ icons */

/*
 * Material Symbols glyphs, inlined so the component needs no icon font and
 * stays a single copy-pasteable file. They inherit color through
 * fill: currentColor and size through --rf-icon-size.
 */

const ArrowBackIcon = () => (
  <svg className="rf-icon" viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
  </svg>
);

const ArrowForwardIcon = () => (
  <svg className="rf-icon" viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
    <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
  </svg>
);

const GridViewIcon = () => (
  <svg className="rf-icon" viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
    <path d="M120-840h320v320H120v-320Zm400 0h320v320H520v-320ZM120-440h320v320H120v-320Zm400 0h320v320H520v-320Z" />
  </svg>
);

const LayersIcon = () => (
  <svg className="rf-icon" viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
    <path d="M480-360 160-608l320-248 320 248-320 248Zm0 200L160-408l84-65 236 183 236-183 84 65-320 248Z" />
  </svg>
);

/* ------------------------------------------------------------------- card */

/**
 * One slide. `CardStack` reads these props and renders the card element
 * itself, which is what lets it manage `inert`, refs, and depth per card.
 */
function Card({ children }: CardProps): ReactNode {
  return children;
}
Card.displayName = 'CardStack.Card';

/* -------------------------------------------------------------- cardstack */

function CardStackRoot({
  label,
  children,
  peek = 3,
  loop = true,
  expandable = true,
  index,
  defaultIndex = 0,
  onChange,
  renderControls,
  className,
}: CardStackProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<CardProps>[];
  const count = items.length;

  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const isControlled = index !== undefined;
  const rawIndex = isControlled ? index : uncontrolledIndex;
  const topIndex = count > 0 ? ((rawIndex % count) + count) % count : 0;

  const stackId = useId();
  const stackRef = useRef<HTMLDivElement>(null);
  const firstRects = useRef<DOMRect[] | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const showToggle = expandable && count > 2;

  /*
   * Card elements are read back out of the DOM rather than collected through
   * per-card refs. Nothing here ever reorders or unmounts a card, so document
   * order always matches child order.
   */
  const readCards = useCallback(
    () => Array.from(stackRef.current?.querySelectorAll<HTMLDivElement>('[data-rf-card]') ?? []),
    [],
  );

  /* --------------------------------------------------------- index moves */

  const applyIndex = useCallback(
    (next: number) => {
      if (count === 0) return 0;
      const wrapped = ((next % count) + count) % count;
      if (!isControlled) setUncontrolledIndex(wrapped);
      if (wrapped !== topIndex) onChange?.(wrapped);
      return wrapped;
    },
    [count, isControlled, onChange, topIndex],
  );

  const announceIndex = useCallback(
    (at: number) => setMessage(`Showing card ${at + 1} of ${count}`),
    [count],
  );

  const goTo = useCallback(
    (next: number) => announceIndex(applyIndex(next)),
    [announceIndex, applyIndex],
  );

  const canPrev = loop || topIndex > 0;
  const canNext = loop || topIndex < count - 1;

  const next = useCallback(() => {
    if (count === 0 || !canNext) return;
    goTo(topIndex + 1);
  }, [canNext, count, goTo, topIndex]);

  const prev = useCallback(() => {
    if (count === 0 || !canPrev) return;
    goTo(topIndex - 1);
  }, [canPrev, count, goTo, topIndex]);

  /* ---------------------------------------------------------- expansion */

  /**
   * Records where every card is right now, so the layout effect below can
   * invert the jump the browser is about to make. Skipped entirely when the
   * user asked for reduced motion.
   */
  const captureFirstRects = useCallback(() => {
    if (prefersReducedMotion()) {
      firstRects.current = null;
      return;
    }
    firstRects.current = readCards().map((el) => el.getBoundingClientRect());
  }, [readCards]);

  const expand = useCallback(() => {
    captureFirstRects();
    setExpanded(true);
    setMessage(`Showing all ${count} cards`);
  }, [captureFirstRects, count]);

  const collapse = useCallback(
    (to?: number) => {
      captureFirstRects();
      setExpanded(false);
      announceIndex(to === undefined ? topIndex : applyIndex(to));
    },
    [announceIndex, applyIndex, captureFirstRects, topIndex],
  );

  const toggleExpanded = useCallback(() => {
    if (expanded) collapse();
    else expand();
  }, [collapse, expand, expanded]);

  /*
   * FLIP. The first rects were taken before the state change; here the cards
   * are measured in their new layout with transforms neutralised, then given
   * the transform that puts them back where they were. Clearing that inline
   * transform on the next frame lets the stylesheet's own transition carry
   * them to their real position, tilt and all.
   */
  useIsoLayoutEffect(() => {
    const first = firstRects.current;
    firstRects.current = null;
    if (!first) return;

    const els = readCards();

    for (const el of els) {
      el.style.transition = 'none';
      el.style.transform = 'none';
      el.style.willChange = 'transform';
    }

    const inverted = els.map((el, i) => {
      const from = first[i];
      if (!from || from.width === 0) return null;
      const to = el.getBoundingClientRect();
      if (to.width === 0 || to.height === 0) return null;

      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const sx = from.width / to.width;
      const sy = from.height / to.height;

      const still =
        Math.abs(dx) < 0.5 &&
        Math.abs(dy) < 0.5 &&
        Math.abs(sx - 1) < 0.005 &&
        Math.abs(sy - 1) < 0.005;
      if (still) return null;

      return `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    });

    els.forEach((el, i) => {
      el.style.transform = inverted[i] ?? '';
      // Flush the inverted transform so it becomes the transition's start value.
      el.getBoundingClientRect();
    });

    const frame = requestAnimationFrame(() => {
      for (const el of els) {
        el.style.transition = '';
        el.style.transform = '';
      }
    });

    const settle = window.setTimeout(() => {
      for (const el of els) {
        el.style.willChange = '';
      }
    }, 900);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [expanded, readCards]);

  /*
   * `inert` is set imperatively rather than as a JSX prop because React 18
   * wants inert="" and React 19 wants inert={true}. Touching the attribute
   * directly is correct on both.
   */
  useIsoLayoutEffect(() => {
    readCards().forEach((el, i) => {
      el.toggleAttribute('inert', !expanded && i !== topIndex);
    });
  }, [count, expanded, readCards, topIndex]);

  /*
   * Card text follows the card. An accent dark enough to swallow --rf-ink gets
   * --rf-ink-inverse instead. The face is read back from the DOM rather than
   * parsed off the `accent` prop, which is what makes this work for every
   * color syntax rather than just hex.
   */
  const accentKey = items.map((item) => item.props.accent ?? '').join('|');
  useIsoLayoutEffect(() => {
    for (const el of readCards()) {
      const luminance = faceLuminance(getComputedStyle(el).backgroundColor);
      el.toggleAttribute('data-rf-dark', luminance !== null && luminance < DARK_FACE);
    }
  }, [accentKey, readCards]);

  /* ------------------------------------------------------------- input */

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const target = event.target as Element | null;
      if (target?.closest(INTERACTIVE)) return;

      // A swipe ends with a synthetic click. Do not advance twice.
      if (swiped.current) {
        swiped.current = false;
        return;
      }

      if (!expanded) {
        next();
        return;
      }

      const card = target?.closest<HTMLElement>('[data-rf-card]');
      if (!card?.dataset.rfIndex) return;
      collapse(Number(card.dataset.rfIndex));
    },
    [collapse, expanded, next],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        if (expanded) collapse();
        return;
      }

      const target = event.target as Element | null;
      if (target && target !== event.currentTarget && target.closest(INTERACTIVE)) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          next();
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(count - 1);
          break;
        default:
          break;
      }
    },
    [collapse, count, expanded, goTo, next, prev],
  );

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start || expanded) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;

      // Vertical intent belongs to the page, not to the stack.
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;

      swiped.current = true;
      if (dx < 0) next();
      else prev();
    },
    [expanded, next, prev],
  );

  const handlePointerCancel = useCallback(() => {
    pointerStart.current = null;
  }, []);

  /* ------------------------------------------------------------- render */

  const controls: CardStackControls = {
    index: topIndex,
    count,
    prev,
    next,
    goTo,
    expanded,
    toggleExpanded,
    canPrev,
    canNext,
  };

  const builtInArrows = !renderControls && !expanded && count > 1;

  return (
    <div
      className={cx('rf-root', className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      data-expanded={expanded || undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="rf-viewport">
        {builtInArrows && (
          <button
            type="button"
            className="rf-arrow"
            data-direction="prev"
            aria-label="Previous card"
            aria-controls={stackId}
            disabled={!canPrev}
            onClick={prev}
          >
            <ArrowBackIcon />
          </button>
        )}

        <div
          ref={stackRef}
          id={stackId}
          className="rf-stack"
          data-expanded={expanded || undefined}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {items.map((item, i) => {
            const isCard = item.type === Card;
            const props: CardProps = isCard ? item.props : {};
            const depth = (i - topIndex + count) % count;
            const isFront = depth === 0;

            return (
              <div
                key={item.key ?? i}
                className={cx('rf-card', props.className)}
                data-rf-card=""
                data-rf-index={i}
                data-depth={depth}
                data-front={isFront || undefined}
                data-hidden={(!expanded && depth > peek) || undefined}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!expanded && !isFront ? true : undefined}
                style={vars({
                  '--rf-depth': depth,
                  '--rf-tilt-sign': TILT_SIGN[Math.min(depth, TILT_SIGN.length - 1)] ?? 0,
                  ...(props.accent ? { '--rf-accent': props.accent } : null),
                  zIndex: count - depth,
                })}
              >
                {isCard ? props.children : item}
              </div>
            );
          })}
        </div>

        {builtInArrows && (
          <button
            type="button"
            className="rf-arrow"
            data-direction="next"
            aria-label="Next card"
            aria-controls={stackId}
            disabled={!canNext}
            onClick={next}
          >
            <ArrowForwardIcon />
          </button>
        )}
      </div>

      {(renderControls || showToggle) && (
        <div className="rf-actions">
          {/*
           * renderControls is a render prop, so its callbacks have to be handed
           * over during render. They only ever run later, from event handlers,
           * which is where the refs behind them are actually read.
           */}
          {/* eslint-disable-next-line react-hooks/refs */}
          {renderControls?.(controls)}
          {showToggle && (
            <button
              type="button"
              className="rf-toggle"
              aria-expanded={expanded}
              aria-controls={stackId}
              onClick={toggleExpanded}
            >
              {expanded ? <LayersIcon /> : <GridViewIcon />}
              <span>{expanded ? 'Show as stack' : 'Show all cards'}</span>
            </button>
          )}
        </div>
      )}

      <div className="rf-live" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </div>
  );
}

CardStackRoot.displayName = 'CardStack';

export const CardStack = Object.assign(CardStackRoot, { Card });
