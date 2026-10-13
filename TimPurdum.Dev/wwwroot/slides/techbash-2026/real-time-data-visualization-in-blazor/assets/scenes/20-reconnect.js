// Slide 18: the status labels arrive in order, Live, then Reconnecting, then Live again, and the merge rule lights up when the narration underlines it.
//
// The video cues this scene on segment 20c, after the reconnect recording; segment 20a is uncued and
// shows the finished row.
(() => {
  const { animate, motion: { fadeUp, pop, flare } } = window.deckScenes;
  const blink = [
    { opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0.3, offset: 0.4 }, { opacity: 1, offset: 0.6 }, { opacity: 0.3, offset: 0.8 }, { opacity: 1 }
  ];

  window.deckScenes.register("20-reconnect", {
    beats: [
      // Beat 0, on open: Agent 007 goes dark on the stale figure. The marker fades to amber, a radar
      // sweep finds nothing, and the caption types in. The first Live label is already on screen.
      root => {
        const caption = root.querySelector('[data-part="dark-caption"]');
        const text = caption.textContent;
        return {
          animations: [
            animate(root, "dark-tint", [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 200 }),
            animate(root, "dark-radar", [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], { duration: 2000, delay: 300, easing: "linear" }),
            animate(root, "dark-sweep", [{ transform: "rotate(0deg)" }, { transform: "rotate(720deg)" }], { duration: 1800, delay: 300, easing: "linear" }),
            animate(root, "dark-lost", [{ opacity: 0 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 2000, delay: 300, easing: "linear" })
          ],
          tickers: [{
            delay: 1500,
            duration: 800,
            update: progress => { caption.textContent = text.slice(0, Math.ceil(text.length * progress)); }
          }]
        };
      },
      // Beat 1: Reconnecting blinks in after the first Live.
      root => ({ animations: [
        animate(root, "arrow-1", fadeUp, { duration: 300 }),
        animate(root, "state-reconnecting", blink, { duration: 1400, delay: 200, easing: "linear" })
      ] }),
      // Beat 2: Live again.
      root => ({ animations: [
        animate(root, "arrow-2", fadeUp, { duration: 300 }),
        animate(root, "state-current", pop, { duration: 500, delay: 200 }),
        animate(root, "state-current", flare, { duration: 1100, delay: 600 })
      ] }),
      // Beat 3: the merge rule.
      root => ({ animations: [animate(root, "merge-rule", flare, { duration: 1300 })] })
    ]
  });
})();
