const scrollKeys = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

/**
 * Block user scrolling with listeners rather than overflow: hidden. Hiding the
 * scrollbar changes the page width, which makes the liquid glass re-snapshot
 * the page at the wrong moment. Returns the unlock function.
 */
export function lockScroll() {
  const blockScroll = (event: Event) => event.preventDefault();
  const blockKeys = (event: KeyboardEvent) => {
    if (scrollKeys.has(event.key)) event.preventDefault();
  };
  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockKeys);
  return () => {
    window.removeEventListener("wheel", blockScroll);
    window.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("keydown", blockKeys);
  };
}
