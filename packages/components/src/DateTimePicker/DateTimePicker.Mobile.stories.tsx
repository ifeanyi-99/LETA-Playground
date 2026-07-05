import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTimePicker } from './DateTimePicker.js';

/**
 * Date & Time Pickers (`1182:17579`) — Mobile. A bottom-sheet (header with title +
 * subtitle + close, a single-column calendar, and a Clear / Apply footer). Same
 * functional calendar as Desktop. Three types: Simple, Date Range, Date & Time.
 */
const meta: Meta<typeof DateTimePicker> = {
  title: 'Molecules/Date & Time Pickers/Mobile',
  component: DateTimePicker,
  parameters: { layout: 'padded' },
  args: { platform: 'mobile' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof DateTimePicker>;

export const SimpleDatePicker: Story = { args: { type: 'simple', title: 'Select Date', subtitle: 'Pick a date' } };
export const DateRange: Story = { args: { type: 'date-range', title: 'Custom Date', subtitle: 'Set your date range' } };
export const DateTime: Story = { name: 'Date & Time', args: { type: 'date-time', title: 'Date & Time', subtitle: 'Pick a date and time' } };
