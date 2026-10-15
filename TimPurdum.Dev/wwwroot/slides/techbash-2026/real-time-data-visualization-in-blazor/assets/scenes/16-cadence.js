// Slide 13: the one page timer changes from ten ticks per second to four, and a playhead sweeps
// each track at one second per sweep, so the ticks it passes are the ticks per second. The chart
// history track has one tick a second.
//
// The old ten-per-second overlay and the playheads exist only for the motion; the finished slide
// hides them. Each track is one second wide, so a 1,000 ms sweep crosses exactly one second of ticks.
(() => {
  const { animate, motion: { fadeUp } } = window.deckScenes;

  const sweep = (root, part, options) => {
    const width = root.querySelector(`[data-part="${part}"]`).parentElement.getBoundingClientRect().width;
    return animate(root, part, [
      { opacity: 1, transform: "translateX(0)" },
      { opacity: 1, transform: `translateX(${width}px)`, offset: 0.97 },
      { opacity: 0, transform: `translateX(${width}px)` }
    ], { duration: 1000, easing: "linear", ...options });
  };

  window.deckScenes.register("16-cadence", {
    beats: [
      // Beat 0, on open: the page timer row, still on its old ten-per-second interval, the chart
      // history row, and the list of what each tick does.
      root => ({ animations: ["row-map", "row-chart", "ticklist"].map((part, index) =>
        animate(root, part, fadeUp, { duration: 400, delay: index * 150 })) }),
      // Beat 1, "250 ms": four ticks instead of ten, the playheads sweep, and the calls and edit-time line arrives.
      root => ({ animations: [
        animate(root, "map-old", [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }),
        sweep(root, "head-map", { delay: 400, iterations: 2 }),
        sweep(root, "head-chart", { delay: 400 }),
        animate(root, "closing", fadeUp, { duration: 450, delay: 1200 })
      ] })
    ]
  });
})();
