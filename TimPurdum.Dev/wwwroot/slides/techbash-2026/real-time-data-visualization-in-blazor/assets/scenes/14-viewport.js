// Slide 15: full frames carry the whole fleet into the browser, a view rectangle zooms in to a small
// part of it, dots outside drop to a once-a-second blink, Truck 007 drives out of the rectangle and
// stays bright, and a result card says fewer than 40% of the trucks per frame cut edit time to 27.5 ms.
//
// The scene animates the slide's own HTML. The default view holds the whole fleet, so the rectangle
// starts as the full map and shrinks to its authored size. The counters come from the published,
// interpreted .NET run in demo/measurements/results.json (2026-10-14), the stress preset, 3 runs: the
// region view reads 500 trucks per frame and 1,827 records a second (the `viewport-region` row);
// zoomed in on Truck 7 it reads 191 per frame and 705 records a second (`viewport-zoomed`).
//
// A property is animated in only one beat (a later animation wins on the same property): beat 0
// fades the fleet group, beat 2 animates the individual dots.
(() => {
  const { animate, motion: { fadeUp, slideIn } } = window.deckScenes;
  const EASE = "cubic-bezier(.2,.7,.2,1)";
  const each = (root, selector, keyframes, options) => [...root.querySelectorAll(selector)].map((element, index) =>
    element.animate(keyframes, { fill: "both", easing: EASE, ...options(index) }));
  const count = (element, from, to) => progress => { element.textContent = Math.round(from + (to - from) * progress).toLocaleString("en-US"); };
  const HOT = "rgba(200, 40, 59, .55)";
  const GLOW = "0 0 .8cqw var(--teal-soft)";

  window.deckScenes.register("14-viewport", {
    beats: [
      // Beat 0, on open: the four routes and the whole fleet, all of it in view.
      root => ({ animations: [
        animate(root, "routes", [{ opacity: 0 }, { opacity: 1 }], { duration: 600 }),
        animate(root, "fleet", fadeUp, { duration: 500, delay: 300 })
      ] }),
      // Beat 1, "full frames": the browser glows hot as 500-truck frames pour in, 1,827 records a second.
      root => {
        const stream = root.querySelector(".rx-stream").getBoundingClientRect().width;
        const rate = root.querySelector('[data-part="rate"]');
        const perFrame = root.querySelector('[data-part="perframe"]');
        return {
          animations: [
            animate(root, "rx", fadeUp, { duration: 400 }),
            animate(root, "rx-browser", [
              { borderColor: "var(--red)", boxShadow: `0 0 1.6cqw ${HOT}` },
              { borderColor: "var(--red)", boxShadow: `0 0 1.6cqw ${HOT}`, offset: 0.8 }
            ], { duration: 2400, delay: 300 }),
            ...each(root, ".rx-stream .rec", [
              { opacity: 0, transform: "translateX(0)" },
              { opacity: 1, offset: 0.15 },
              { opacity: 1, offset: 0.85 },
              { opacity: 0, transform: `translateX(${-stream + 24}px)` }
            ], index => ({ duration: 700, delay: 300 + index * 130, iterations: 3, easing: "linear" }))
          ],
          tickers: [{ delay: 300, duration: 1600, update: progress => {
            count(rate, 0, 1827)(progress);
            count(perFrame, 0, 500)(progress);
          } }]
        };
      },
      // Beat 2, "the rectangle": the view zooms in, inside dots pulse, outside dots dim and blink
      // once a second, and the trucks per frame drop to 191.
      root => {
        const rate = root.querySelector('[data-part="rate"]');
        const perFrame = root.querySelector('[data-part="perframe"]');
        // Three dips across the last 70% of 3 s, one every 0.84 s: about once a second.
        const blink = [0.12, 0.55, 0.12, 0.55, 0.12, 0.55];
        return {
          animations: [
            animate(root, "rect", [
              { left: "0%", top: "0%", width: "100%", height: "100%", opacity: 0 },
              { opacity: 1, offset: 0.25 },
              { left: "30%", top: "30%", width: "28%", height: "40%", opacity: 1 }
            ], { duration: 1200 }),
            ...each(root, ".dot.in", [{ transform: "scale(1)" }, { transform: "scale(1.6)" }, { transform: "scale(1)" }],
              index => ({ duration: 450, delay: 1200 + (index % 3) * 120, iterations: 6, easing: "ease-in-out" })),
            ...each(root, ".dot.out", [
              { opacity: 1, backgroundColor: "var(--teal)", boxShadow: GLOW, offset: 0 },
              { opacity: 0.55, backgroundColor: "var(--muted-dim)", boxShadow: "0 0 0 0 transparent", offset: 0.15 },
              ...blink.map((opacity, step) => ({ opacity, offset: 0.3 + step * 0.14 }))
            ], index => ({ duration: 3000, delay: 1200 + (index % 4) * 250, easing: "linear" })),
            animate(root, "rules", fadeUp, { duration: 400, delay: 600 }),
            animate(root, "rule-in", fadeUp, { duration: 400, delay: 900 }),
            animate(root, "rule-out", fadeUp, { duration: 400, delay: 1500 })
          ],
          tickers: [{ delay: 1200, duration: 1400, update: progress => {
            count(rate, 1827, 705)(progress);
            count(perFrame, 500, 191)(progress);
          } }]
        };
      },
      // Beat 3, "never lose our agent": Truck 007 drives out of the rectangle and stays bright.
      root => ({ animations: [
        animate(root, "agent", [
          { left: "50%", top: "54.4%", offset: 0 },
          { left: "62%", top: "50%", offset: 0.35 },
          { left: "88%", top: "69%", offset: 1 }
        ], { duration: 3000, easing: "linear" }),
        animate(root, "agent", [
          { boxShadow: "0 0 1.4cqw var(--amber)" },
          { boxShadow: "0 0 2.6cqw .5cqw var(--amber)", offset: 0.5 },
          { boxShadow: "0 0 1.4cqw var(--amber)" }
        ], { duration: 750, iterations: 4, easing: "ease-in-out" }),
        animate(root, "vm-caption", fadeUp, { duration: 450, delay: 3000 }),
        animate(root, "rule-sel", fadeUp, { duration: 400, delay: 3000 }),
        animate(root, "safe", fadeUp, { duration: 400, delay: 3400 })
      ] }),
      // Beat 4, "fewer trucks": the result card.
      root => ({ animations: [animate(root, "next", slideIn, { duration: 500 })] })
    ]
  });
})();
