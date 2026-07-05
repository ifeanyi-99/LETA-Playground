import * as React from 'react';
import { ContentPrimitives } from '../ContentPrimitives/ContentPrimitives.js';
import { RadioButton } from '../RadioButton/RadioButton.js';

export interface OptionCardProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'onChange'> {
  /** Card title (Label/M/SemiBold). */
  title: string;
  /** Supporting description (Body/M/Regular). */
  description?: string;
  /**
   * Trailing element rendered on the right of the card. The Option Card is
   * built on the **Utility Content Primitive**, so its trailing slot is fully
   * composable — pass any `ReactNode` (a `<Badge>`, a metadata `<span>`, a CTA
   * `<Button>`, an icon, etc.).
   *
   * When omitted, defaults to a `<RadioButton>` driven by
   * `selected` / `onChange` / `name` / `value` (the mutually-exclusive-choice
   * case). Provide `trailing` to opt out of the radio entirely.
   */
  trailing?: React.ReactNode;
  /**
   * Whether to render the trailing content area at all. Defaults to `true`.
   * Set `false` for a card with **no trailing element** (e.g. the Multi-choice
   * modal's cards, where selection is shown by the Active border alone).
   */
  showTrailing?: boolean;
  /** Whether this option is selected (Active state). Drives the default radio. */
  selected?: boolean;
  /** Fires when the option is chosen (default radio only). */
  onChange?: (selected: boolean) => void;
  /** Disables interaction. */
  disabled?: boolean;
  /** Radio group name (default radio only — for mutually-exclusive selection). */
  name?: string;
  /** Radio value (default radio only). */
  value?: string;
  /**
   * Force a visual state (Figma `State` axis). When set, overrides the
   * interactive hover/pressed/selected derivation — useful for catalogs/snapshots.
   * `"focus"` renders the focus ring statically.
   */
  state?: OptionCardState;
}

const STYLE_ID = 'leta-option-card-styles';
const STYLES = `
  /* The focusable element is the nested radio <input>; draw the focus ring
     around the whole card when it's keyboard-focused (Figma Focus variant). */
  .leta-option-card:has(:focus-visible) {
    outline: var(--stroke-sm) solid var(--border-secondary-component-focus);
    outline-offset: 4px;
  }
`;

function ensureStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = STYLES;
  document.head.appendChild(el);
}

export type OptionCardState = 'idle' | 'hover' | 'pressed' | 'active' | 'focus';

const SURFACE: Record<OptionCardState, string> = {
  idle: 'var(--surface-neutral-card-idle)',
  hover: 'var(--surface-neutral-card-hover)',
  pressed: 'var(--surface-neutral-card-pressed)',
  active: 'var(--surface-neutral-card-active)',
  focus: 'var(--surface-neutral-card-idle)',
};
const BORDER: Record<OptionCardState, string> = {
  idle: 'var(--border-neutral-card-idle)',
  hover: 'var(--border-neutral-card-hover)',
  pressed: 'var(--border-neutral-card-pressed)',
  active: 'var(--border-secondary-card-active)',
  focus: 'var(--border-neutral-card-idle)',
};
/**
 * Per Figma `9894:18459`, Hover keeps the idle fill/border and is distinguished
 * solely by a drop shadow ("Neutral Drop Shadow 1"); the other states have none.
 */
const SHADOW: Record<OptionCardState, string | null> = {
  idle: null,
  hover: 'var(--shadow-neutral-1)',
  pressed: null,
  active: null,
  focus: null,
};

/**
 * Option Card (`9894:18459`) — a full-width selectable card built on the
 * **Utility Content Primitive**: a title + description on the left and a
 * composable **trailing element** on the right.
 *
 * **What it is:** a card-shaped choice surface. The single `State` axis drives
 * its appearance — Idle / Hover / Pressed / Active / Focus.
 *
 * **Trailing element is not fixed to a radio.** Because the card is composed
 * from the Utility Content Primitive, its trailing slot is fully composable.
 * It defaults to a `<RadioButton>` (the mutually-exclusive-choice case, driven
 * by `selected` / `onChange` / `name` / `value`), but pass `trailing` to render
 * **anything** — a metadata `<span>`, a `<Badge>`, a CTA `<Button>`, an icon,
 * a `<Checkbox>`, etc. — or `showTrailing={false}` for **no trailing element**
 * at all (selection shown by the Active border alone, e.g. the Multi-choice modal).
 *
 * **States:**
 * - **Idle** — neutral fill + 1px neutral border.
 * - **Hover** — same fill/border, distinguished only by a Neutral Drop Shadow 1.
 * - **Pressed** — slightly darker fill/border.
 * - **Active** — navy border (1.5px) + (default radio) filled.
 * - **Focus** — standard 1.5px focus ring at 4px offset (drawn around the card
 *   when the nested focusable trailing element is keyboard-focused).
 *
 * **When to use:** presenting a small set of selectable options, each with a
 * label + supporting copy.
 * **When NOT to use:** dense lists (use a list/menu row) or non-selectable
 * informational cards (use Content Card).
 */
export const OptionCard = React.forwardRef<HTMLLabelElement, OptionCardProps>(
  function OptionCard(
    {
      title,
      description = 'Enter description here',
      trailing,
      showTrailing = true,
      selected = false,
      onChange,
      disabled = false,
      name,
      value,
      state: forcedState,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      ...rest
    },
    ref,
  ) {
    ensureStyles();

    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);

    const state: OptionCardState =
      forcedState ??
      (selected ? 'active' : pressed ? 'pressed' : hovered ? 'hover' : 'idle');

    const rootStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-16px)',
      width: '100%',
      boxSizing: 'border-box',
      padding: 'var(--padding-16px)',
      borderRadius: 'var(--rounding-xl)',
      backgroundColor: SURFACE[state],
      boxShadow: [`inset 0 0 0 ${state === 'active' ? 'var(--stroke-sm)' : 'var(--stroke-xs)'} ${BORDER[state]}`, SHADOW[state]]
        .filter(Boolean)
        .join(', '),
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: 'background-color 120ms ease, box-shadow 120ms ease',
      // Forced focus state renders the ring statically; real keyboard focus is
      // handled by the `.leta-option-card:has(:focus-visible)` CSS rule.
      ...(state === 'focus'
        ? {
            outline: 'var(--stroke-sm) solid var(--border-secondary-component-focus)',
            outlineOffset: 4,
          }
        : {}),
      ...style,
    };

    return (
      <label
        ref={ref}
        className={`leta-option-card${className ? ` ${className}` : ''}`}
        style={rootStyle}
        onMouseEnter={(e) => {
          if (!disabled) setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          setPressed(false);
          onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          if (!disabled) setPressed(true);
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          setPressed(false);
          onMouseUp?.(e);
        }}
        {...rest}
      >
        <ContentPrimitives
          type="utility"
          text={title}
          subtext={description}
          showVisualAnchor={false}
          showTrailingContent={showTrailing}
          showPassiveElements={false}
          showInteractiveElements={showTrailing}
          contentAlign="top"
          interactiveElements={
            showTrailing
              ? trailing ?? (
                  <RadioButton
                    checked={selected}
                    disabled={disabled}
                    name={name}
                    value={value}
                    aria-label={title}
                    onChange={(checked) => onChange?.(checked)}
                  />
                )
              : undefined
          }
        />
      </label>
    );
  },
);
