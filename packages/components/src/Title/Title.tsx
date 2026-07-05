import * as React from 'react';

export type TitleVariant = 'page-dialog' | 'card';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading text. @default 'Heading 1' (matches Figma default). */
  text?: string;
  /**
   * Visual variant — matches Figma `Property 1`.
   * - `page-dialog` → Heading/M/SemiBold (24px / 28px line-height)
   * - `card`        → Body/L/SemiBold (16px / 24px line-height)
   * @default 'page-dialog'
   */
  variant?: TitleVariant;
  /**
   * Semantic heading level to render. The visual size is controlled by
   * `variant` — `as` only affects the underlying HTML tag for accessibility
   * and document outline purposes.
   * @default 'h2'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const VARIANT_CLASS: Record<TitleVariant, string> = {
  'page-dialog': 'text-heading-m-semibold', // 24px / 28px / -0.4 / SemiBold
  card:          'text-body-l-semibold',    // 16px / 24px / -0.28 / SemiBold
};

/**
 * Title — non-interactive heading element from Figma `6767:26920` ("Titles").
 *
 * Two variants:
 * - **Page & Dialog Title** — top-level page or modal heading
 * - **Card Title** — section / card heading
 *
 * The semantic HTML element is decoupled from the visual variant — callers
 * pick `as` to fit their document outline, and `variant` to control size.
 */
export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  function Title(
    {
      text = 'Heading 1',
      variant = 'page-dialog',
      as = 'h2',
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const Tag = as as React.ElementType;
    return (
      <Tag
        ref={ref}
        className={`${VARIANT_CLASS[variant]}${className ? ` ${className}` : ''}`}
        style={{
          color: 'var(--text-default-heading)',
          margin: 0,
          ...style,
        }}
        {...rest}
      >
        {text}
      </Tag>
    );
  },
);
