import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const textButtonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[0.25rem] p-px font-medium whitespace-nowrap text-warning-500 transition-colors outline-none hover:bg-primary-100 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        large: typographyVariants({ role: 'label' }),
        small: typographyVariants({ role: 'label' }),
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

interface TextButtonProps
  extends ButtonPrimitive.Props, VariantProps<typeof textButtonVariants> {}

function TextButton({ className, size, ...props }: TextButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="text-button"
      className={cn(textButtonVariants({ size, className }))}
      {...props}
    />
  );
}

export { TextButton, textButtonVariants };
