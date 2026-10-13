// Slide 5: report 4188 from Truck 7 walks through the five points where data is kept, batched, or
// thinned. Beat 0 brings in the zones; beats 1 to 5 follow the narration's press words:
// 1 "replaces", 2 "one frame", 3 "overwrites", 4 "one slot", 5 "one call".
//
// The scene animates the slide's own HTML. The authored markup is the finished slide, so each card
// animates from where it came from to its authored place. Positions come from layout offsets, which
// transforms already running on the cards cannot disturb. An element's property is animated in one
// beat only: the runner starts every beat paused on its first keyframe, so a second beat on the same
// property would hide the first.
(() => {
  const { animate, motion: { fadeUp, pop } } = window.deckScenes;

  const center = (root, part) => {
    const element = root.querySelector(`[data-part="${part}"]`);
    let x = element.offsetWidth / 2, y = element.offsetHeight / 2;
    for (let node = element; node; node = node.offsetParent) { x += node.offsetLeft; y += node.offsetTop; }
    return { x, y };
  };
  // Where `from` sits relative to `to`: the start offset of a card that finishes at `to`.
  const offset = (root, from, to) => {
    const a = center(root, from), b = center(root, to);
    return `translate(${a.x - b.x}px, ${a.y - b.y}px)`;
  };

  // One report value in a truck's slot: it arrives (slides in from the left) at `inAt` ms, or is
  // there from the start when `inAt` is null, and leaves (slides out to the right) at `outAt` ms, or
  // stays when `outAt` is null. Easing is linear because the animation-level easing would otherwise warp the whole timeline and fade old values early. A swap is a crossfade over REPLACE_MS. All keyframes of one value sit
  // in one animation, so the value's opacity and transform are animated in this beat only.
  const REPLACE_MS = 350, SHIFT = "2.4cqw";
  const replaceReport = (root, part, inAt, outAt) => {
    const points = [];
    if (inAt === null) points.push([0, 1, "none"]);
    else points.push([inAt, 0, `translateX(-${SHIFT})`], [inAt + REPLACE_MS, 1, "none"]);
    if (outAt !== null) points.push([outAt, 1, "none"], [outAt + REPLACE_MS, 0, `translateX(${SHIFT})`]);
    const start = points[0][0], duration = points[points.length - 1][0] - start;
    return animate(root, part, points.map(([at, opacity, transform]) =>
      ({ opacity, transform, offset: (at - start) / duration })), { duration, delay: start, easing: "linear" });
  };

  window.deckScenes.register("04-pipeline", {
    beats: [
      // Beat 0, on open: the two zones, the key and the clock.
      root => ({ animations: [
        animate(root, "server", fadeUp, { duration: 400 }),
        animate(root, "key", fadeUp, { duration: 400, delay: 150 }),
        animate(root, "browser", fadeUp, { duration: 400, delay: 150 }),
        animate(root, "cadence", fadeUp, { duration: 400, delay: 450 })
      ] }),
      // Beat 1, "replaces": each truck reports on its own schedule, and each new report replaces the
      // last in that truck's slot. Truck 6 is a fast reporter (912 to 915), Truck 8 a slow one (2301 to
      // 2302), and Truck 7, the one we follow, lands 4188 last so the eye ends on it.
      root => ({ animations: [
        ...[["r6-912", null, 100], ["r6-913", 100, 650], ["r6-914", 650, 1200], ["r6-915", 1200, null],
          ["r8-2301", null, 1500], ["r8-2302", 1500, null],
          ["r-4187", null, 1850], ["r-4188", 1850, null]
        ].map(([part, inAt, outAt]) => replaceReport(root, part, inAt, outAt))
      ] }),
      // Beat 2, "one frame": the store's slots snap into one frame card labeled "500 trucks" in the Send stage.
      root => {
        const from = offset(root, "store-slots", "snap");
        return { animations: [
          animate(root, "snap", [
            { opacity: 0, transform: from },
            { opacity: 1, transform: from, offset: 0.15 },
            { opacity: 1, transform: "none", offset: 0.7 },
            { opacity: 0, transform: "none" }
          ], { duration: 1400, easing: "linear" }),
          animate(root, "frame-card", pop, { duration: 600, delay: 800 })
        ] };
      },
      // Beat 3, "overwrites": the frame leaves Send, lands in the newest-frame slot, and the previous one fades.
      root => {
        const from = offset(root, "frame-card", "nf-slot");
        return { animations: [
          animate(root, "nf-cur", [
            { opacity: 0, transform: from },
            { opacity: 1, transform: from, offset: 0.1 },
            { opacity: 1, transform: "none" }
          ], { duration: 1100, easing: "linear" }),
          animate(root, "nf-prev", [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 1300, easing: "linear" })
        ] };
      },
      // Beat 4, "one slot": the frame carries every truck, so each truck's latest report (915, 4188,
      // 2302) drops into its own fleet-state slot. Truck 7's lands first; trucks 6 and 8 follow.
      root => ({ animations: [["fs-4188", 0], ["fs6-915", 150], ["fs8-2302", 150]].map(([part, delay]) => {
        const from = offset(root, "nf-slot", part);
        return animate(root, part, [
          { opacity: 0, transform: from },
          { opacity: 1, transform: from, offset: 0.1 },
          { opacity: 1, transform: "translateY(-.3cqw) scale(1.12)", offset: 0.85 },
          { opacity: 1, transform: "none" }
        ], { duration: 1100, delay, easing: "linear" });
      }) }),
      // Beat 5, "one call": the fleet-state slots go to the map as one ApplyEdits call.
      root => {
        const from = offset(root, "fleet-slots", "call");
        return { animations: [
          animate(root, "call", [
            { opacity: 0, transform: `${from} scale(.7)` },
            { opacity: 1, transform: `${from} scale(.7)`, offset: 0.12 },
            { opacity: 1, transform: "none" }
          ], { duration: 1400, easing: "linear" }),
          ...["dot-1", "dot-2", "dot-3"].map((dot, index) => animate(root, dot, pop, { duration: 500, delay: 1000 + index * 120 }))
        ] };
      }
    ]
  });
})();
