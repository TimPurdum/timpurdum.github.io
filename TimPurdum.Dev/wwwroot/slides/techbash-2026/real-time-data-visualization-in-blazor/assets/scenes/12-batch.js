// Slide 12: a loop of 500 one-feature calls fires one by one, collapses into a single 500-feature
// call whose bar is longer (the honest cost), splits into chunks of 200, 200 and 100, and a side
// panel crosses out the two roads we tried.
//
// The scene animates the slide's own HTML. The loop row is authored dim (it is the "before"), so
// beat 1 animates it from full brightness down to that authored state, and the two crossed-out roads
// are authored struck through, so beat 3 draws the strikes in.
(() => {
  const { animate, motion: { fadeUp, slideIn } } = window.deckScenes;
  const each = (root, selector, keyframes, options) => [...root.querySelectorAll(selector)].map((element, index) =>
    element.animate(keyframes, { fill: "both", easing: "cubic-bezier(.2,.7,.2,1)", ...options(index) }));
  const grow = [{ opacity: 0, transform: "scaleX(0)" }, { opacity: 1, transform: "none" }];

  window.deckScenes.register("12-batch", {
    beats: [
      // Beat 0, on open: the panel arrives and the 500 calls fire left to right, one at a time.
      root => {
        const calls = root.querySelector('[data-part="calls"]');
        return {
          animations: [
            animate(root, "batch", fadeUp, { duration: 400 }),
            animate(root, "ticks", [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
              { duration: 4000, delay: 400, easing: "linear" })
          ],
          tickers: [{ delay: 400, duration: 4000, update: progress => { calls.textContent = String(Math.round(progress * 500)); } }]
        };
      },
      // Beat 1, "One call": the loop dims and one fat call takes its place, with the heavier tail.
      root => ({ animations: [
        animate(root, "row-many", [{ opacity: 1 }], { duration: 500 }),
        animate(root, "row-one", fadeUp, { duration: 400, delay: 200 }),
        animate(root, "one", grow, { duration: 600, delay: 300 }),
        animate(root, "heavy", grow, { duration: 700, delay: 1000 }),
        animate(root, "honest", fadeUp, { duration: 450, delay: 1500 })
      ] }),
      // Beat 2, "chunks": the one call splits into 200, 200 and 100 features.
      root => ({ animations: [
        animate(root, "row-chunk", fadeUp, { duration: 400 }),
        ...each(root, '[data-part="row-chunk"] i', [{ opacity: 0, transform: "translateX(-6cqw)" }, { opacity: 1, transform: "none" }],
          index => ({ duration: 500, delay: 300 + index * 250 }))
      ] }),
      // Beat 3, "Roads we tried": the side panel slides in and each road is crossed out.
      root => {
        const strike = [{ textDecorationLine: "none" }, { textDecorationLine: "line-through" }];
        return { animations: [
          animate(root, "roads", slideIn, { duration: 500 }),
          animate(root, "strike-graphics", strike, { duration: 400, delay: 900 }),
          animate(root, "strike-setsource", strike, { duration: 400, delay: 1500 })
        ] };
      }
    ]
  });
})();
