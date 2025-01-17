import type { Meta, StoryObj } from '@storybook/vue3';
import AutoRatioBox from "./AutoRatioBox.vue";

const meta = {
  component: AutoRatioBox,
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
} satisfies Meta<typeof AutoRatioBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ratio: 0.5,
    style: {
      backgroundImage: 'url(https://img.la/800x400)',
    }
  },
};