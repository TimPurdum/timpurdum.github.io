// Slide 11: the stress arithmetic lands term by term, the result counts up to 5,000 records per
// second, and the ten fleet messages that carry them stamp in one at a time.
//
// This scene replaced the slide's `steps` build. The count is a `requestAnimationFrame` ticker, so it
// runs on the clock the video capture controls.
(() => {
  const { animate, motion: { fadeUp, pop } } = window.deckScenes;
  const RECORDS = 5000;

  window.deckScenes.register("11-workload", {
    beats: [
      // Beat 0, on open: 500 × 10.
      root => ({ animations: [
        animate(root, "vehicles", pop, { duration: 500 }),
        animate(root, "times", fadeUp, { duration: 300, delay: 250 }),
        animate(root, "reports", pop, { duration: 500, delay: 450 })
      ] }),
      // Beat 1: = 5,000, counted up.
      root => {
        const records = root.querySelector('[data-part="records"]');
        return {
          animations: [
            animate(root, "equals", fadeUp, { duration: 300 }),
            animate(root, "records", pop, { duration: 450, delay: 150 }),
            animate(root, "unit", fadeUp, { duration: 400, delay: 900 })
          ],
          tickers: [{
            delay: 150,
            duration: 1200,
            update: progress => { records.textContent = Math.round(RECORDS * (1 - (1 - progress) ** 3)).toLocaleString("en-US"); }
          }]
        };
      },
      // Beat 2: 10 fleet messages per second, one envelope each.
      root => ({ animations: [
        animate(root, "second", pop, { duration: 500 }),
        ...Array.from({ length: 10 }, (_, index) =>
          animate(root, `env-${index + 1}`, pop, { duration: 350, delay: 450 + index * 110 }))
      ] })
    ]
  });
})();
