// Slide 21: the sensor history draws with its gap left as a gap, the alarm path shakes in as the
// exception, and the store's totals grow bar by bar.
//
// The polylines carry a `stroke-dasharray` equal to their length, so a dash offset draws them.
(() => {
  const { animate, motion: { fadeUp, pop, draw } } = window.deckScenes;
  const shake = [
    { opacity: 0, transform: "scale(.6)" },
    { opacity: 1, transform: "scale(1.1)", offset: 0.3 },
    { transform: "translateX(-6px)", offset: 0.45 },
    { transform: "translateX(6px)", offset: 0.6 },
    { transform: "translateX(-4px)", offset: 0.75 },
    { opacity: 1, transform: "none" }
  ];
  const grow = [{ transform: "scaleY(0)" }, { transform: "scaleY(1.06)", offset: 0.75 }, { transform: "none" }];

  window.deckScenes.register("21-transfer", {
    beats: [
      // Beat 0, on open: both panels, with their charts still empty.
      root => ({ animations: [
        animate(root, "panel-sensor", fadeUp, { duration: 400 }),
        animate(root, "panel-store", fadeUp, { duration: 400, delay: 150 })
      ] }),
      // Beat 1: the sensor line draws, leaves the gap dashed, and carries on.
      root => ({ animations: [
        animate(root, "sensor-a", draw(110), { duration: 700, easing: "linear" }),
        animate(root, "sensor-gap", [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 800 }),
        animate(root, "sensor-b", draw(146), { duration: 800, delay: 1200, easing: "linear" })
      ] }),
      // Beat 2: alarm transitions are the exception.
      root => ({ animations: [animate(root, "alarm", shake, { duration: 900 })] }),
      // Beat 3: the store's totals grow.
      root => ({ animations: [1, 2, 3, 4, 5].map(n => animate(root, `bar-${n}`, grow, { duration: 450, delay: (n - 1) * 150 })) }),
      // Beat 4: the example is illustrative.
      root => ({ animations: [animate(root, "illustrative", pop, { duration: 450 })] })
    ]
  });
})();
