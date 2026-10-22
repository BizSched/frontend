import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { BellIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

import { ICON_BUTTON_BASE_CLASSNAME } from './iconButtonBase';

const notificationButtonVariants = cva(
  'relative size-16 border border-[#ddd] bg-[#fffffe] hover:border-[#ccc] hover:bg-[#fafafa]',
);

type NotificationButtonProps = Omit<ButtonPrimitive.Props, 'children'> &
  Required<Pick<ButtonPrimitive.Props, 'aria-label'>> & {
    unread?: boolean;
  };

function NotificationButton({
  className,
  unread = false,
  ...props
}: NotificationButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="notification-button"
      className={cn(
        ICON_BUTTON_BASE_CLASSNAME,
        notificationButtonVariants({ className }),
      )}
      {...props}
    >
      <BellIcon size={24} className="text-[#737373]" />
      {unread && (
        <span
          aria-hidden
          className="absolute top-1 right-1 size-3 rounded-full bg-primary-500"
        />
      )}
    </ButtonPrimitive>
  );
}

export { NotificationButton, notificationButtonVariants };
