import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import '../src/app/globals.css';
import Button from '../src/shared/Button';

const meta = {
  title: 'Shared/Button',
  component: Button,
  parameters: {},
  tags: [],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Login',
    color: 'text-white',
    backgroundColor: 'bg-blue_850',
    onClick: action('on-click'),
  },
};
