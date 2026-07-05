import type { Meta, StoryObj } from '@storybook/react-vite';
import { LeadingInputFieldElement } from './LeadingInputFieldElement.js';

const meta: Meta<typeof LeadingInputFieldElement> = {
  title: 'Molecules/Form Controls/Leading Input Field Element',
  component: LeadingInputFieldElement,
  parameters: {
    docs: {
      description: {
        component:
          'An interactive adornment that sits at the **leading** edge inside an input field. The current ' +
          'type is a Country Selector for phone/locale inputs.' +
          '\n\n' +
          '**Use inside** text/phone inputs that need a leading selector or context — not as a standalone ' +
          'control outside an input.' +
          '\n\n' +
          'Figma `7111:43945`. **Single Country** — display-only flag + dial code, non-selectable; ' +
          '**Multiple Countries** — flag + chevron, opens a country picker (Idle / Hover / Pressed / ' +
          'Focus / Disabled). Styled with the secondary-button token family; reuses the Flag atom.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof LeadingInputFieldElement>;

/* ============================================================================
 * Figma variant — Single Country (display-only flag + dial code)
 * ========================================================================== */

export const SingleCountry: Story = {
  render: () => <LeadingInputFieldElement variant="single" countryCode="KE" dialCode="+254" />,
};

/* ============================================================================
 * Figma variant — Multiple Countries (flag + chevron; opens a picker)
 * ========================================================================== */

export const MultipleCountries: Story = {
  render: () => (
    <LeadingInputFieldElement variant="multiple" countryCode="KE" aria-label="Select country" />
  ),
};

/* ============================================================================
 * Disabled — both variants
 * ========================================================================== */

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <LeadingInputFieldElement variant="single" countryCode="KE" dialCode="+254" disabled />
      <LeadingInputFieldElement variant="multiple" countryCode="KE" aria-label="Select country" disabled />
    </div>
  ),
};

/* ============================================================================
 * Catalog — both variants (Figma 7111:43945)
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const caption = { color: 'var(--text-default-helper)' } as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'flex-start' }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Country Selector · Figma <code>7111:43945</code>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={caption}>
            Single Country
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <LeadingInputFieldElement variant="single" countryCode="KE" dialCode="+254" />
            <LeadingInputFieldElement variant="single" countryCode="US" dialCode="+1" />
            <LeadingInputFieldElement variant="single" countryCode="GB" dialCode="+44" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <span className="text-label-s-regular" style={caption}>
            Multiple Countries (interactive)
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <LeadingInputFieldElement variant="multiple" countryCode="KE" aria-label="Select country" />
            <LeadingInputFieldElement variant="multiple" countryCode="NG" aria-label="Select country" />
          </div>
        </div>
      </div>
    );
  },
};
