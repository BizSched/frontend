'use client';

import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { cn } from '@lib/utilities/cn';

type RadioGroupProps = RadioGroupPrimitive.Props;

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('grid w-full gap-2', className)}
      {...props}
    />
  );
}

export { RadioGroup };
export type { RadioGroupProps };
