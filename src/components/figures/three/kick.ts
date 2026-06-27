import { useEffect } from "react";

// R3F sizes its canvas from a ResizeObserver; when a lazy 3D figure mounts
// below the fold the first measure can be missed, leaving a blank canvas.
// Firing a couple of resize events just after mount forces a correct measure.
export function useResizeKick() {
  useEffect(() => {
    const fire = () => window.dispatchEvent(new Event("resize"));
    const ids = [40, 200, 500].map((d) => setTimeout(fire, d));
    return () => ids.forEach(clearTimeout);
  }, []);
}
