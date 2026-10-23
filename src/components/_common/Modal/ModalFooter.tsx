import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const modalFooterVariants = cva('flex gap-3', {
  variants: {
    layout: {
      split: '[&>*]:flex-1',
      single: '[&>*]:w-full',
    },
  },
  defaultVariants: {
    layout: 'split',
  },
});

interface ModalFooterProps
  extends
    React.ComponentPropsWithRef<'footer'>,
    VariantProps<typeof modalFooterVariants> {}

function ModalFooter({ layout, className, ...props }: ModalFooterProps) {
  return (
    <footer
      data-slot="modal-footer"
      className={cn(modalFooterVariants({ layout }), className)}
      {...props}
    />
  );
}

export { ModalFooter, modalFooterVariants };
export type { ModalFooterProps };
