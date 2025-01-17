import type { Meta, StoryObj } from '@storybook/vue3';
import FoldableSidebarLayout from "./FoldableSidebarLayout.vue";

const meta = {
  component: FoldableSidebarLayout,
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
} satisfies Meta<typeof FoldableSidebarLayout>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
  },
  render: (args) => {
    return <FoldableSidebarLayout
    style={{
      height: '300px',
    }}
    {...args} >
      {{
        default: () => <div>Content</div>,
        sidebar: () => <div>Sidebar</div>,
      }}
      </FoldableSidebarLayout>
  }
};
