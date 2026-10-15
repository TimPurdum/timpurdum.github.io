// Slide 11, fleet state: on the left (`baseline`) every report becomes its own map edit, so the
// pending counter climbs to the 20,000 safety stop while the map keeps draining; on the right
// (`latest`) a newer report replaces Truck 7's waiting one, so pending can't pass the fleet size.
//
// Beat 0 plays on open (both halves arrive, the queue still empty at 0). Beat 1 plays at "one edit
// per report", beat 2 at "the safety stop", beat 3 at "one report per truck", beat 4 at "state, not
// events". The scene animates the slide's own HTML, where the finished slide already shows the full
// queue, the banner, 20,000, Truck 7 on report 4188, and the rule.
//
// Truck 7's slot holds two cards. Report 4182 is shown until 4188 arrives, so beat 3 animates both
// and nothing else touches them. The two numbers are frame-spaced: the browser sees Truck 7 only in
// the frames the page reads, so consecutive report numbers would be wrong here.
(() => {
  const { animate, motion: { fadeUp, pop } } = window.deckScenes;

  const CAP = 20000;
  const CLIMB = 16000;      // where beat 1 leaves the counter
  const PILE_MS = 4500;     // beat 1 length
  const STOP_MS = 1800;     // beat 2 climb length
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

  // Writes the counter and the filled cells of the queue row for a pending count.
  const renderPending = (root, pending) => {
    const cells = [...root.querySelectorAll('[data-part="q-row"] i')];
    root.querySelector('[data-part="pending"]').textContent = Math.round(pending).toLocaleString("en-US");
    const filled = Math.round(pending / CAP * cells.length);
    cells.forEach((cell, index) => cell.classList.toggle("empty", index >= filled));
  };

  window.deckScenes.register("10-queue", {
    beats: [
      // Beat 0, on open: both halves arrive. The queue is empty and Pending reads 0, as it does
      // while the map is still starting up.
      root => ({ animations: [
        animate(root, "left", fadeUp, { duration: 450 }),
        animate(root, "right", fadeUp, { duration: 450, delay: 150 })
      ] }),
      // Beat 1, "one edit per report": reports stream in far faster than the one-at-a-time worker
      // drains them, and Pending climbs.
      root => {
        const stop = center(root, "stop");
        const worker = center(root, "worker");
        const arrive = Array.from({ length: ARRIVALS }, (_, index) => {
          const n = index + 1;
          const to = stop.x - center(root, `in-${n}`).x;
          return animate(root, `in-${n}`, [
            { opacity: 0, transform: "none" },
            { opacity: 1, transform: "none", offset: 0.12 },
            { opacity: 1, transform: `translateX(${to}px)`, offset: 0.85 },
            { opacity: 0, transform: `translateX(${to}px)` }
          ], { duration: 700, delay: 200 + index * 380, easing: "linear" });
        });
        const drain = Array.from({ length: DRAINS }, (_, index) => {
          const n = index + 1;
          const to = worker.x - center(root, `out-${n}`).x;
          return animate(root, `out-${n}`, [
            { opacity: 1, transform: "none" },
            { opacity: 1, transform: `translateX(${to}px)`, offset: 0.8 },
            { opacity: 0, transform: `translateX(${to}px)` }
          ], { duration: 900, delay: 500 + index * 1600, easing: "linear" });
        });
        return {
          animations: [...arrive, ...drain],
          tickers: [{ duration: PILE_MS, update: progress => renderPending(root, CLIMB * progress) }]
        };
      },
      // Beat 2, "safety stop": the counter reaches the cap, the line flashes, the banner appears,
      // and the note says intake halted while the map keeps draining.
      root => ({
        animations: [
          animate(root, "stop", [
            { borderLeftColor: "var(--red)" }, { borderLeftColor: "var(--ink)", offset: 0.4 }, { borderLeftColor: "var(--red)" }
          ], { duration: 900, delay: STOP_MS - 300, easing: "linear" }),
          animate(root, "banner", pop, { duration: 500, delay: STOP_MS }),
          animate(root, "behind", fadeUp, { duration: 400, delay: STOP_MS + 300 }),
          animate(root, "guard", fadeUp, { duration: 400, delay: STOP_MS + 300 })
        ],
        // A no-op at progress 0: beat 1's counter owns the start of this stretch, and the runner
        // rewinds every beat in order, so a write here would leave the counter at the wrong end.
        tickers: [{ duration: STOP_MS, update: progress => {
          if (progress === 0) return;
          renderPending(root, CLIMB + (CAP - CLIMB) * progress);
        } }]
      }),
      // Beat 3, "one slot": Truck 7's report 4188 arrives and replaces the waiting 4182. Linear
      // easing keeps 4182 on screen until 4188 has covered it.
      root => ({ animations: [
        animate(root, "new-7", [
          { opacity: 0, transform: "scale(.85)" }, { opacity: 1, transform: "none" }
        ], { duration: 700, delay: 200, easing: "linear" }),
        animate(root, "old-7", [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 700, easing: "linear" }),
        animate(root, "replace-note", fadeUp, { duration: 450, delay: 900 })
      ] }),
      // Beat 4, "state, not events": the rule appears under both halves, with the example line that
      // makes its second half concrete.
      root => ({ animations: [
        animate(root, "rule", pop, { duration: 600 }),
        animate(root, "rule-eg", fadeUp, { duration: 450, delay: 350 })
      ] })
    ]
  });
})();
