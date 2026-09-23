import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import Image from 'next/image';

import { cn } from '@lib/utilities/cn';

import IcBell from '@assets/icons/ic_bell.svg';

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
      <Image src={IcBell} alt="" width={24} height={24} unoptimized />
      {unread && (
        <span
          aria-hidden
          className="bg-primary-500 absolute top-1 right-1 size-3 rounded-full"
        />
      )}
    </ButtonPrimitive>
  );
}

export { NotificationButton, notificationButtonVariants };
