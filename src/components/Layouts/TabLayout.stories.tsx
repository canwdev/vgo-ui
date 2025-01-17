import type { Meta, StoryObj } from '@storybook/vue3';
import TabLayout from "./TabLayout.vue";
import { ref } from 'vue';

const meta = {
  component: TabLayout,
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
} satisfies Meta<typeof TabLayout>;

export default meta;
type Story = StoryObj<typeof meta>;


const Template = (args) => ({
  components: { TabLayout },
  setup() {
    const modelValue = ref(args.modelValue);
    return { args, modelValue };
  },
  template: '<TabLayout v-model="modelValue" v-bind="args" >{{modelValue}}</TabLayout>',
});


export const Default = Template.bind({});
Default.args = {
  modelValue: 1,
  horizontal: true,
  options: [
    {label: '选项1', value: 1},
    {label: '选项2', value: 2},
    {label: '选项3', value: 3},
  ]
}
