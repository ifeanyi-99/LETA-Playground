import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateTimePicker } from './DateTimePicker.js';

/**
 * Date & Time Pickers (`1182:17579`) — Desktop. Functional calendars: navigate
 * months/years, click days to select, drag a range (start → end), pick a time.
 * Three types: Simple Date Picker, Date Range (with presets + dual calendars), and
 * Date & Time (calendar + scrollable time column).
 */
const meta: Meta<typeof DateTimePicker> = {
  title: 'Molecules/Date & Time Pickers/Desktop',
  component: DateTimePicker,
  parameters: { layout: 'padded' },
  args: { platform: 'desktop' },
};
export default meta;
type Story = StoryObj<typeof DateTimePicker>;

/** Single date selection. */
export const SimpleDatePicker: Story = { args: { type: 'simple' } };

/** Date range — preset list + Start/End fields + two calendars + footer. Pick "Custom" then click a start and end day. */
export const DateRange: Story = { args: { type: 'date-range' } };

/** Date & time — calendar + a scrollable Time-of-Day column. */
export const DateTime: Story = { name: 'Date & Time', args: { type: 'date-time' } };
