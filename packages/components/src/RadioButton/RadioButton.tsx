import * as React from 'react';

const PATH_IDLE =
  'M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Z';
const PATH_ACTIVE =
  'M612-348q54-54 54-132t-54-132q-54-54-132-54t-132 54q-54 54-54 132t54 132q54 54 132 54t132-54ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Z';

export interface RadioButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  id?: string;
  name?: string;
  value?: string;
}

export const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  function RadioButton(
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
    const isChecked = isControlled ? (checked as boolean) : internal;

    const path = isChecked ? PATH_ACTIVE : PATH_IDLE;
    const fill = disabled
      ? 'var(--icons-disabled-default)'
      : isChecked
        ? 'var(--icons-secondary-default)'
        : 'var(--icons-neutral-idle)';

    return (
      <label
        className={className}
        style={{
          // Anchor the visually-hidden absolute <input> here so it can't escape a
          // scroll-clipping ancestor and inflate document height (see Checkbox).
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
          ref={ref}
          type="radio"
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
