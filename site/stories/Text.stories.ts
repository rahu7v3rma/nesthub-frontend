import type { Meta, StoryObj } from '@storybook/react';

import Text from '../src/shared/Text';

const meta = {
  title: 'Shared/Text',
  component: Text,
  parameters: {},
  tags: [],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    as: 'h1',
    variant: 'h1',
    color: 'text-blue-500',
    align: 'center',
    children: 'Hello world',
  },
};
