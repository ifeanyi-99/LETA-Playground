import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OptionCard } from './OptionCard.js';
import { Badge } from '../Badge/Badge.js';

const meta: Meta<typeof OptionCard> = {
  title: 'Molecules/Cards/Option Card',
  component: OptionCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A full-width selectable card built on the **Utility Content Primitive**: a title + ' +
          'description on the left and a composable **trailing element** on the right.' +
          '\n\n' +
          'The trailing element is **not fixed to a radio button** — it defaults to a `RadioButton` ' +
          '(mutually-exclusive-choice case, via `selected`/`onChange`/`name`/`value`), but pass the ' +
          '`trailing` prop to render any node (metadata text, a Badge, a CTA Button, an icon, a Checkbox…).' +
          '\n\n' +
          'Figma `9894:18459`. 5 states (Idle / Hover / Pressed / Active / Focus). Hover adds a drop ' +
          'shadow; Active changes the border to navy.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof OptionCard>;

/** Idle — unselected. */
export const Idle: Story = {
  args: {
    title: 'Text',
    description: 'Enter description here',
    selected: false,
  },
};

/** Hover — idle fill/border + a Neutral Drop Shadow 1 (the only thing that changes on hover). */
export const Hover: Story = {
  args: {
    title: 'Text',
    description: 'Enter description here',
    state: 'hover',
  },
};

/** Active — selected (navy border, filled radio). */
export const Active: Story = {
  args: {
    title: 'Text',
    description: 'Enter description here',
    selected: true,
  },
};

/** Disabled. */
export const Disabled: Story = {
  args: {
    title: 'Text',
    description: 'Enter description here',
    disabled: true,
  },
};

/** Focus — idle body + the standard 1.5px focus ring at 4px offset. */
export const Focus: Story = {
  args: {
    title: 'Text',
    description: 'Enter description here',
    state: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Forced focus state. In real use the ring appears via `:focus-visible` ' +
          'when the nested radio is keyboard-focused (Tab to the card).',
      },
    },
  },
};

/**
 * Custom trailing element — the card is built on the Utility Content Primitive,
 * so the trailing slot accepts any node. Here: plain metadata text and a Badge
 * instead of the default radio.
 */
export const CustomTrailing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 600 }}>
      <OptionCard
        title="Standard delivery"
        description="Arrives in 3–5 business days"
        trailing={<span className="text-label-m-semibold" style={{ color: 'var(--text-default-label)' }}>Free</span>}
      />
      <OptionCard
        title="Express delivery"
        description="Arrives next business day"
        trailing={<Badge color="information" label="Popular" />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The trailing slot is fully composable. Pass `trailing` with any ReactNode to opt out of ' +
          'the default radio button.',
      },
    },
  },
};

/** A controlled radio group of options. */
export const Catalog: Story = {
  render: () => {
    const [value, setValue] = React.useState('a');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 600 }}>
        <OptionCard
          title="Option A"
          description="Enter description here"
          name="catalog"
          value="a"
          selected={value === 'a'}
          onChange={() => setValue('a')}
        />
        <OptionCard
          title="Option B"
          description="Enter description here"
          name="catalog"
          value="b"
          selected={value === 'b'}
          onChange={() => setValue('b')}
        />
        <OptionCard
          title="Option C (disabled)"
          description="Enter description here"
          name="catalog"
          value="c"
          disabled
        />
      </div>
    );
  },
};
