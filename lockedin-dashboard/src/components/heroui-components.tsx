'use client';

import React from 'react';
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Link,
} from '@heroui/react';

/**
 * Primary Action Button - Full-width, prominent
 */
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { children: React.ReactNode }
>(({ children, className = '', ...props }, ref) => (
  <Button
    ref={ref}
    color="primary"
    size="lg"
    radius="md"
    fullWidth
    className={`font-semibold text-[15px] ${className}`}
    {...props}
  >
    {children}
  </Button>
));
PrimaryButton.displayName = 'PrimaryButton';

/**
 * Secondary/Ghost Button - Light variant
 */
export const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { children: React.ReactNode }
>(({ children, className = '', ...props }, ref) => (
  <Button
    ref={ref}
    color="default"
    variant="flat"
    size="lg"
    radius="md"
    className={`text-[15px] ${className}`}
    {...props}
  >
    {children}
  </Button>
));
SecondaryButton.displayName = 'SecondaryButton';

/**
 * Danger Button - Red/destructive action
 */
export const DangerButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { children: React.ReactNode }
>(({ children, className = '', ...props }, ref) => (
  <Button
    ref={ref}
    color="danger"
    size="md"
    className={className}
    {...props}
  >
    {children}
  </Button>
));
DangerButton.displayName = 'DangerButton';

/**
 * Success Button - Green approval/confirm
 */
export const SuccessButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { children: React.ReactNode }
>(({ children, className = '', ...props }, ref) => (
  <Button
    ref={ref}
    color="success"
    size="md"
    className={className}
    {...props}
  >
    {children}
  </Button>
));
SuccessButton.displayName = 'SuccessButton';

/**
 * Icon Button - Compact, for navigation/controls
 */
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { children: React.ReactNode; isActive?: boolean }
>(({ children, isActive = false, ...props }, ref) => (
  <Button
    ref={ref}
    isIconOnly
    variant={isActive ? 'solid' : 'light'}
    color={isActive ? 'primary' : 'default'}
    {...props}
  >
    {children}
  </Button>
));
IconButton.displayName = 'IconButton';

/**
 * Text Input - Standard form input with visible styling
 */
export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className = '', ...props }, ref) => (
  <Input
    ref={ref}
    type="text"
    variant="bordered"
    size="lg"
    radius="md"
    fullWidth
    classNames={{
      input: 'text-base text-[#0f2044] placeholder:text-[#0f2044b8] outline-none ring-0 border-0 shadow-none',
      innerWrapper: 'border-0 shadow-none outline-none ring-0',
      inputWrapper: 'min-h-[50px] border-2 border-primary/40 hover:border-primary/60 focus-within:border-primary bg-white/20 shadow-none',
    }}
    className={className}
    {...props}
  />
));
TextInput.displayName = 'TextInput';

/**
 * Password Input - Hidden text input with visible styling
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className = '', ...props }, ref) => (
  <Input
    ref={ref}
    type="password"
    variant="bordered"
    size="lg"
    radius="md"
    fullWidth
    classNames={{
      input: 'text-base text-[#0f2044] placeholder:text-[#0f2044b8] outline-none ring-0 border-0 shadow-none',
      innerWrapper: 'border-0 shadow-none outline-none ring-0',
      inputWrapper: 'min-h-[50px] border-2 border-primary/40 hover:border-primary/60 focus-within:border-primary bg-white/20 shadow-none',
    }}
    className={className}
    {...props}
  />
));
PasswordInput.displayName = 'PasswordInput';

/**
 * Form Container - Wrapper with consistent spacing
 */
export const FormContainer: React.FC<{
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}> = ({ children, onSubmit, className = '' }) => (
  <form onSubmit={onSubmit} className={`space-y-5 w-full max-w-sm mx-auto ${className}`}>
    {children}
  </form>
);

/**
 * Beautiful Card Container - HeroUI Card with optional sections
 */
export const CardContainer: React.FC<{
  children: React.ReactNode;
  title?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  isBlurred?: boolean;
  isPressable?: boolean;
  onPress?: () => void;
}> = ({
  children,
  title,
  header,
  footer,
  className = '',
  shadow = 'md',
  isBlurred = false,
  isPressable = false,
  onPress,
}) => (
  <Card
    className={className}
    shadow={shadow}
    isBlurred={isBlurred}
    isPressable={isPressable}
    onPress={onPress}
  >
    {(title || header) && (
      <CardHeader className="flex flex-col gap-2">
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        {header}
      </CardHeader>
    )}
    {(title || header) && <Divider />}
    <CardBody className="gap-4">
      {children}
    </CardBody>
    {footer && (
      <>
        <Divider />
        <CardFooter>{footer}</CardFooter>
      </>
    )}
  </Card>
);

/**
 * Alert/Message Box - Semantic color indicators
 */
export const AlertBox: React.FC<{
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
  onClose?: () => void;
}> = ({ type, message, title, onClose }) => {
  const colorMap = {
    success: { bg: 'bg-success-100', border: 'border-success-200', text: 'text-success-700' },
    error: { bg: 'bg-danger-100', border: 'border-danger-200', text: 'text-danger-700' },
    info: { bg: 'bg-primary-100', border: 'border-primary-200', text: 'text-primary-700' },
    warning: { bg: 'bg-warning-100', border: 'border-warning-200', text: 'text-warning-700' },
  };

  const colors = colorMap[type];

  return (
    <Card className={`${colors.bg} border ${colors.border}`}>
      <CardBody className={`${colors.text}`}>
        {title && <h4 className="font-semibold">{title}</h4>}
        <p>{message}</p>
      </CardBody>
    </Card>
  );
};

/**
 * Empty State - When no content available
 */
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-4xl">{icon}</div>}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

