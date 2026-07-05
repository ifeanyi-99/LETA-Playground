import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Storybook config for the LETA design system.
 *
 * Story discovery covers:
 * - This app's `src/` (foundations, intro, etc.)
 * - The components package (`@leta/components`)
 * - The icons package (`@leta/icons`)
 *
 * Ordering is enforced via `storyOrder` in preview.ts so Foundations always
 * appears first.
 */
const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
    '../../../packages/components/src/**/*.stories.@(ts|tsx)',
    '../../../packages/icons/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    // Skip docgen for now — it's slow and we'll re-enable per-component once
    // we have stable component APIs to document.
    reactDocgen: false,
  },
};

export default config;
