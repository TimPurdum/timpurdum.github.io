// The explainer-scene runner: mounts each scene's SVG into its slide and plays it one beat at a time.
//
// A scene file calls `deckScenes.register(name, { markup, beats })`. The markup is the finished
// diagram; a scene without markup animates the slide's own authored HTML instead. Either way every path that never starts the scene (preview, the thumbnail rail,
// print) shows the finished slide. `start` rewinds the scene by creating every beat's animations at
// once, paused on their first keyframe, and then plays beat 0.
//
// A beat is `root => ({ animations, tickers })`: Web Animations with `fill: "both"`, plus optional
// counters `{ delay, duration, update(progress) }` driven from `requestAnimationFrame`. Those are the
// two clocks the video capture controls (scripts/video/animate-page.mjs).
//
// The trap: every pending animation is live on the page, and a later animation wins over an earlier
// one on the same property. So one element's property is animated in at most one beat. Pending
// animations carry `id = "scene-pending"` so the video capture's seeker leaves them on frame 0.
(() => {
  const PENDING = "scene-pending";
  const EASE = "cubic-bezier(.2,.7,.2,1)";
  const scenes = new Map();
  const runs = new Map(); // slide -> { beats: [{ animations, tickers }], played }
  let frame = 0;

  // The host is the element carrying data-scene: a mount point inside the body, or the body itself.
  const hostOf = slide => {
    const body = slide.querySelector('.slide-body[data-build~="scene"]');
    return body && (body.matches("[data-scene]") ? body : body.querySelector("[data-scene]"));
  };
  const endOf = beat => Math.max(0,
    ...beat.animations.map(animation => animation.effect.getComputedTiming().endTime),
    ...beat.tickers.map(ticker => (ticker.delay ?? 0) + ticker.duration));

  const pump = () => {
    frame = 0;
    const now = performance.now();
    let active = false;
    for (const run of runs.values()) {
      for (const ticker of run.beats.flatMap(beat => beat.tickers)) {
        if (ticker.startedAt === undefined) continue;
        const progress = Math.min(1, Math.max(0, (now - ticker.startedAt - (ticker.delay ?? 0)) / ticker.duration));
        ticker.update(progress);
        if (progress < 1) active = true;
      }
    }
    if (active) frame = requestAnimationFrame(pump);
  };
  const wake = () => { if (!frame) frame = requestAnimationFrame(pump); };

  const rewind = beat => {
    for (const animation of beat.animations) { animation.id = PENDING; animation.pause(); animation.currentTime = 0; }
    for (const ticker of beat.tickers) { delete ticker.startedAt; ticker.update(0); }
  };
  const play = beat => {
    for (const animation of beat.animations) { animation.id = ""; animation.currentTime = 0; animation.play(); }
    const now = performance.now();
    for (const ticker of beat.tickers) ticker.startedAt = now;
    wake();
  };
  const finish = beat => {
    for (const animation of beat.animations) { animation.id = ""; animation.finish(); }
    for (const ticker of beat.tickers) { ticker.startedAt = -Infinity; ticker.update(1); }
  };

  const register = (name, scene) => {
    scenes.set(name, scene);
    if (scene.markup === undefined) return;
    for (const host of document.querySelectorAll(`[data-scene="${name}"]`)) host.innerHTML = scene.markup;
  };

  const settle = slide => {
    const run = runs.get(slide);
    if (!run) return;
    for (const beat of run.beats) {
      for (const animation of beat.animations) animation.cancel();
      for (const ticker of beat.tickers) { delete ticker.startedAt; ticker.update(1); }
    }
    runs.delete(slide);
  };

  const start = slide => {
    const host = hostOf(slide);
    const scene = host && scenes.get(host.dataset.scene);
    if (!scene) return false;
    settle(slide);
    const beats = scene.beats.map(build => {
      const beat = build(host);
      return { animations: beat.animations ?? [], tickers: beat.tickers ?? [] };
    });
    beats.forEach(rewind);
    runs.set(slide, { beats, played: 0 });
    play(beats[0]);
    return true;
  };

  const next = slide => {
    const run = runs.get(slide);
    if (!run || run.played >= run.beats.length - 1) return false;
    finish(run.beats[run.played]);
    run.played += 1;
    play(run.beats[run.played]);
    return true;
  };

  const back = slide => {
    const run = runs.get(slide);
    if (!run || run.played === 0) return false;
    rewind(run.beats[run.played]);
    run.played -= 1;
    finish(run.beats[run.played]);
    return true;
  };

  const info = slide => {
    const run = runs.get(slide);
    return run ? { beats: run.beats.length, played: run.played, durations: run.beats.map(endOf) } : null;
  };

  const busy = slide => {
    const run = runs.get(slide);
    if (!run) return false;
    const beat = run.beats[run.played];
    const now = performance.now();
    return beat.animations.some(animation => (animation.currentTime ?? 0) < animation.effect.getComputedTiming().endTime)
      || beat.tickers.some(ticker => now - ticker.startedAt < (ticker.delay ?? 0) + ticker.duration);
  };

  const animate = (root, part, keyframes, options) => {
    const element = root.querySelector(`[data-part="${part}"]`);
    if (!element) throw new Error(`scene part "${part}" is missing`);
    return element.animate(keyframes, { fill: "both", easing: EASE, ...options });
  };

  // Keyframe presets every scene shares. `flare` ends where it starts, so a flared element's
  // finished state is its authored one.
  const motion = {
    fadeUp: [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
    slideIn: [{ opacity: 0, transform: "translateX(48px)" }, { opacity: 1, transform: "none" }],
    pop: [
      { opacity: 0, transform: "scale(.6)" },
      { opacity: 1, transform: "scale(1.08)", offset: 0.65 },
      { opacity: 1, transform: "none" }
    ],
    drop: [
      { opacity: 0, transform: "translateY(-48px)" },
      { opacity: 1, transform: "translateY(6px)", offset: 0.7 },
      { opacity: 1, transform: "none" }
    ],
    draw: length => [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    flare: [
      { boxShadow: "0 0 0 0 rgba(231, 100, 57, 0)" },
      { boxShadow: "0 0 0 10px rgba(231, 100, 57, .45)", offset: 0.35 },
      { boxShadow: "0 0 0 0 rgba(231, 100, 57, 0)" }
    ]
  };

  // `registered` lets callers tell a scene with no script yet (a pending hook) from a live one.
  const registered = name => scenes.has(name);

  window.deckScenes = { register, registered, start, next, back, settle, info, busy, animate, motion };
})();
