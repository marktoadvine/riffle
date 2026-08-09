import { useState, type CSSProperties } from 'react';
import { CardStack } from 'riffle';

const vars = (style: Record<string, string | number>) => style as CSSProperties;

/* ------------------------------------------------------------------ data */

const neutral = [
  {
    index: '#1',
    title: 'Front and center',
    body: 'The card in focus sits straight on. The rest wait behind it.',
    accent: '#E7E5E4',
  },
  {
    index: '#2',
    title: 'One at a time',
    body: 'Click the stack, swipe it, or use the arrows to bring the next card forward.',
    accent: '#D6D3D1',
  },
  {
    index: '#3',
    title: 'Nothing buried',
    body: 'Unstack the deck and every card is readable at once.',
    accent: '#C2BFBC',
  },
  {
    index: '#4',
    title: 'Yours to theme',
    body: 'Every value is a custom property, so the deck takes your colors.',
    accent: '#A8A29E',
  },
];

const themed = [
  {
    index: '#1',
    title: 'Set an accent',
    body: 'Each card carries one color, shown whenever it is not the front card.',
    accent: '#8AB4DC',
  },
  {
    index: '#2',
    title: 'Edges do the work',
    body: 'Two cards lean opposite ways so their color shows at the sides.',
    accent: '#E9A567',
  },
  {
    index: '#3',
    title: 'Depth, not decoration',
    body: 'The card behind those two sits square and shows along the bottom.',
    accent: '#8FB8A0',
  },
  {
    index: '#4',
    title: 'Still neutral inside',
    body: 'The front face stays on the surface token, whichever card is showing.',
    accent: '#C89BB0',
  },
];

const many = [
  {
    index: '#1',
    title: 'Eight cards',
    body: 'More than a stack can usefully show.',
    accent: '#8AB4DC',
  },
  {
    index: '#2',
    title: 'Three deep',
    body: 'Peek keeps only three behind the front one.',
    accent: '#E9A567',
  },
  {
    index: '#3',
    title: 'The rest wait',
    body: 'Deeper cards fade out and stop taking clicks.',
    accent: '#8FB8A0',
  },
  {
    index: '#4',
    title: 'Still in the DOM',
    body: 'Nothing is unmounted, so nothing restarts.',
    accent: '#C89BB0',
  },
  {
    index: '#5',
    title: 'Unstack it',
    body: 'The grid is the only way to see all eight.',
    accent: '#B7A8D0',
  },
  {
    index: '#6',
    title: 'Pick one',
    body: 'Click a card in the grid to make it the front card.',
    accent: '#E3C88A',
  },
  {
    index: '#7',
    title: 'Or press Escape',
    body: 'That collapses without changing the position.',
    accent: '#8FBCC0',
  },
  {
    index: '#8',
    title: 'Print it',
    body: 'Printed pages always render the full grid.',
    accent: '#D69C9C',
  },
];

/* ------------------------------------------------------------------- app */

export function App() {
  const [peek, setPeek] = useState(3);
  const [loop, setLoop] = useState(true);
  const [expandable, setExpandable] = useState(true);
  const [aspect, setAspect] = useState(1.04);
  const [radius, setRadius] = useState(44);

  return (
    <main className="page">
      <section className="section">
        <div
          className="tokens"
          style={vars({ '--rf-aspect': `1 / ${aspect}`, '--rf-radius': `${radius}px` })}
        >
          <CardStack label="Neutral card stack" peek={peek} loop={loop} expandable={expandable}>
            {neutral.map((card) => (
              <CardStack.Card key={card.index} accent={card.accent}>
                <span className="rf-index">{card.index}</span>
                <div>
                  <h2 className="rf-title">{card.title}</h2>
                  <p className="rf-body">{card.body}</p>
                </div>
              </CardStack.Card>
            ))}
          </CardStack>
        </div>

        <div className="panel">
          <label className="control">
            <span>peek</span>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={peek}
              onChange={(event) => setPeek(Number(event.target.value))}
            />
            <output>{peek}</output>
          </label>

          <label className="control control--check">
            <input
              type="checkbox"
              checked={loop}
              onChange={(event) => setLoop(event.target.checked)}
            />
            <span>loop</span>
          </label>

          <label className="control control--check">
            <input
              type="checkbox"
              checked={expandable}
              onChange={(event) => setExpandable(event.target.checked)}
            />
            <span>expandable</span>
          </label>

          <label className="control">
            <span>--rf-aspect</span>
            <input
              type="range"
              min={0.7}
              max={1.5}
              step={0.02}
              value={aspect}
              onChange={(event) => setAspect(Number(event.target.value))}
            />
            <output>1 / {aspect.toFixed(2)}</output>
          </label>

          <label className="control">
            <span>--rf-radius</span>
            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
            <output>{radius}px</output>
          </label>
        </div>
      </section>

      <section className="section">
        <CardStack label="Themed card stack">
          {themed.map((card) => (
            <CardStack.Card key={card.index} accent={card.accent}>
              <span className="rf-index">{card.index}</span>
              <div>
                <h2 className="rf-title">{card.title}</h2>
                <p className="rf-body">{card.body}</p>
              </div>
            </CardStack.Card>
          ))}
        </CardStack>
      </section>

      <section className="section">
        <CardStack label="Card stack with links">
          <CardStack.Card accent="#8AB4DC">
            <span className="rf-index">#1</span>
            <div>
              <h2 className="rf-title">Links stay links</h2>
              <p className="rf-body">
                Clicking <a href="https://github.com/marktoadvine/riffle">this link</a> follows it
                and leaves the stack where it is.
              </p>
            </div>
          </CardStack.Card>
          <CardStack.Card accent="#E9A567">
            <span className="rf-index">#2</span>
            <div>
              <h2 className="rf-title">Tab reaches one card</h2>
              <p className="rf-body">
                Only the front card is focusable, so <a href="#tab-target">this link</a> is
                unreachable until its card is in front.
              </p>
            </div>
          </CardStack.Card>
          <CardStack.Card accent="#8FB8A0">
            <span className="rf-index">#3</span>
            <div>
              <h2 className="rf-title">Every card, live</h2>
              <p className="rf-body">
                Unstack the deck and <a href="#tab-target">all three links</a> join the tab order.
              </p>
            </div>
          </CardStack.Card>
        </CardStack>
      </section>

      <section className="section">
        <CardStack label="Eight card stack">
          {many.map((card) => (
            <CardStack.Card key={card.index} accent={card.accent}>
              <span className="rf-index">{card.index}</span>
              <div>
                <h2 className="rf-title">{card.title}</h2>
                <p className="rf-body">{card.body}</p>
              </div>
            </CardStack.Card>
          ))}
        </CardStack>
      </section>
    </main>
  );
}
