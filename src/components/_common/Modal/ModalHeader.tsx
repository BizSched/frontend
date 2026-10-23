import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const modalHeaderVariants = cva('flex flex-col gap-2', {
  variants: {
    align: {
      start:
        'relative items-start pr-10 text-left [&>[data-slot=modal-close]]:absolute [&>[data-slot=modal-close]]:top-0 [&>[data-slot=modal-close]]:right-0',
      center: 'items-center text-center',
    },
  },
  defaultVariants: {
    align: 'start',
  },
});

interface ModalHeaderProps
  extends
    React.ComponentPropsWithRef<'header'>,
    VariantProps<typeof modalHeaderVariants> {}

function ModalHeader({ align, className, ...props }: ModalHeaderProps) {
  return (
    <header
      data-slot="modal-header"
      className={cn(modalHeaderVariants({ align }), className)}
      {...props}
    />
  );
}

export { ModalHeader, modalHeaderVariants };
export type { ModalHeaderProps };
