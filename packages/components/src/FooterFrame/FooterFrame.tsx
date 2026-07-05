import * as React from 'react';

export type FooterFrameVariant =
  | 'default'
  | 'tertiary-action'
  | 'data-summary'
  | 'preference'
  | 'validation'
  | 'card';

export interface FooterFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which footer treatment. Drives height / padding / background. Default `default`. */
  variant?: FooterFrameVariant;
  /**
   * Leading-content slot (left edge) — e.g. a tertiary Button, a Selection
   * Control, a Notification Banner, or a data-summary row. Omit (or `default`
   * variant) to right-align the actions with nothing on the left.
   */
  leading?: React.ReactNode;
  /** Trailing actions — pass the footer's Button(s); laid out in a right-aligned row, gap 8. */
  children?: React.ReactNode;
  /**
   * Apply the subtle upward scroll-affordance drop shadow (Figma) — set this
   * whenever the footer pins below a **scrollable** region so it reads as separated
   * from the content scrolling under it.
   *
   * **Static (`true`)** — always shows the shadow; right for containers that are
   * always scrollable (e.g. Desktop Dropdowns Basic Filter / Filter Group).
   *
   * **Dynamic** — for containers that may or may not overflow, use the companion
   * `useScrollShadow(containerRef)` hook instead of hardcoding `true`. The hook
   * returns `true` only while there is content below the fold, and `false` once
   * scrolled to the bottom:
   * ```tsx
   * const bodyRef = useRef<HTMLDivElement>(null);
   * const scrollShadow = useScrollShadow(bodyRef);
   *
   * <div ref={bodyRef} style={{ overflowY: 'auto', maxHeight: 300 }}>{items}</div>
   * <FooterFrame scrollShadow={scrollShadow}>…</FooterFrame>
   * ```
   *
   * **`ModalShell` is handled automatically** — passing `bodyHeight` or `fillHeight`
   * activates the same logic internally; you do not pass `scrollShadow` to the
   * `FooterFrame` inside a `ModalShell`.
   *
   * **Applies to every variant EXCEPT `card`** — Card footers are flush/transparent
   * and never show this shadow (passing `scrollShadow` on a `card` is a no-op).
   */
  scrollShadow?: boolean;
}

/** height (px) per variant — matches Figma's fixed footer heights (`6448:32008`).
 * All modal variants are a uniform 72px (was 80/88); Card stays 40. */
const HEIGHT: Record<FooterFrameVariant, number> = {
  default: 72,
  'tertiary-action': 72,
  'data-summary': 72,
  preference: 72,
  validation: 72,
  card: 40,
};

/**
 * Footer Frame — the bottom action region of modals, cards, and panels. A
 * horizontal shell with optional leading content on the left and a right-aligned
 * row of action buttons on the right.
 *
 * **When to use:** any surface (modal / card / panel) that needs committed
 * actions or a contextual summary pinned at its base.
 *
 * **When NOT to use:** for inline actions within body content.
 *
 * Slot-based, mirroring Figma `6448:32008` (`Leading Content` SLOT + trailing
 * actions). `variant` only sets dimensions/background; the caller slots the
 * leading content and the action buttons:
 * - **default** — actions only (right-aligned), 72px.
 * - **tertiary-action** — a low-priority/destructive Button set apart on the left.
 * - **data-summary** — a row of stat blocks on the left (Title/Subtext × N split by
 *   vertical demarcators); 72px. Also used as the Desktop Dropdowns Basic Filter footer.
 * - **preference** — a persistent preference control (e.g. a Selection Control).
 * - **validation** — a validation/error Notification Banner.
 * - **card** — compact (40px, no padding, transparent) for Card surfaces.
 */
export const FooterFrame = React.forwardRef<HTMLDivElement, FooterFrameProps>(
  function FooterFrame({ variant = 'default', leading, children, scrollShadow = false, style, ...rest }, ref) {
    const isCard = variant === 'card';
    const hasLeading = leading != null && leading !== false;

    // Modal footer variants (everything except card) have:
    //   - NO top border (Figma removed the footer top outline across all variants;
    //     scrolling modals show a drop shadow via ModalShell instead)
    //   - bottom-left + bottom-right radius: 12px (--rounding-xl), top corners 0
    //   - bg: --surface-neutral-bg-default, padding 20
    // Card footer: no radius, no fill, no padding.
    return (
      <div
        ref={ref}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: hasLeading ? 'space-between' : 'flex-end',
          // Outer gap between leading and trailing zones = 10px (Figma);
          // the trailing buttons' own gap is 8px (handled on the inner flex).
          gap: 10,
          width: '100%',
          height: HEIGHT[variant],
          padding: isCard ? 0 : 'var(--padding-16px)',
          backgroundColor: isCard ? 'transparent' : 'var(--surface-neutral-bg-default)',
          // No top border (Figma removed the footer's top outline across all
          // variants — scrolling modals now signal overflow with a drop shadow
          // from ModalShell instead).
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: 'none',
          // Bottom-left + bottom-right rounded (modal footer sits at the bottom
          // of a modal/panel whose corners are rounded); Card = 0 (flush).
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: isCard ? 0 : 'var(--rounding-xl)',
          borderBottomRightRadius: isCard ? 0 : 'var(--rounding-xl)',
          // Subtle upward scroll-affordance shadow (Figma) when pinned below a
          // scrolling region — separates the footer from the content scrolling
          // under it. Applies to every variant EXCEPT `card` (Card footers are
          // flush/transparent and never carry this shadow).
          boxShadow: scrollShadow && !isCard ? '-2px -0.8px 8px rgba(79, 79, 79, 0.1)' : undefined,
          ...style,
        }}
        {...rest}
      >
        {hasLeading && <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>{leading}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8px)', flexShrink: 0 }}>
          {children}
        </div>
      </div>
    );
  },
);
