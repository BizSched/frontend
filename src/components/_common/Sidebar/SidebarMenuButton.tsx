import { Button } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center gap-2 text-left outline-none not-disabled:hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed [&_svg]:text-slate-300 disabled:[&_svg]:text-slate-200 data-[active]:[&_svg]:text-primary-700',
  {
    variants: {
      size: {
        default: cn(
          typographyVariants({ role: 'subtitle' }),
          'min-h-14 rounded-[20px] px-4 py-3.5',
        ),
        sub: cn(
          typographyVariants({ role: 'label' }),
          'min-h-11 rounded-lg px-6 py-3',
        ),
      },
      isActive: {
        true: 'text-primary-700',
        false: 'text-slate-500 disabled:text-slate-200',
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
