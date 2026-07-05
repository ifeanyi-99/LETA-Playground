import * as React from 'react';

export interface ShortcutProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Keys in the combination, in order (e.g. `['Ctrl', 'K']`). Each renders as its own keycap. */
  keys: string[];
  /** Muted styling for when the parent option's key binding is unavailable. */
  disabled?: boolean;
}

/**
 * Shortcut — a compact, contextual inline element placed at the trailing edge
 * of dropdown menu items, command-palette rows, or list items. It surfaces the
 * keyboard combination that triggers that action, reinforcing power-user
 * workflows and discoverability.
 *
 * **When to use:** beside an actionable menu/command/list item that has a
 * keyboard binding.
 *
 * **When NOT to use:** for non-actionable text, or where no shortcut exists.
 *
 * 2 states (`7259:81045`): **Idle** — operational, full emphasis; **Disabled** —
 * muted, communicates the shortcut can't be triggered right now. Each key renders
 * as a semantic `<kbd>` keycap.
 */
export const Shortcut = React.forwardRef<HTMLSpanElement, ShortcutProps>(
  function Shortcut({ keys, disabled = false, className, style, ...rest }, ref) {
    const bg = disabled ? 'var(--surface-disabled-bg)' : 'var(--surface-neutral-bg-default)';
    const border = disabled ? 'var(--border-disabled-default)' : 'var(--border-neutral-default)';
    const textColor = disabled ? 'var(--text-disabled-label)' : 'var(--text-default-label-idle)';

    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--spacing-4px)',
          // Disabled dims the whole row. `--opacity-60` resolves to the buggy
          // `60px` in the token pipeline, so use the literal 0.6 (cf. WizardTab).
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
        {...rest}
      >
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="text-label-s-regular"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              paddingTop: 'var(--padding-2px)',
              paddingBottom: 'var(--padding-2px)',
              paddingLeft: 'var(--padding-6px)',
              paddingRight: 'var(--padding-6px)',
              borderRadius: 'var(--rounding-md)',
              backgroundColor: bg,
              // Figma strokeAlign INSIDE (1px) → inset shadow keeps the box size stable.
              boxShadow: `inset 0 0 0 var(--stroke-xs) ${border}`,
              color: textColor,
              fontStyle: 'normal',
            }}
          >
            {key}
          </kbd>
        ))}
      </span>
    );
  },
);
