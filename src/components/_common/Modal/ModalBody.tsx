import { cn } from '@lib/utilities/cn';

type ModalBodyProps = React.ComponentPropsWithRef<'div'>;

function ModalBody({ className, ...props }: ModalBodyProps) {
  return (
    <div
      data-slot="modal-body"
      className={cn('min-h-0 flex-1 overflow-y-auto', className)}
      {...props}
    />
  );
}

export { ModalBody };
export type { ModalBodyProps };
