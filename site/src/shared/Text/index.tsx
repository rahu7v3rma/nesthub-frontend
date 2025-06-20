import React from 'react';

interface TextProps {
  as?: React.ElementType;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?:
    | 'thin'
    | 'extralight'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black';
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({
  as: Component = 'p',
  variant = 'body',
  className = '',
  color = 'text-[#6C8093]',
  align = 'left',
  weight = 'normal',
  children,
}) => {
  const variantClasses = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-bold',
    body: 'text-base',
    caption: 'text-sm',
  };

  // Combine all classes
  const classes = `${variantClasses[variant]} ${color} text-${align} font-${weight} font-[Assistant] ${className}`;

  return <Component className={classes}>{children}</Component>;
};

export default Text;
