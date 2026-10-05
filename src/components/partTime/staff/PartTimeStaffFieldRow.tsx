import type { ReactNode } from 'react';

interface PartTimeStaffFieldRowProps {
  label: string;
  children: ReactNode;
}

function PartTimeStaffFieldRow({
  label,
  children,
}: PartTimeStaffFieldRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <dt className="flex h-6 w-14 shrink-0 items-center text-sm leading-5 font-medium tracking-[-0.03em] text-[#a4a4a4]">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm leading-5 tracking-[-0.03em] wrap-break-word text-[#333333]">
        {children}
      </dd>
    </div>
  );
}

export { PartTimeStaffFieldRow };
export type { PartTimeStaffFieldRowProps };
