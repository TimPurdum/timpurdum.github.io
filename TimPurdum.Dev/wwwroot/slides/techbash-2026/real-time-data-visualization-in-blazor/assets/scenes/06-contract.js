// Slide 7: stages 1 and 2. Reports for Truck 7 replace each other in a store slot, the store is
// snapshotted into a FleetFrame, and each field of the contract flares as the narration explains it.
// Beats follow the press words: 1 "replaces", 2 "snapshot", 3 "Sequence", 4 "ObservedAtUtc",
// 5 "Longitude and Latitude", 6 "RunId".
//
// A flare ends on the faint tint the finished slide gives every field, so a flared field keeps its
// mark after the narration moves on.
(() => {
  const { animate, motion: { fadeUp, slideIn } } = window.deckScenes;
  const TINT = "rgba(242, 193, 78, .14)";
  const flare = [{ backgroundColor: "rgba(242, 193, 78, 0)" }, { backgroundColor: "rgba(242, 193, 78, .5)", offset: 0.3 }, { backgroundColor: TINT }];
  const field = (root, part, delay = 0) => animate(root, part, flare, { duration: 1200, delay, easing: "ease-out" });

  // Ghost copies of every store slot fly into the frame, then the arrow and the frame arrive and the
  // frame flares. The slots and the frame keep their authored look, so the finished slide is unchanged.
  const FLY_MS = 900;
  const funnel = root => {
    const frame = root.querySelector('[data-part="funnel-frame"]');
    const host = frame.offsetParent ?? frame.parentElement;
    host.querySelectorAll(".chip-flyer").forEach(ghost => ghost.remove());
    const target = { x: frame.offsetLeft + frame.offsetWidth / 2, y: frame.offsetTop + frame.offsetHeight / 2 };
    const ghosts = [...host.querySelectorAll(".funnel-reports .chip:not(.dim)")].map((chip, index) => {
      const ghost = chip.cloneNode(true);
      ghost.classList.add("chip-flyer");
      ghost.querySelectorAll("[data-part]").forEach(inner => inner.removeAttribute("data-part"));
      Object.assign(ghost.style, { left: `${chip.offsetLeft}px`, top: `${chip.offsetTop}px` });
      host.append(ghost);
      const dx = target.x - (chip.offsetLeft + chip.offsetWidth / 2);
      const dy = target.y - (chip.offsetTop + chip.offsetHeight / 2);
      return ghost.animate([
        { opacity: 0, transform: "none" },
        { opacity: 1, transform: "none", offset: 0.15 },
        { opacity: 1, transform: `translate(${dx * 0.8}px, ${dy * 0.8}px) scale(.7)`, offset: 0.8 },
        { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.3)` }
      ], { duration: FLY_MS, delay: index * 90, fill: "both", easing: "ease-in" });
    });
    return [
      ...ghosts,
      animate(root, "funnel-arrow", fadeUp, { duration: 300, delay: 300 }),
      animate(root, "funnel-frame", window.deckScenes.motion.pop, { duration: 500, delay: 700 }),
      animate(root, "funnel-frame", window.deckScenes.motion.flare, { duration: 1100, delay: 1200 })
    ];
  };

  // Truck 7's slot holds one report at a time: 4186, then 4187 replaces it, then 4188 replaces that.
  const replaces = root => [
    animate(root, "r-4186", [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], { duration: 1500 }),
    animate(root, "r-4187", [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1, offset: 0.5 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 1500 }),
    animate(root, "r-4188", [{ opacity: 0 }, { opacity: 0, offset: 0.65 }, { opacity: 1 }], { duration: 1500 })
  ];

  window.deckScenes.register("06-contract", {
    beats: [
      // Beat 0, on open: the two records.
      root => ({ animations: [
        animate(root, "code-report", fadeUp, { duration: 450 }),
        animate(root, "code-frame", fadeUp, { duration: 450, delay: 200 })
      ] }),
      // Beat 1, "replaces": three reports from Truck 7 replace each other in its slot, and VehicleId flares.
      root => ({ animations: [...replaces(root), field(root, "f-vehicleid", 300)] }),
      // Beat 2, "snapshot": the store's slots fly into one FleetFrame.
      root => ({ animations: [field(root, "f-vehicles"), ...funnel(root)] }),
      // Beat 3, "Sequence".
      root => ({ animations: [field(root, "f-sequence")] }),
      // Beat 4, "ObservedAtUtc".
      root => ({ animations: [field(root, "f-observed")] }),
      // Beat 5, "Longitude and Latitude": geometry, and the fields-to-marker panel.
      root => ({ animations: [
        field(root, "f-lon"),
        field(root, "f-lat", 200),
        animate(root, "panel-marker", slideIn, { duration: 500, delay: 400 })
      ] }),
      // Beat 6, "RunId": the run, and the frame-level panel.
      root => ({ animations: [
        field(root, "f-runid"),
        animate(root, "panel-frame", slideIn, { duration: 500, delay: 300 })
      ] })
    ]
  });
})();
