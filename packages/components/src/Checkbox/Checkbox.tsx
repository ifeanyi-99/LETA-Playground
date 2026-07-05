import * as React from 'react';

const PATH_IDLE =
  'M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Z';
const PATH_ACTIVE =
  'm419-407-98-98q-9-9-21-9t-21 9q-9 9-9 21.5t9 21.5l119 120q9 9 21 9t21-9l247-248q9-9 9-21t-9-21q-9-9-21.5-9t-21.5 9L419-407ZM180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Z';
const PATH_INDETERMINATE =
  'M280-452h401q13 0 21.5-8.5T711-482q0-13-8.5-21.5T681-512H280q-13 0-21.5 8.5T250-482q0 13 8.5 21.5T280-452ZM180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Z';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked = false,
      indeterminate = false,
      disabled = false,
      onChange,
      className,
      ...rest
    },
    ref,
  ) {
    const isControlled = checked !== undefined;
    const [internal, setInternal] = React.useState(defaultChecked);
    const isChecked = isControlled ? (checked as boolean) : internal;

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const path = indeterminate
      ? PATH_INDETERMINATE
      : isChecked
        ? PATH_ACTIVE
        : PATH_IDLE;

    const fill = disabled
      ? 'var(--icons-disabled-default)'
      : isChecked || indeterminate
        ? 'var(--icons-secondary-default)'
        : 'var(--icons-neutral-idle)';

    return (
      <label
        className={className}
        style={{
          // `position: relative` anchors the visually-hidden absolute <input> to
          // this label. Without it the input's containing block falls back to
          // <body>, so it escapes any scroll-clipping ancestor (e.g. a table body
          // scroller) and inflates document height → a phantom page scroll.
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          width: 30,
          height: 30,
          padding: 'var(--padding-6px)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 'var(--opacity-60)' : 1,
        }}
      >
        <input
          ref={inputRef}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => {
            if (!isControlled) setInternal(e.target.checked);
            onChange?.(e.target.checked);
          }}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          {...rest}
        />
        <svg width={18} height={18} viewBox="0 -960 960 960" fill={fill} aria-hidden="true">
          <path d={path} />
        </svg>
      </label>
    );
  },
);
