/*
 * TypeScript raises TS2882 on a side-effect import it cannot resolve to a
 * declaration, so `import '@marktoadvine/riffle/styles.css'` needs something to
 * point at. The stylesheet exports nothing; this exists only to give the
 * compiler a module to find. Wired up through the "types" condition on the
 * "./styles.css" entry in package.json.
 */
export {};
