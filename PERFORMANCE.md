# Carbon Guardian AI Performance Notes

The frontend is built around compositor-friendly animation:

- Gauge, counters, chart stroke, and scenario updates use `requestAnimationFrame`.
- Scroll reveals use Intersection Observer and apply classes inside `requestAnimationFrame`.
- Animated card states use `transform: translateY()`, `scale()`, and `opacity`.
- No chart or card animation is driven by `top` or `left`.

Chrome DevTools verification target:

- Enable Rendering > FPS meter.
- Record Dashboard load in Performance.
- Expected behavior: no long animation frames during gauge/chart reveal, stable 60 FPS on normal laptop hardware, and no layout shift from card hover states.
