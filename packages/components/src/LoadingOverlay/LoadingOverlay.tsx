import * as React from 'react';
import type { AnimationItem } from 'lottie-web';

/**
 * The LETA loader Lottie (image-sequence animation supplied by design). Shipped
 * as a dist asset (like the Empty State illustrations) and fetched at runtime so
 * its ~1.6MB never enters the JS bundle. `import.meta.url` resolves the sibling
 * `assets/` folder in both `src` (Vite dev) and `dist` (built package — the
 * package build copies the file to `dist/assets/`).
 */
const LOADER_URL = new URL('./assets/leta-loader.json', import.meta.url).href;

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the overlay. When false, renders nothing. */
  open: boolean;
  /** First text line (Heading/S/SemiBold, on-color heading). Default "Loading...". */
  title?: string;
  /** Second text line (Body/M/Regular, on-color body). Default "Wait a few seconds.". */
  subtitle?: string;
  /**
   * Override the animation source URL (a Lottie JSON). Defaults to the LETA
   * loader shipped with the package.
   */
  animationUrl?: string;
}

/**
 * Loading Overlay — a full-viewport blocking loader: a dim scrim over the entire
 * page with the LETA loader animation centered at 80×80 and two stacked text
 * lines 20px below it ("Loading..." + "Wait a few seconds.", 8px apart, in the
 * on-color text tokens). Shown while a view reloads — e.g. the Table Data
 * Control's Refresh button re-fetching a table.
 *
 * The Lottie engine (`lottie-web`) is loaded client-side via dynamic import
 * (SSR-safe, mirrors MapView's Leaflet pattern) and the animation JSON is
 * fetched from the package's dist assets; both happen only when `open` first
 * becomes true. Renders with the canvas renderer (the LETA loader is an
 * image-sequence Lottie — canvas rasterizes it cheaply at 80×80).
 *
 * **When to use:** a blocking, whole-page reload (table refresh, view reload).
 * **When not to use:** inline/localized progress (Progress Tracker, Desktop
 * Progress Indicator) or per-component skeletons.
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  function LoadingOverlay(
    { open, title = 'Loading...', subtitle = 'Wait a few seconds.', animationUrl = LOADER_URL, style, ...rest },
    ref,
  ) {
    const boxRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!open) return;
      let anim: AnimationItem | null = null;
      let cancelled = false;
      (async () => {
        try {
          const [lottie, data] = await Promise.all([
            import('lottie-web').then((m) => m.default ?? m),
            fetch(animationUrl).then((r) => r.json()),
          ]);
          if (cancelled || !boxRef.current) return;
          anim = lottie.loadAnimation({
            container: boxRef.current,
            renderer: 'canvas',
            loop: true,
            autoplay: true,
            animationData: data,
          });
        } catch {
          // Loader animation is decorative — the scrim + text still communicate
          // the loading state if the engine or asset fails to load.
        }
      })();
      return () => {
        cancelled = true;
        anim?.destroy();
      };
    }, [open, animationUrl]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // No scrim token exists in the token set — dim with neutral-900 @ 60%.
          backgroundColor: 'rgba(16, 16, 16, 0.6)',
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
          <span className="text-heading-s-semibold" style={{ color: 'var(--text-on-color-heading)' }}>{title}</span>
          <span className="text-body-m-regular" style={{ color: 'var(--text-on-color-body)' }}>{subtitle}</span>
        </div>
      </div>
    );
  },
);
