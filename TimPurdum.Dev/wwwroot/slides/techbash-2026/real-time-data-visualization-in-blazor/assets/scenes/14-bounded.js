// Slide 14: the latest-position store fills one row per vehicle, a new report replaces vehicle 18's
// entry in place, the server's two-frame channel drops its oldest frame, and the limits land.
//
// Vehicle 18's earlier report, 0770, and frame n−2 exist only for the motion; the finished slide
// hides both. The narration names reports 4188 and 1904 aloud but not vehicle 18's, so that is the
// row that flips.
(() => {
  const { animate, motion: { fadeUp, pop } } = window.deckScenes;
  const enterRow = [{ opacity: 0, transform: "translateX(-24px)" }, { opacity: 1, transform: "none" }];

  window.deckScenes.register("14-bounded", {
    beats: [
      // Beat 0, on open: the two panels, empty.
      root => ({ animations: [
        animate(root, "panel-store", fadeUp, { duration: 400 }),
        animate(root, "panel-channel", fadeUp, { duration: 400, delay: 150 })
      ] }),
      // Beat 1: rows for vehicles 7, 12, and 18 arrive on their sentences.
      root => ({ animations: [
        animate(root, "row-7", enterRow, { duration: 400 }),
        animate(root, "row-12", enterRow, { duration: 400, delay: 2000 }),
        animate(root, "row-18", enterRow, { duration: 400, delay: 4100 }),
        animate(root, "row-more", enterRow, { duration: 400, delay: 4600 })
      ] }),
      // Beat 2: a new report replaces vehicle 18's entry.
      root => ({ animations: [
        animate(root, "row-18", [
          { backgroundColor: "rgba(231, 100, 57, 0)" }, { backgroundColor: "rgba(231, 100, 57, .35)", offset: 0.4 }, { backgroundColor: "rgba(231, 100, 57, 0)" }
        ], { duration: 1200 }),
        animate(root, "r18-old", [{ opacity: 1, transform: "none" }, { opacity: 1, offset: 0.35 }, { opacity: 0, transform: "translateY(-70%)" }], { duration: 900 }),
        animate(root, "r18-new", [{ opacity: 0, transform: "translateY(70%)" }, { opacity: 0, offset: 0.35 }, { opacity: 1, transform: "none" }], { duration: 900 })
      ] }),
      // Beat 3: the channel shifts: frame n−2 drops out, n−1 moves up, and n arrives.
      root => {
        const prev = root.querySelector('[data-part="frame-prev"]').getBoundingClientRect();
        const next = root.querySelector('[data-part="frame-next"]').getBoundingClientRect();
        const slot = next.left - prev.left;
        return { animations: [
          animate(root, "frame-drop", [
            { opacity: 1, transform: "none" },
            { opacity: 1, transform: "none", offset: 0.25 },
            { opacity: 0, transform: "translateY(48px) rotate(-14deg)" }
          ], { duration: 900, easing: "ease-in" }),
          animate(root, "frame-prev", [{ opacity: 0, transform: `translateX(${slot}px)` }, { opacity: 1, transform: "none" }], { duration: 600, delay: 300 }),
          animate(root, "frame-next", [{ opacity: 0, transform: `translateX(${slot}px)` }, { opacity: 1, transform: "none" }], { duration: 600, delay: 650 })
        ] };
      },
      // Beat 4: the four limits.
      root => ({ animations: [1, 2, 3, 4].map(n => animate(root, `metric-${n}`, pop, { duration: 450, delay: (n - 1) * 200 })) })
    ]
  });
})();
