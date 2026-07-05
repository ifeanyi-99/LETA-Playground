import * as React from 'react';

// Geometry exported directly from Figma (Toggle State=Off / State=On glyphs),
// already in a 36×20 viewBox so the pill fills its box exactly. A square
// `0 -960 960 960` Material Symbols viewBox would uniformly downscale the pill
// to ~18.33×10 (half size) — see the toggle-sizing note in PLAN.md.
const TOGGLE_OFF_PATH =
  'M9.81818 20C7.09091 20 4.77273 19.0278 2.86364 17.0833C0.954545 15.1389 0 12.7778 0 10C0 7.22222 0.954545 4.86111 2.86364 2.91667C4.77273 0.972222 7.09091 0 9.81818 0H26.1818C28.9091 0 31.2273 0.972222 33.1364 2.91667C35.0455 4.86111 36 7.22222 36 10C36 12.7778 35.0455 15.1389 33.1364 17.0833C31.2273 19.0278 28.9091 20 26.1818 20H9.81818ZM9.81818 15C11.1818 15 12.3409 14.5139 13.2955 13.5417C14.25 12.5694 14.7273 11.3889 14.7273 10C14.7273 8.61111 14.25 7.43056 13.2955 6.45833C12.3409 5.48611 11.1818 5 9.81818 5C8.45455 5 7.29545 5.48611 6.34091 6.45833C5.38636 7.43056 4.90909 8.61111 4.90909 10C4.90909 11.3889 5.38636 12.5694 6.34091 13.5417C7.29545 14.5139 8.45455 15 9.81818 15Z';
const TOGGLE_ON_PATH =
  'M9.81818 20C7.09091 20 4.77273 19.0278 2.86364 17.0833C0.954545 15.1389 0 12.7778 0 10C0 7.22222 0.954545 4.86111 2.86364 2.91667C4.77273 0.972222 7.09091 0 9.81818 0H26.1818C28.9091 0 31.2273 0.972222 33.1364 2.91667C35.0455 4.86111 36 7.22222 36 10C36 12.7778 35.0455 15.1389 33.1364 17.0833C31.2273 19.0278 28.9091 20 26.1818 20H9.81818ZM26.1818 15C27.5455 15 28.7045 14.5139 29.6591 13.5417C30.6136 12.5694 31.0909 11.3889 31.0909 10C31.0909 8.61111 30.6136 7.43056 29.6591 6.45833C28.7045 5.48611 27.5455 5 26.1818 5C24.8182 5 23.6591 5.48611 22.7045 6.45833C21.75 7.43056 21.2727 8.61111 21.2727 10C21.2727 11.3889 21.75 12.5694 22.7045 13.5417C23.6591 14.5139 24.8182 15 26.1818 15Z';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      checked,
      defaultChecked = false,
      disabled = false,
      onChange,
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked);
    const isOn = isControlled ? (checked as boolean) : internal;

    const toggle = () => {
      if (disabled) return;
      if (!isControlled) setInternal(!isOn);
      onChange?.(!isOn);
    };

    const color = disabled
      ? 'var(--surface-disabled-toggle-disabled)'
      : isOn
        ? 'var(--surface-success-toggle-active)'
        : 'var(--surface-neutral-toggle)';

    const hoverColor = isOn
      ? 'var(--surface-success-toggle-hover)'
      : 'var(--surface-neutral-toggle-hover)';

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={toggle}
        className={className}
        style={{
          all: 'unset',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: 44,
          height: 40,
          paddingLeft: 'var(--padding-4px)',
          paddingRight: 'var(--padding-4px)',
          paddingTop: 'var(--padding-10px)',
          paddingBottom: 'var(--padding-10px)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          ['--toggle-color' as string]: color,
          ['--toggle-color-hover' as string]: hoverColor,
        }}
        {...rest}
      >
        <svg
          width={36}
          height={20}
          viewBox="0 0 36 20"
          fill="var(--toggle-color)"
          style={{
            display: 'block',
            transition: 'fill 300ms ease-out',
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.fill = 'var(--toggle-color-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.fill = 'var(--toggle-color)';
          }}
        >
          <path d={isOn && !disabled ? TOGGLE_ON_PATH : TOGGLE_OFF_PATH} />
        </svg>
      </button>
    );
  },
);
