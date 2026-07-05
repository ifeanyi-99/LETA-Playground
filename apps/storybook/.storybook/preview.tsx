import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import * as React from 'react';

// Bring in all design-token CSS so every story renders with full token cascade.
import '@leta/design-tokens/css';
import '@leta/design-tokens/text-styles.css';
import '@leta/design-tokens/scroll-utilities.css';
import '@leta/design-tokens/fonts';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      // Ensure Foundations always appears first; within Tokens, group by token category.
      storySort: {
        order: [
          'Foundations',
          [
            'Intro',
            'Tokens',
            [
              'Colors',
              'Typography',
              ['Display', 'Heading', 'Body', 'Label', 'Caption'],
              'Padding',
              'Spacing',
              'Rounding',
              'Stroke',
              'Opacity',
            ],
            '*',
          ],
          'Atoms',
          [
            // Tab/heading group — adjacent and in this specific order
            'ViewSwitcherTab',
            'SegmentSwitcherTab',
            'PageTab',
            'WizardTab',
            'Title',
            '*', // everything else alphabetically
          ],
          'Molecules',
          [
            // Form Controls folder — components in the explicit order below
            'Form Controls',
            [
              'Leading Input Field Element',
              'Trailing Input Field Element',
              'Input Field',
              'Search Input', // → Desktop, Mobile
              'Map Search Input', // → Desktop, Mobile
              'Select',
              'File Upload',
              'Mobile File Upload',
              'Selection Control',
              'Text Area',
              'Stepper Input',
              'Stepper',
              'Grouped Input',
            ],
            // Cards folder — components in the explicit order below
            'Cards',
            [
              'Option Card',
              'Configuration Card',
              'Content Card',
              'Metric Card',
              'File Upload Card',
            ],
            'Date & Time Pickers',
            ['Desktop', 'Mobile'],
            // Table Cells folder — components in the explicit order below
            'Table Cells',
            ['Cell', 'Duration Labels'],
            '*', // other molecules alphabetically
          ],
          'Organisms',
          [
            // Navigation folder — Side Bar, Sidetab, Top Bar
            'Navigation',
            // Tables folder — Data Rows, Table, Bulk Actions Toolbar, Table Data Control, Table Container
            'Tables',
            ['Data Rows', 'Table', 'Bulk Actions Toolbar', 'Table Data Control', 'Table Container'],
            // Forms folder — Input Section, List Section, Table Section
            'Forms',
            ['Input Section', 'List Section', 'Table Section'],
            '*',
          ],
          'Templates',
          [
            // Modal shells, smallest → largest
            'Alert Dialog',
            'Modal Dialog',
            'Large Modal',
            'Extra Large Modal',
          ],
          'Pages',
        ],
      },
    },
    layout: 'padded',
    backgrounds: { disable: true }, // we use theme switcher instead
  },
  decorators: [
    // Toolbar switcher — flips `data-theme` on `<html>`, which our tokens.css cascade reads.
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    // Default neutral page surface so light mode looks right and dark contrasts the iframe.
    // Full-bleed stories (`parameters.layout: 'fullscreen'`, e.g. Page / Top Bar) drop the
    // 16px breathing-room padding so they render edge-to-edge like the real app.
    (Story, context) => {
      const fullscreen = context.parameters?.layout === 'fullscreen';
      return (
        <div style={{ minHeight: '100vh', background: 'var(--surface-neutral-page-primary)', color: 'var(--text-default-label)', padding: fullscreen ? 0 : 16 }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
