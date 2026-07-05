import * as React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

/** All codes accepted by the underlying library. */
type LibraryCode = keyof typeof Flags;

/**
 * Maps Figma-only codes that don't exist in country-flag-icons to the
 * closest available equivalent.
 */
const CODE_OVERRIDES: Record<string, LibraryCode> = {
  'YT-UNF': 'YT', // Mayotte (Figma uses YT-UNF, library has YT)
  'GB-UKM': 'GB', // United Kingdom (Figma uses GB-UKM, library has GB)
};

export interface FlagProps extends React.SVGProps<SVGSVGElement> {
  /**
   * ISO 3166-1 alpha-2 country code, e.g. "US", "DE", "GB".
   * Subdivision codes from Figma (e.g. "GB-ENG", "BQ-BO") are also accepted.
   */
  code: string;
}

export const Flag = React.forwardRef<SVGSVGElement, FlagProps>(
  function Flag({ code, width = 20, height = 15, ...rest }, ref) {
    const normalized = (CODE_OVERRIDES[code] ?? code) as LibraryCode;
    const FlagSvg = Flags[normalized] as React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined;

    if (!FlagSvg) {
      return (
        <svg
          ref={ref}
          width={width}
          height={height}
          viewBox="0 0 20 15"
          aria-label={`Flag: ${code}`}
          {...rest}
        >
          <rect width="20" height="15" fill="var(--colors-neutral-200)" rx="1" />
        </svg>
      );
    }

    return <FlagSvg ref={ref} width={width} height={height} {...rest} />;
  },
);
