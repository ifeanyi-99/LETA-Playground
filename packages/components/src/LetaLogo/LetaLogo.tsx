import * as React from 'react';

const SYMBOL_SIZES = { small: 24, medium: 56, large: 120 } as const;

export interface LetaLogoProps extends Omit<React.SVGProps<SVGSVGElement>, 'type'> {
  type?: 'symbol' | 'wordmark';
  size?: 'small' | 'medium' | 'large';
}

export const LetaLogo = React.forwardRef<SVGSVGElement, LetaLogoProps>(
  function LetaLogo({ type = 'symbol', size = 'small', ...rest }, ref) {
    if (type === 'wordmark') {
      return (
        <svg
          ref={ref}
          width={68}
          height={16}
          viewBox="0 0 68 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="LETA"
          {...rest}
        >
          <path
            d="M0 16V0H3.54467V12.8237H10.3175V16H0Z"
            fill="var(--primitive-colors-coral-red-default)"
          />
          <path
            d="M28.9054 0V3.18211H20.9982V6.4811H28.1119V9.53621H20.9982V12.8569H29.156V16H17.4521V0H28.9054Z"
            fill="var(--primitive-colors-coral-red-default)"
          />
          <path
            d="M43.2434 3.09119V16H39.6987V3.09119H35.2002V0H47.7447V3.09119H43.2448H43.2434Z"
            fill="var(--primitive-colors-coral-red-default)"
          />
          <path
            d="M58.9888 0L50.4014 16H54.6922L58.9773 7.99639L58.9802 8.00216L58.9845 7.99639L61.3018 12.3171H61.2989L63.2767 16H67.5762L58.9888 0Z"
            fill="var(--primitive-colors-coral-red-default)"
          />
          <path
            d="M60.4169 16L58.9875 13.3389L57.5625 16H60.4169Z"
            fill="var(--primitive-colors-coral-red-default)"
          />
        </svg>
      );
    }

    const px = SYMBOL_SIZES[size];
    return (
      <svg
        ref={ref}
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="LETA"
        {...rest}
      >
        <path
          d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z"
          fill="var(--primitive-colors-coral-red-default)"
        />
        <path
          d="M15.1234 6L13.6344 8.76126H13.6368L11.8914 11.9988H11.889L8.64468 6H5.40039L11.884 18L18.3652 6H15.1234Z"
          fill="var(--colors-neutral-white)"
        />
        <path
          d="M10.9395 6L11.8886 7.75447L12.8352 6H10.9395Z"
          fill="var(--colors-neutral-white)"
        />
      </svg>
    );
  },
);
