import type { Meta, StoryObj } from '@storybook/vue3';
import Demo from "./Demo.vue";

const meta = {
  component: Demo,
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Button',
  },
};