import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import {
  EMPTY_STATE_ILLUSTRATIONS,
  EMPTY_STATE_ILLUSTRATIONS_WEBP,
  type EmptyStateIllustration,
} from './illustrations.js';

/**
 * LETA Illustrations (Figma `Illustrations/*` atoms) — the line-art scenes used
 * inside Empty States. Each ships as a real 300px asset (PNG + WebP) rendered at
 * 150×150. This gallery is the canonical reference for cross-referencing Figma.
 */
type GalleryArgs = { name: EmptyStateIllustration; size: number };

const meta: Meta<GalleryArgs> = {
  title: 'Atoms/Illustrations',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<GalleryArgs>;

const KEYS = Object.keys(EMPTY_STATE_ILLUSTRATIONS) as EmptyStateIllustration[];

/** One illustration rendered via `<picture>` (WebP source + PNG fallback). */
function Illustration({ name, size = 150 }: { name: EmptyStateIllustration; size?: number }) {
  return (
    <picture>
      <source srcSet={EMPTY_STATE_ILLUSTRATIONS_WEBP[name]} type="image/webp" />
      <img
        src={EMPTY_STATE_ILLUSTRATIONS[name]}
        alt={name}
        width={size}
        height={size}
        style={{ display: 'block', width: size, height: size }}
      />
    </picture>
  );
}

/** Catalog: every LETA illustration at its native 150×150 size. */
export const Catalog: Story = {
  render: () => (
    <div>
      <p style={{ color: 'var(--text-default-helper)' }}>
        {KEYS.length} illustrations. Rendered at 150×150 (WebP with PNG fallback).
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {KEYS.map((name) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: 16,
              borderRadius: 'var(--rounding-lg)',
              border: 'var(--stroke-xs) solid var(--border-neutral-default)',
              backgroundColor: 'var(--surface-neutral-bg-default)',
            }}
          >
            <Illustration name={name} />
            <code style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-default-body)' }}>{name}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};

/** A single illustration with a size control. */
export const Single: Story = {
  render: (args) => <Illustration name={args.name} size={args.size} />,
  args: { name: 'no-results', size: 150 },
  argTypes: {
    name: { control: 'select', options: KEYS },
    size: { control: { type: 'range', min: 64, max: 300, step: 2 } },
  },
};
