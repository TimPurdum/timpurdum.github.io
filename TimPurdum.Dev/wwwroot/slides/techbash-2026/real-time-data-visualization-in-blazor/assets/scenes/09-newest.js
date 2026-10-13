// Slide 9: stage 3. Frames arrive into one slot in the browser, each replacing the last, and the
// page timer reads whatever sits there.
//
// Beats follow the press words: 1 "arrives", 2 "overwrites", 3 "reads".
//
// The scene animates the slide's own HTML. In the finished slide only frame 43 shows in the slot.
// Each card is a wrapper (arrival) around a face (replacement), so no element animates the same
// property in two beats: frame 41 arrives in beat 1 and is replaced in beat 2.
(() => {
  const { animate, motion: { fadeUp, flare, pop } } = window.deckScenes;

  const from = [{ opacity: 0, transform: "translateX(-9cqw)" }, { opacity: 1, transform: "none" }];
  const gone = [{ opacity: 1 }, { opacity: 0 }];

  window.deckScenes.register("09-newest", {
    beats: [
      // Beat 0, on open: the receive box, the one slot and the page tick.
      root => ({ animations: ["source", "slot-wrap", "tick"].map((part, index) =>
        animate(root, part, fadeUp, { duration: 450, delay: index * 150 })) }),
      // Beat 1, "arrives": frame 41 is received and lands in the slot.
      root => ({ animations: [
        animate(root, "source", flare, { duration: 900 }),
        animate(root, "in-41", from, { duration: 700, delay: 250 })
      ] }),
      // Beat 2, "overwrites": frame 42 arrives and replaces 41, then frame 43 arrives and replaces 42.
      root => ({ animations: [
        animate(root, "in-42", from, { duration: 700, delay: 100 }),
        animate(root, "out-41", gone, { duration: 400, delay: 650 }),
        animate(root, "in-43", from, { duration: 700, delay: 1500 }),
        animate(root, "out-42", gone, { duration: 400, delay: 2050 })
      ] }),
      // Beat 3, "reads": the page tick reads the slot, and the caption and the ten frames appear.
      root => ({ animations: [
        animate(root, "tick", flare, { duration: 1100 }),
        animate(root, "tick-read", fadeUp, { duration: 500, delay: 300 }),
        animate(root, "ten", pop, { duration: 600, delay: 900 })
      ] })
    ]
  });
})();
