// Slide 2: Truck 007 enters through a gun-barrel iris, then the freshness build plays.
//
// One beat on open, so the scene never takes a key press: the slide's advance key still reveals the
// arithmetic. The body's data-build-lead (2200 ms, this beat's length) holds the freshness climb back
// until the iris has cleared; the overlay is authored invisible, so reduced motion, the rail and
// print show the finished slide without playing it.
(() => {
  const { animate } = window.deckScenes;
  const TOTAL = 2200;
  const circle = radius => `circle(${radius} at 50% 50%)`;

  window.deckScenes.register("02-iris", {
    beats: [
      root => ({ animations: [
        // The overlay is opaque until the iris has opened, then fades off the slide.
        animate(root, "barrel", [{ opacity: 1 }, { opacity: 1, offset: 0.84 }, { opacity: 0 }], { duration: TOTAL, easing: "linear" }),
        // The white barrel tracks in from the left, holds, and drops away as the reveal opens from its center.
        animate(root, "gb-disc", [
          { transform: "translateX(-60cqw)", opacity: 1 },
          { transform: "translateX(0)", opacity: 1, offset: 0.36 },
          { transform: "translateX(0)", opacity: 1, offset: 0.46 },
          { transform: "scale(1.4)", opacity: 0, offset: 0.62 },
          { transform: "scale(1.4)", opacity: 0 }
        ], { duration: TOTAL, easing: "ease-out" }),
        animate(root, "gb-reveal", [
          { clipPath: circle("0cqw") },
          { clipPath: circle("0cqw"), offset: 0.46 },
          { clipPath: circle("60cqw") }
        ], { duration: TOTAL * 0.82, easing: "cubic-bezier(.3,.6,.3,1)" })
      ] })
    ]
  });
})();
