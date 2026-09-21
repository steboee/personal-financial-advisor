import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/**
 * Reads the viewport as external state rather than mirroring it into an
 * effect: matchMedia is a browser store, so useSyncExternalStore subscribes
 * to it directly and avoids the extra render a setState-in-effect costs.
 * The server snapshot is `false` so markup matches the desktop-first layout
 * and hydration stays quiet.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
