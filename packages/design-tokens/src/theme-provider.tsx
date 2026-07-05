import * as React from 'react';

export type LetaTheme = 'light' | 'dark';

export interface LetaThemeContextValue {
  theme: LetaTheme;
  setTheme: (theme: LetaTheme) => void;
  toggleTheme: () => void;
}

const Context = React.createContext<LetaThemeContextValue | null>(null);

export interface LetaThemeProviderProps {
  /** Initial theme. Defaults to "light". */
  defaultTheme?: LetaTheme;
  /** Controlled theme — when provided, the provider does not own state. */
  theme?: LetaTheme;
  /** Called whenever the theme changes (controlled or uncontrolled). */
  onThemeChange?: (theme: LetaTheme) => void;
  /**
   * Element to apply `data-theme` to. Defaults to `documentElement` (the <html> tag),
   * which makes the cascade affect the whole document. Set to "container" to apply
   * the attribute to the wrapping `<div>` instead — useful for side-by-side previews.
   */
  target?: 'documentElement' | 'container';
  children?: React.ReactNode;
}

/**
 * Sets `data-theme` on the chosen target so the cascade in `tokens.css`
 * picks the right theme. Mode-switching for Mapped Colors is the only runtime
 * axis here — Mapped Type / Mapped Sizes follow CSS breakpoint media queries
 * and don't need React state.
 */
export function LetaThemeProvider({
  defaultTheme = 'light',
  theme: controlledTheme,
  onThemeChange,
  target = 'documentElement',
  children,
}: LetaThemeProviderProps): React.ReactElement {
  const [uncontrolled, setUncontrolled] = React.useState<LetaTheme>(defaultTheme);
  const isControlled = controlledTheme !== undefined;
  const theme = isControlled ? controlledTheme : uncontrolled;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setTheme = React.useCallback(
    (next: LetaTheme) => {
      if (!isControlled) setUncontrolled(next);
      onThemeChange?.(next);
    },
    [isControlled, onThemeChange],
  );

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Apply data-theme to the chosen target. For documentElement we set on <html>;
  // for "container" the attribute lives on the wrapping div so multiple themed
  // previews can coexist on a single page.
  React.useEffect(() => {
    if (target !== 'documentElement') return;
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    root.setAttribute('data-theme', theme);
    return () => {
      if (previous === null) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', previous);
    };
  }, [target, theme]);

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  if (target === 'container') {
    return (
      <Context.Provider value={value}>
        <div ref={containerRef} data-theme={theme}>
          {children}
        </div>
      </Context.Provider>
    );
  }

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/**
 * Read or update the current LETA theme. Throws if called outside a
 * <LetaThemeProvider>, which catches accidental usage in unwrapped trees.
 */
export function useLetaTheme(): LetaThemeContextValue {
  const ctx = React.useContext(Context);
  if (!ctx) {
    throw new Error('useLetaTheme must be used inside a <LetaThemeProvider>');
  }
  return ctx;
}
