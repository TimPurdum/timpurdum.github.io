// Slide 6: the WebAssembly and Blazor Server rows assemble on one grid, then a report travels each
// row in turn. WebAssembly lights two serialization costs (the network, then JS interop); Server
// lights one, because its interop is the network hop. Then the connection drops in both rows.
//
// The six pulses are added elements, hidden in the finished slide: three per row, because one
// element's transform is animated in at most one beat. Each travel beat measures its row when it is built.
(() => {
  const { animate, motion: { fadeUp, pop, flare } } = window.deckScenes;
  const TRAVEL_MS = 1800;
  const STAGGER_MS = 320;

  const centerIn = (root, part, frame) => {
    const box = root.querySelector(`[data-part="${part}"]`).getBoundingClientRect();
    return { x: box.left + box.width / 2 - frame.left, y: box.top + box.height / 2 - frame.top };
  };

  // Three pulses run sim → state → map along one row; each cost flares as the first pulse crosses it.
  const travel = (root, pulses, [sim, hopOne, state, hopTwo, map], costs) => {
    const first = root.querySelector(`[data-part="${pulses[0]}"]`);
    const frame = first.offsetParent.getBoundingClientRect();
    const size = first.getBoundingClientRect().width;
    const place = ({ x, y }, scale) => `translate(${x - size / 2}px, ${y - size / 2}px) scale(${scale})`;
    const at = part => centerIn(root, part, frame);
    const path = [
      { opacity: 0, transform: place(at(sim), 0.5) },
      { opacity: 1, transform: place(at(sim), 1), offset: 0.08 },
      { opacity: 1, transform: place(at(hopOne), 1), offset: 0.3 },
      { opacity: 1, transform: place(at(state), 1), offset: 0.5 },
      { opacity: 1, transform: place(at(hopTwo), 1), offset: 0.7 },
      { opacity: 1, transform: place(at(map), 1), offset: 0.92 },
      { opacity: 0, transform: place(at(map), 0.5) }
    ];
    return { animations: [
      ...pulses.map((part, index) =>
        animate(root, part, path, { duration: TRAVEL_MS, delay: index * STAGGER_MS, easing: "linear" })),
      ...costs.map(({ part, offset }) =>
        animate(root, part, flare, { duration: 1100, delay: TRAVEL_MS * offset - 150 }))
    ] };
  };

  window.deckScenes.register("05-hosting", {
    beats: [
      // Beat 0, on open: the WebAssembly row assembles, then the Server row below it, so the two can
      // be compared without adding an advance-key press.
      root => ({ animations: [
        animate(root, "label-wasm", fadeUp, { duration: 400 }),
        ...["w-sim", "w-hop-1", "w-state", "w-hop-2", "w-map"].map((part, index) =>
          animate(root, part, pop, { duration: 450, delay: 200 + index * 140 })),
        animate(root, "label-server", fadeUp, { duration: 400, delay: 1100 }),
        ...["s-sim", "s-hop-1", "s-state", "s-hop-2", "s-map"].map((part, index) =>
          animate(root, part, pop, { duration: 450, delay: 1300 + index * 140 }))
      ] }),
      // Beat 1: a report crosses the network, then JS interop: two serializations.
      root => travel(root, ["pulse-1", "pulse-2", "pulse-3"], ["w-sim", "w-hop-1", "w-state", "w-hop-2", "w-map"],
        [{ part: "w-cost-1", offset: 0.3 }, { part: "w-cost-2", offset: 0.7 }]),
      // Beat 2: the same report stays in process, then crosses once.
      root => travel(root, ["pulse-4", "pulse-5", "pulse-6"], ["s-sim", "s-hop-1", "s-state", "s-hop-2", "s-map"],
        [{ part: "s-cost-1", offset: 0.7 }]),
      // Beat 3: the connection drops. Both network hops are cut, Server's map is disabled under the
      // reconnect modal, and then WebAssembly's map is shown still working on its last data.
      root => ({ animations: [
        ...["w-cut", "s-cut"].map((part, index) => animate(root, part, pop, { duration: 450, delay: index * 120 })),
        animate(root, "s-veil", [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 500 }),
        animate(root, "s-modal", pop, { duration: 500, delay: 750 }),
        animate(root, "w-alive", fadeUp, { duration: 500, delay: 1900 })
      ] }),
      // Beat 4: when to pick each.
      root => ({ animations: [animate(root, "closing", fadeUp, { duration: 450 })] })
    ]
  });
})();
