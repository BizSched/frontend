import { Button } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2 text-left tracking-[-0.03em] outline-none hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        default: 'min-h-14 rounded-[20px] px-4 py-3.5 text-lg font-semibold',
        sub: 'min-h-11 rounded-lg px-6 py-3 text-sm font-medium',
      },
      isActive: {
        true: 'text-primary-700',
        false: 'text-[#333] disabled:text-[#a0a0a0]',
      },
    },
    compoundVariants: [
      {
        size: 'default',
        isActive: true,
        className: 'bg-primary-200 font-bold',
      },
    ],
    defaultVariants: { size: 'default', isActive: false },
  },
);

interface SidebarMenuButtonProps
  extends Button.Props, VariantProps<typeof sidebarMenuButtonVariants> {}

function SidebarMenuButton({
  size,
  isActive,
  className,
  ...props
}: SidebarMenuButtonProps) {
  return (
    <Button
      data-slot="sidebar-menu-button"
      data-active={isActive || undefined}
      className={cn(sidebarMenuButtonVariants({ size, isActive }), className)}
      {...props}
    />
  );
}

export { SidebarMenuButton };
