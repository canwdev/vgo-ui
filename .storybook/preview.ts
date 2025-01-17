import type { Preview } from "@storybook/vue3";
// global styles
import "../src/styles/vgo-ui.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
