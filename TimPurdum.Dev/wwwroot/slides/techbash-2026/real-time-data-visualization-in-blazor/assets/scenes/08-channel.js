// Slide 8, stage 2: the frame clock fires, the server snapshots the store into one frame, and sends it to
// every browser. The scene keeps its old name, "08-channel", so the data-scene attribute and the script
// include stay as they were; the channel it once drew is gone.
//
// Beats follow the press words: 1 "snapshot", 2 "send", 3 "slow send".
//
// In the finished slide frame 43 sits in the frame slot and nothing is waiting, so every card animates
// relative to that home. Frame 41 is built in beat 1 and sent in beat 2, so its card is a wrapper
// (arrival, beat 1) around a frame (departure, beat 2): no element animates the same property in two beats.
// Beat 3 uses its own packets and its own browser property (backgroundColor) for the same reason.
(() => {
  const { animate, motion: { fadeUp, flare } } = window.deckScenes;

  // Layout positions relative to the .chan box, immune to the transforms already running on the nodes.
  const center = (root, part) => {
    const chan = root.querySelector(".chan");
    const element = root.querySelector(`[data-part="${part}"]`);
    let x = element.offsetWidth / 2, y = element.offsetHeight / 2;
    for (let node = element; node && node !== chan; node = node.offsetParent) { x += node.offsetLeft; y += node.offsetTop; }
    return { x, y };
  };
  const delta = (to, from) => ({ x: to.x - from.x, y: to.y - from.y });
  const move = ({ x, y }, extra = "") => `translate(${x}px, ${y}px) ${extra}`.trim();
  const ping = [
    { boxShadow: "0 0 0 0 rgba(231, 100, 57, 0)" },
    { boxShadow: "0 0 0 .4cqw rgba(231, 100, 57, .6)", offset: 0.4 },
    { boxShadow: "0 0 0 0 rgba(231, 100, 57, 0)" }
  ];
  const CLEAR = "rgba(231, 100, 57, 0)";
  const NONE = "rgba(0, 0, 0, 0)";

  // A packet leaves the send box, flies to a browser, and fades. The first two beats share this shape.
  const packet = (root, part, browser, options) => {
    const from = center(root, part);
    const to = move(delta(center(root, browser), from));
    return animate(root, part, [
      { opacity: 0, transform: "none" },
      { opacity: 1, transform: "none", offset: 0.15 },
      { opacity: 1, transform: to, offset: 0.85 },
      { opacity: 0, transform: to }
    ], { easing: "linear", ...options });
  };

  // Beat 3 timeline in milliseconds. Frame 42 is built when the clock first fires and sent at SENT; browser 3 holds
  // the send until DONE. The next frame comes due at DUE, waits, and the clock fires once at DONE, which builds frame 43.
  const TOTAL = 5000;
  const SENT = 1000;
  const DUE = 2200;
  const DONE = 3600;
  const stop = (ms, fields) => ({ offset: Math.min(1, ms / TOTAL), ...fields });

  window.deckScenes.register("08-channel", {
    beats: [
      // Beat 0, on open: the clock, the store, and the send box arrive, with the browsers inside the send box.
      root => ({ animations: ["clock", "pipe", "send"].map((part, index) =>
        animate(root, part, fadeUp, { duration: 450, delay: index * 150 })) }),
      // Beat 1, "snapshot": the clock fires, the store's slots flare, and frame 41 is built from them.
      root => {
        const slot = center(root, "slot-t6");
        const out = center(root, "out");
        return { animations: [
          animate(root, "clock", flare, { duration: 900 }),
          ...["slot-t5", "slot-t6", "slot-t7"].map((part, index) =>
            animate(root, part, ping, { duration: 700, delay: 300 + index * 90 })),
          animate(root, "card-41", [
            { opacity: 0, transform: move(delta(slot, out), "scale(.6)") },
            { opacity: 1, transform: "none" }
          ], { duration: 800, delay: 700 })
        ] };
      },
      // Beat 2, "send": frame 41 goes into the send box, and a copy reaches each browser.
      root => {
        const out = center(root, "out");
        const send = center(root, "send");
        const into = move(delta(send, out));
        const packets = [1, 2, 3].flatMap(n => [
          packet(root, `pkt-${n}`, `browser-${n}`, { duration: 700, delay: 1000 + n * 90 }),
          animate(root, `browser-${n}`, ping, { duration: 700, delay: 1600 + n * 90 })
        ]);
        return { animations: [
          animate(root, "send", flare, { duration: 900 }),
          animate(root, "card-41-out", [
            { opacity: 1, transform: "none" },
            { opacity: 1, transform: into, offset: 0.8 },
            { opacity: 0, transform: into }
          ], { duration: 900 }),
          ...packets
        ] };
      },
      // Beat 3, "slow send": frame 42 is sent but browser 3 holds the send. The next frame comes due, waits,
      // and the clock fires once when the send finishes. Frame 43 is then built fresh from the store.
      root => {
        const slot = center(root, "slot-t6");
        const out = center(root, "out");
        const send = center(root, "send");
        const fromSlots = move(delta(slot, out), "scale(.6)");
        const into = move(delta(send, out));
        const slow = center(root, "pkt-6");
        const toSlow = move(delta(center(root, "browser-3"), slow));
        const halfway = move({ x: (center(root, "browser-3").x - slow.x) * 0.45, y: (center(root, "browser-3").y - slow.y) * 0.45 });
        const tickAt = ms => [
          { boxShadow: CLEAR, offset: Math.max(0, (ms - 1) / TOTAL) },
          { boxShadow: "0 0 0 .4cqw rgba(231, 100, 57, .6)", offset: (ms + 200) / TOTAL },
          { boxShadow: CLEAR, offset: (ms + 600) / TOTAL }
        ];
        return { animations: [
          // The clock box flares when it first fires, and again when the waiting interval finally fires.
          animate(root, "tick", [{ boxShadow: CLEAR, offset: 0 }, ...tickAt(0).slice(1), ...tickAt(DONE)], { duration: TOTAL, easing: "linear" }),
          animate(root, "late", [
            { opacity: 0, offset: 0 },
            stop(DUE, { opacity: 0 }),
            stop(DUE + 200, { opacity: 1 }),
            stop(DONE - 100, { opacity: 1 }),
            stop(DONE + 200, { opacity: 0 }),
            stop(TOTAL, { opacity: 0 })
          ], { duration: TOTAL, easing: "linear" }),
          // Frame 42 appears, holds, then goes into the send box.
          animate(root, "card-42", [
            { opacity: 0, transform: fromSlots, offset: 0 },
            stop(150, { opacity: 0, transform: fromSlots }),
            stop(650, { opacity: 1, transform: "none" }),
            stop(SENT - 100, { opacity: 1, transform: "none" }),
            stop(SENT + 500, { opacity: 1, transform: into }),
            stop(SENT + 700, { opacity: 0, transform: into }),
            stop(TOTAL, { opacity: 0, transform: into })
          ], { duration: TOTAL, easing: "linear" }),
          // Two browsers take the send at once. The third holds it until DONE.
          packet(root, "pkt-4", "browser-1", { duration: 700, delay: SENT + 500 }),
          packet(root, "pkt-5", "browser-2", { duration: 700, delay: SENT + 600 }),
          animate(root, "pkt-6", [
            { opacity: 0, transform: "none", offset: 0 },
            stop(SENT + 500, { opacity: 0, transform: "none" }),
            stop(SENT + 650, { opacity: 1, transform: "none" }),
            stop(SENT + 1300, { opacity: 1, transform: halfway }),
            stop(DONE - 400, { opacity: 1, transform: halfway }),
            stop(DONE, { opacity: 1, transform: toSlow }),
            stop(DONE + 150, { opacity: 0, transform: toSlow }),
            stop(TOTAL, { opacity: 0, transform: toSlow })
          ], { duration: TOTAL, easing: "linear" }),
          animate(root, "browser-1", [
            { backgroundColor: NONE, offset: 0 },
            stop(SENT + 1200, { backgroundColor: NONE }),
            stop(SENT + 1400, { backgroundColor: "rgba(26, 138, 140, .45)" }),
            stop(SENT + 2200, { backgroundColor: NONE }),
            stop(TOTAL, { backgroundColor: NONE })
          ], { duration: TOTAL, easing: "linear" }),
          animate(root, "browser-2", [
            { backgroundColor: NONE, offset: 0 },
            stop(SENT + 1300, { backgroundColor: NONE }),
            stop(SENT + 1500, { backgroundColor: "rgba(26, 138, 140, .45)" }),
            stop(SENT + 2300, { backgroundColor: NONE }),
            stop(TOTAL, { backgroundColor: NONE })
          ], { duration: TOTAL, easing: "linear" }),
          // Browser 3 turns red while it holds the send, then takes it.
          animate(root, "browser-3", [
            { backgroundColor: NONE, offset: 0 },
            stop(SENT + 1000, { backgroundColor: NONE }),
            stop(SENT + 1300, { backgroundColor: "rgba(231, 100, 57, .5)" }),
            stop(DONE - 100, { backgroundColor: "rgba(231, 100, 57, .5)" }),
            stop(DONE + 200, { backgroundColor: "rgba(26, 138, 140, .45)" }),
            stop(DONE + 1000, { backgroundColor: NONE }),
            stop(TOTAL, { backgroundColor: NONE })
          ], { duration: TOTAL, easing: "linear" }),
          // The send is waiting from the moment frame 42 goes out until browser 3 finishes.
          animate(root, "wait", [
            { opacity: 0, offset: 0 },
            stop(SENT + 500, { opacity: 0 }),
            stop(SENT + 800, { opacity: 1 }),
            stop(DONE, { opacity: 1 }),
            stop(DONE + 300, { opacity: 0 }),
            stop(TOTAL, { opacity: 0 })
          ], { duration: TOTAL, easing: "linear" }),
          animate(root, "ring", [{ transform: "rotate(0deg)" }, { transform: "rotate(720deg)" }], { duration: TOTAL, easing: "linear" }),
          // Frame 43 is built fresh from the store when the waiting clock fires.
          animate(root, "card-43", [
            { opacity: 0, transform: fromSlots, offset: 0 },
            stop(DONE, { opacity: 0, transform: fromSlots }),
            stop(DONE + 600, { opacity: 1, transform: "none" }),
            stop(TOTAL, { opacity: 1, transform: "none" })
          ], { duration: TOTAL, easing: "linear" })
        ] };
      }
    ]
  });
})();
