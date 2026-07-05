import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Avatar, type AvatarSize, type AvatarTone } from './Avatar.js';
import { AVATAR_PHOTOS } from './avatarPhotos.js';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'Avatar variants per Figma node `7446:22517`. The Type axis in Figma is `Empty-Teal / Empty-Warning / Empty-Grey / Photo 1 / Photo 2 / Photo 3` — the three "Empty" Types map to the React `tone` prop, the three "Photo" Types collapse to a single image render mode. The photo stories use `AVATAR_PHOTOS` — the exact Photo 1/2/3 images from the Figma component, shipped as package assets. Sizes are 24 / 32 / 44 / 72 px.',
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    size: { control: 'inline-radio', options: ['xs', 'small', 'medium', 'large'] },
    tone: { control: 'inline-radio', options: ['teal', 'warning', 'yankee-blue'] },
    src: { control: 'text' },
    initials: { control: 'text' },
    decorative: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Avatar>;

// The exact Photo 1/2/3 images from the Figma Avatar component (package assets).
const SAMPLE_PHOTOS = AVATAR_PHOTOS;

const SIZE_LABEL: Record<AvatarSize, string> = {
  xs: 'Extra Small · 24',
  small: 'Small · 32',
  medium: 'Medium · 44',
  large: 'Large · 72',
};

const ALL_SIZES: AvatarSize[] = ['xs', 'small', 'medium', 'large'];

const Cell: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 96 }}>
    <span className="text-label-s-regular" style={{ color: 'var(--text-default-helper)' }}>
      {label}
    </span>
    {children}
  </div>
);

const ToneRow: React.FC<{ tone: AvatarTone; title: string }> = ({ tone, title }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
      {title}
    </h2>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
      {ALL_SIZES.map((s) => (
        <Cell key={s} label={SIZE_LABEL[s]}>
          <Avatar name="Ada Singh" tone={tone} size={s} />
        </Cell>
      ))}
    </div>
  </section>
);

/* ============================================================================
 * Empty-* (initials) variants — map 1:1 to Figma's `Empty-Teal/Warning/Grey`
 * ========================================================================== */

export const EmptyTeal: Story = {
  render: () => <ToneRow tone="teal" title="Empty-Teal · Desktop" />,
};

export const EmptyWarning: Story = {
  render: () => <ToneRow tone="warning" title="Empty-Warning · Desktop" />,
};

export const EmptyYankeeBlue: Story = {
  render: () => <ToneRow tone="yankee-blue" title="Empty-Yankee Blue · Desktop" />,
};

/* ============================================================================
 * Photo variants — Figma's `Photo 1 / 2 / 3` all collapse to a single render
 * mode in code; the three sample images are placeholders.
 * ========================================================================== */

export const WithPhoto: Story = {
  render: () => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
        Photo · Desktop
      </h2>
      {SAMPLE_PHOTOS.map((src, i) => (
        <div key={src} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 className="text-label-l-semibold" style={{ margin: 0 }}>
            Photo {i + 1}
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {ALL_SIZES.map((s) => (
              <Cell key={s} label={SIZE_LABEL[s]}>
                <Avatar name={`Photo ${i + 1}`} src={src} size={s} />
              </Cell>
            ))}
          </div>
        </div>
      ))}
    </section>
  ),
};

/* ============================================================================
 * Catalog — the full Figma 6 × 4 matrix in one view
 * ========================================================================== */

export const Catalog: Story = {
  render: () => {
    const tones: { value: AvatarTone; figmaLabel: string }[] = [
      { value: 'teal', figmaLabel: 'Empty-Teal' },
      { value: 'warning', figmaLabel: 'Empty-Warning' },
      { value: 'yankee-blue', figmaLabel: 'Empty-Yankee Blue' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <h2 className="text-heading-s-semibold" style={{ margin: 0 }}>
          Full variant matrix · Figma `7446:22517`
        </h2>

        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(4, 1fr)', gap: 16, alignItems: 'center' }}>
          <span />
          {ALL_SIZES.map((s) => (
            <span key={s} className="text-label-m-semibold" style={{ textAlign: 'center' }}>
              {SIZE_LABEL[s]}
            </span>
          ))}
        </div>

        {tones.map(({ value, figmaLabel }) => (
          <div
            key={value}
            style={{ display: 'grid', gridTemplateColumns: '160px repeat(4, 1fr)', gap: 16, alignItems: 'center' }}
          >
            <span className="text-label-m-semibold">{figmaLabel}</span>
            {ALL_SIZES.map((s) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar name="Ada Singh" tone={value} size={s} />
              </div>
            ))}
          </div>
        ))}

        {SAMPLE_PHOTOS.map((src, i) => (
          <div
            key={src}
            style={{ display: 'grid', gridTemplateColumns: '160px repeat(4, 1fr)', gap: 16, alignItems: 'center' }}
          >
            <span className="text-label-m-semibold">Photo {i + 1}</span>
            {ALL_SIZES.map((s) => (
              <div key={s} style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar name={`Photo ${i + 1}`} src={src} size={s} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
