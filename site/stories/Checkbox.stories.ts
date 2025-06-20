import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import '../src/app/globals.css';
import Checkbox from '../src/shared/Checkbox';

const meta = {
  title: 'Shared/Checkbox',
  component: Checkbox,
  parameters: {},
  tags: [],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'I agree with Terms & Conditions',
    value: true,
    onChange: action('checkbox-changed'),
    name: 'checkbox',
  },
};
