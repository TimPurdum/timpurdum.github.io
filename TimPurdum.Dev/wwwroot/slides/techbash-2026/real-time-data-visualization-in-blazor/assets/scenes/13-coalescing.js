// Slide 13: three reports for vehicle 7 arrive between two display updates, the next update draws
// only the newest, and the two superseded reports are counted as replacements.
//
// Beats follow the narration: 1 at "Report 4186 says 62", 2 at "The next time we draw",
// 3 at "Reports 4186 and 4187 were superseded", 4 at "And I count the replacements".
(() => {
  const truck = x => `<g transform="translate(${x},22)" style="fill:var(--teal)"><path d="M0 4h24v18H0z M24 10h9l6 7v5H24z"/><circle cx="7" cy="24" r="4"/><circle cx="31" cy="24" r="4"/></g>`;
  const chip = (x, report, speed, newest) => `
    <g transform="translate(${x},96)">
      <g data-part="chip-${report}">
        <line x1="125" y1="84" x2="125" y2="154" style="stroke:var(--line);stroke-width:3"/>
        <g data-part="chip-${report}-body"${newest ? "" : ' opacity="0.42"'}>
          <rect width="250" height="84" rx="14" style="fill:var(--paper);stroke:var(--line);stroke-width:2"/>
          ${truck(16)}
          <text x="70" y="36" style="fill:var(--muted);font:500 22px var(--font-mono)">report ${report}</text>
          <text x="70" y="66" style="fill:var(--text);font:700 26px var(--font-body)">${speed} km/h</text>
        </g>
        ${newest
          ? '<rect data-part="chip-4188-glow" x="-4" y="-4" width="258" height="92" rx="17" style="fill:none;stroke:var(--teal);stroke-width:4"/>'
          : '<line data-part="strike-' + report + '" x1="10" y1="42" x2="240" y2="42" stroke-dasharray="230" style="stroke:var(--muted);stroke-width:3"/>'}
      </g>
    </g>`;

  const markup = `
<svg viewBox="0 0 1600 440" role="presentation" style="display:block;width:100%;height:auto;overflow:visible">
  <line data-part="axis" x1="60" y1="250" x2="1540" y2="250" stroke-dasharray="1480" style="stroke:var(--line);stroke-width:4"/>
  <g data-part="tick-last">
    <line x1="120" y1="200" x2="120" y2="300" style="stroke:var(--muted);stroke-width:6"/>
    <text x="120" y="340" text-anchor="middle" style="fill:var(--muted);font:500 24px var(--font-mono)">display update</text>
  </g>
  <g data-part="tick-next">
    <line x1="1180" y1="200" x2="1180" y2="300" style="stroke:var(--teal);stroke-width:6"/>
    <circle data-part="tick-flash" cx="1180" cy="250" r="34" opacity="0" style="fill:none;stroke:var(--teal);stroke-width:4"/>
    <text x="1180" y="340" text-anchor="middle" style="fill:var(--text);font:500 24px var(--font-mono)">next display update</text>
  </g>
  ${chip(280, 4186, 62, false)}
  ${chip(560, 4187, 64, false)}
  ${chip(840, 4188, 65, true)}
  <path data-part="link" d="M1090 138 C1150 138 1190 110 1250 110" stroke-dasharray="170" style="fill:none;stroke:var(--teal);stroke-width:3"/>
  <g data-part="display">
    <rect x="1250" y="40" width="300" height="170" rx="16" style="fill:var(--fog);stroke:var(--line);stroke-width:2"/>
    <text x="1270" y="74" style="fill:var(--muted);font:500 20px var(--font-mono)">display</text>
    <circle data-part="marker" cx="1470" cy="118" r="14" style="fill:var(--teal);stroke:#fff;stroke-width:3"/>
    <text data-part="label-old" x="1270" y="186" opacity="0" style="fill:var(--muted);font:500 22px var(--font-mono)">previous position</text>
    <text data-part="label-new" x="1270" y="186" style="fill:var(--teal);font:700 22px var(--font-mono)">position from 4188</text>
  </g>
  <g data-part="counter">
    <text x="60" y="420" style="fill:var(--text);font:500 26px var(--font-mono)">replacements counted: <tspan data-part="count" style="fill:var(--teal);font-weight:700">2</tspan></text>
  </g>
</svg>`;

  const { animate, motion: { fadeUp, drop, draw } } = window.deckScenes;

  window.deckScenes.register("13-coalescing", {
    markup,
    beats: [
      // Beat 0, on open: the timeline draws, the two display updates and the display arrive.
      root => ({ animations: [
        animate(root, "axis", draw(1480), { duration: 700 }),
        animate(root, "tick-last", fadeUp, { duration: 400, delay: 300 }),
        animate(root, "tick-next", fadeUp, { duration: 400, delay: 450 }),
        animate(root, "display", fadeUp, { duration: 400, delay: 600 })
      ] }),
      // Beat 1: the three reports drop in, one per spoken sentence.
      root => ({ animations: [
        animate(root, "chip-4186", drop, { duration: 450 }),
        animate(root, "chip-4187", drop, { duration: 450, delay: 1440 }),
        animate(root, "chip-4188", drop, { duration: 450, delay: 2840 })
      ] }),
      // Beat 2: the next display update fires and takes 4188.
      root => ({ animations: [
        animate(root, "chip-4188-glow", [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }),
        animate(root, "tick-flash", [{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, offset: 0.4 }, { opacity: 0, transform: "scale(1.4)" }],
          { duration: 600, easing: "ease-out" }),
        animate(root, "link", draw(170), { duration: 500, delay: 150 }),
        animate(root, "marker", [{ transform: "translateX(-150px)" }, { transform: "none" }], { duration: 600, delay: 450 }),
        animate(root, "label-old", [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 450 }),
        animate(root, "label-new", [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 700 })
      ] }),
      // Beat 3: 4186 and 4187 dim and are struck through as superseded.
      root => ({ animations: [
        animate(root, "chip-4186-body", [{ opacity: 1 }, { opacity: 0.42 }], { duration: 500 }),
        animate(root, "chip-4187-body", [{ opacity: 1 }, { opacity: 0.42 }], { duration: 500 }),
        animate(root, "strike-4186", draw(230), { duration: 400, delay: 150 }),
        animate(root, "strike-4187", draw(230), { duration: 400, delay: 300 })
      ] }),
      // Beat 4: the replacement count appears and counts up to 2.
      root => {
        const count = root.querySelector('[data-part="count"]');
        return {
          animations: [animate(root, "counter", fadeUp, { duration: 300 })],
          tickers: [{ delay: 200, duration: 700, update: progress => { count.textContent = String(Math.round(progress * 2)); } }]
        };
      }
    ]
  });
})();
