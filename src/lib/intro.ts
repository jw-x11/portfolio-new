type Listener = () => void;
/** Receives the seconds until the opening cover actually uncovers the page. */
type RevealListener = (lead: number) => void;

/** Callbacks waiting for the intro cover to open; null when no intro is showing. */
let waiting: RevealListener[] | null = null;

let glassReady = false;
const glassListeners = new Set<Listener>();

function subscribe<T>(list: T[], fn: T) {
  list.push(fn);
  return () => {
    const index = list.indexOf(fn);
    if (index >= 0) list.splice(index, 1);
  };
}

/** Called by <Intro /> when its cover goes up. */
export function beginIntro() {
  waiting ??= [];
}

/**
 * Called by <Intro /> while its cover is still shut, `lead` seconds before it
 * uncovers the page, so entrance animations can hide their targets unseen.
 */
export function revealIntro(lead: number) {
  const listeners = waiting ?? [];
  waiting = null;
  listeners.forEach((fn) => fn(lead));
}

/** Runs `fn` as the intro cover opens (immediately, with no lead, when there is no intro). */
export function onIntroReveal(fn: RevealListener) {
  if (!waiting) {
    fn(0);
    return () => {};
  }
  return subscribe(waiting, fn);
}

/** Called by the nav once the liquid glass has taken its first snapshot. */
export function markGlassReady() {
  glassReady = true;
  glassListeners.forEach((fn) => fn());
  glassListeners.clear();
}

export function whenGlassReady(fn: Listener) {
  if (glassReady) {
    fn();
    return () => {};
  }
  glassListeners.add(fn);
  return () => {
    glassListeners.delete(fn);
  };
}
