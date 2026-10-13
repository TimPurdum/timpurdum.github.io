// Slide 10: reports arrive in a first-in, first-out queue far faster than the single map-edit worker
// drains it, the pending counter climbs toward the 20,000 safety stop, and when it hits the stop a red
// banner appears while telemetry keeps arriving behind it.
//
// Beat 0 plays on open (the pile-up, up to CLIMB). Beat 1 plays at "safety stop" (the last stretch to
// the cap, the banner, the arrows). The scene animates the slide's own HTML, where the finished
// slide already shows the full queue, the banner, and 20,000.
(() => {
  const { animate, motion: { fadeUp, pop } } = window.deckScenes;

  const CAP = 20000;
  const CLIMB = 16000;      // where beat 0 leaves the counter
  const PILE_MS = 4500;     // beat 0 length
  const STOP_MS = 1800;     // beat 1 climb length
  const ARRIVALS = 10;
  const DRAINS = 3;

  // Layout position relative to the lane, immune to transforms already running on its parts.
  const center = (root, part) => {
    const lane = root.querySelector('[data-part="lane"]');
    const element = root.querySelector(`[data-part="${part}"]`);
    let x = element.offsetWidth / 2, y = element.offsetHeight / 2;
    for (let node = element; node && node !== lane; node = node.offsetParent) { x += node.offsetLeft; y += node.offsetTop; }
    return { x, y };
  };

  window.deckScenes.register("10-queue", {
    beats: [
      // Beat 0, on open: reports stream in far faster than the worker drains one, and pending climbs.
      root => {
        const cells = [...root.querySelectorAll('[data-part="q-row"] i')];
        const pendingText = root.querySelector('[data-part="pending"]');
        const stop = center(root, "stop");
        const worker = center(root, "worker");
        const render = pending => {
          pendingText.textContent = Math.round(pending).toLocaleString("en-US");
          const filled = Math.round(pending / CAP * cells.length);
          cells.forEach((cell, index) => cell.classList.toggle("empty", index >= filled));
        };
        const arrive = Array.from({ length: ARRIVALS }, (_, index) => {
          const n = index + 1;
          const to = stop.x - center(root, `in-${n}`).x;
          return animate(root, `in-${n}`, [
            { opacity: 0, transform: "none" },
            { opacity: 1, transform: "none", offset: 0.12 },
            { opacity: 1, transform: `translateX(${to}px)`, offset: 0.85 },
            { opacity: 0, transform: `translateX(${to}px)` }
          ], { duration: 700, delay: 600 + index * 380, easing: "linear" });
        });
        const drain = Array.from({ length: DRAINS }, (_, index) => {
          const n = index + 1;
          const to = worker.x - center(root, `out-${n}`).x;
          return animate(root, `out-${n}`, [
            { opacity: 1, transform: "none" },
            { opacity: 1, transform: `translateX(${to}px)`, offset: 0.8 },
            { opacity: 0, transform: `translateX(${to}px)` }
          ], { duration: 900, delay: 900 + index * 1600 });
        });
        return {
          animations: [animate(root, "lane", fadeUp, { duration: 400 }), ...arrive, ...drain],
          tickers: [{ delay: 400, duration: PILE_MS, update: progress => render(CLIMB * progress) }]
        };
      },
      // Beat 1, "safety stop": the counter reaches the cap, the line flashes, the banner appears,
      // and the arrows show telemetry still arriving behind it.
      root => {
        const cells = [...root.querySelectorAll('[data-part="q-row"] i')];
        const pendingText = root.querySelector('[data-part="pending"]');
        // A no-op at progress 0: beat 0's counter owns the start of this stretch, and the runner
        // rewinds every beat in order, so a write here would leave the counter at the wrong end.
        const render = progress => {
          if (progress === 0) return;
          const pending = CLIMB + (CAP - CLIMB) * progress;
          pendingText.textContent = Math.round(pending).toLocaleString("en-US");
          const filled = Math.round(pending / CAP * cells.length);
          cells.forEach((cell, index) => cell.classList.toggle("empty", index >= filled));
        };
        return {
          animations: [
            animate(root, "stop", [
              { borderLeftColor: "var(--red)" }, { borderLeftColor: "var(--ink)", offset: 0.4 }, { borderLeftColor: "var(--red)" }
            ], { duration: 900, delay: STOP_MS - 300 }),
            animate(root, "banner", pop, { duration: 500, delay: STOP_MS }),
            animate(root, "behind", fadeUp, { duration: 400, delay: STOP_MS + 300 }),
            ...[1, 2, 3].map(n => animate(root, `arrow-${n}`, [
              { opacity: 0.2, transform: "translateX(16px)" }, { opacity: 1, transform: "none" }
            ], { duration: 500, delay: STOP_MS + 500 + n * 150, iterations: 3 }))
          ],
          tickers: [{ duration: STOP_MS, update: render }]
        };
      }
    ]
  });
})();
