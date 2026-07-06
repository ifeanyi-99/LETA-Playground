import * as React from 'react';
import type { AnimationItem, LottiePlayer } from 'lottie-web';

/**
 * The LETA loader Lottie (image-sequence animation supplied by design). Shipped
 * as a dist asset (like the Empty State illustrations) and fetched at runtime so
 * its ~1.6MB never enters the JS bundle. `import.meta.url` resolves the sibling
 * `assets/` folder in both `src` (Vite dev) and `dist` (built package — the
 * package build copies the file to `dist/assets/`).
 */
const LOADER_URL = new URL('./assets/leta-loader.json', import.meta.url).href;

// Module-level caches: the lottie engine import and each animation JSON are
// loaded ONCE and reused across every overlay show. Warmed at component mount
// (not first open) so the animation starts together with the text instead of
// ~1.5s late while 1.6MB downloads + parses.
let enginePromise: Promise<LottiePlayer> | null = null;
const dataPromises = new Map<string, Promise<unknown>>();

function loadEngine(): Promise<LottiePlayer> {
  enginePromise ??= import('lottie-web').then((m) => (m as { default?: LottiePlayer }).default ?? (m as unknown as LottiePlayer));
  return enginePromise;
}

function loadAnimationData(url: string): Promise<unknown> {
  let p = dataPromises.get(url);
  if (!p) {
    p = fetch(url).then((r) => r.json());
    p.catch(() => dataPromises.delete(url)); // allow a retry after a failed fetch
    dataPromises.set(url, p);
  }
  return p;
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Show the overlay. Setting this back to `false` requests dismissal — the
   * overlay stays visible until the animation completes its current cycle
   * (one full cycle minimum), then unmounts.
   */
  open: boolean;
  /**
   * Cover only the nearest positioned ancestor (`position: absolute`) instead
   * of the whole viewport (`position: fixed`). Use for region-scoped loads —
   * e.g. dimming just the table area (toolbars + table + pagination) while it
   * reloads. The parent region must be `position: relative`.
   */
  contained?: boolean;
  /** First text line (Heading/S/SemiBold, `--text-default-heading`). Default "Loading...". */
  title?: string;
  /** Second text line (Body/M/Regular, `--text-default-sub-body`). Default "Wait a few seconds.". */
  subtitle?: string;
  /**
   * Override the animation source URL (a Lottie JSON). Defaults to the LETA
   * loader shipped with the package.
   */
  animationUrl?: string;
}

/**
 * Loading Overlay — a blocking loader: a translucent white scrim over the
 * region it covers, with the LETA loader animation centered at 80×80 and two
 * stacked text lines 20px below it ("Loading..." + "Wait a few seconds.", 8px
 * apart). Shown while a view reloads — e.g. the Table Data Control's Refresh
 * button re-fetching a table.
 *
 * **Scope:** `contained` covers the nearest `position: relative` ancestor
 * (the table region); default covers the whole viewport.
 *
 * **Timing:** the Lottie engine (`lottie-web`, dynamic import — SSR-safe,
 * mirrors MapView's Leaflet pattern) and the animation JSON are **preloaded at
 * mount** and cached module-wide, so the animation starts together with the
 * text. Dismissal is cycle-aligned: when `open` flips back to `false`, the
 * overlay holds until the animation finishes its full cycle (~3.7s for the
 * LETA loader), so the loop never cuts off mid-motion.
 *
 * **When to use:** a blocking reload of a region or page (table refresh).
 * **When not to use:** inline/localized progress (Progress Tracker, Desktop
 * Progress Indicator) or per-component skeletons.
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  function LoadingOverlay(
    { open, contained = false, title = 'Loading...', subtitle = 'Wait a few seconds.', animationUrl = LOADER_URL, style, ...rest },
    ref,
  ) {
    const boxRef = React.useRef<HTMLDivElement | null>(null);
    // `visible` lags `open` on dismissal: it only flips false once the current
    // animation cycle completes (or immediately if the animation never ran).
    const [visible, setVisible] = React.useState(open);
    const openRef = React.useRef(open);
    openRef.current = open;
    const cycleDoneRef = React.useRef(false);
    const animRef = React.useRef<AnimationItem | null>(null);
    const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Warm the engine + animation data as soon as the component exists (even
    // closed) so the first show starts instantly.
    React.useEffect(() => {
      loadEngine().catch(() => {});
      loadAnimationData(animationUrl).catch(() => {});
    }, [animationUrl]);

    React.useEffect(() => {
      if (open) {
        cycleDoneRef.current = false;
        if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
        setVisible(true);
        return;
      }
      const anim = animRef.current;
      if (cycleDoneRef.current || !anim) {
        // Already completed a cycle — or the animation never started (engine/
        // asset failed, or closed before it mounted): hide immediately.
        setVisible(false);
        return;
      }
      // Cycle in progress: the 'loopComplete' listener hides us. Belt-and-braces
      // fallback timer for when the ticker is throttled/suspended (hidden tab —
      // rAF pauses and 'loopComplete' would never arrive): hide after the time
      // left in the current cycle.
      const duration = anim.getDuration() || 4; // seconds
      const progress = anim.totalFrames > 0 ? anim.currentFrame / anim.totalFrames : 0;
      const remainingMs = Math.max(0, duration * (1 - progress) * 1000) + 100;
      closeTimerRef.current = setTimeout(() => setVisible(false), remainingMs);
      return () => {
        if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      };
    }, [open]);

    // Create the animation while visible; destroy it when hidden.
    React.useEffect(() => {
      if (!visible) return;
      let cancelled = false;
      (async () => {
        try {
          const [lottie, data] = await Promise.all([loadEngine(), loadAnimationData(animationUrl)]);
          if (cancelled || !boxRef.current) return;
          const anim = lottie.loadAnimation({
            container: boxRef.current,
            renderer: 'canvas',
            loop: true,
            autoplay: true,
            animationData: data,
          });
          animRef.current = anim;
          anim.addEventListener('loopComplete', () => {
            cycleDoneRef.current = true;
            if (!openRef.current) setVisible(false);
          });
        } catch {
          // Loader animation is decorative — the scrim + text still communicate
          // the loading state. Without an animation there is no cycle to wait
          // for, so a pending close applies immediately.
          if (!cancelled && !openRef.current) setVisible(false);
        }
      })();
      return () => {
        cancelled = true;
        animRef.current?.destroy();
        animRef.current = null;
      };
    }, [visible, animationUrl]);

    if (!visible) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        style={{
          position: contained ? 'absolute' : 'fixed',
          inset: 0,
          zIndex: contained ? 100 : 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // No scrim token exists — translucent white over the dimmed region
          // (--surface-neutral-bg-default #FEFEFE @ 85%), per the LETA console.
          backgroundColor: 'rgba(254, 254, 254, 0.85)',
          ...style,
        }}
        {...rest}
      >
        <div ref={boxRef} aria-hidden style={{ width: 80, height: 80 }} />
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-8px)',
            textAlign: 'center',
          }}
        >
          <span className="text-heading-s-semibold" style={{ color: 'var(--text-default-heading)' }}>{title}</span>
          <span className="text-body-m-regular" style={{ color: 'var(--text-default-sub-body)' }}>{subtitle}</span>
        </div>
      </div>
    );
  },
);
