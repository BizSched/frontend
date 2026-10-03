import type { ReactNode } from 'react';

interface PartTimeStaffProfileLayoutProps {
  title: ReactNode;
  fields: ReactNode;
  extra?: ReactNode;
  attachments?: ReactNode;
  body?: ReactNode;
}

function PartTimeStaffProfileLayout({
  title,
  fields,
  extra,
  attachments,
  body,
}: PartTimeStaffProfileLayoutProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-6 max-tablet:gap-4">
        <div className="flex flex-col gap-7.5 max-tablet:gap-6">
          {title}
          <dl className="grid grid-flow-col grid-cols-2 grid-rows-2 gap-3 max-tablet:grid-flow-row max-tablet:grid-cols-1 max-tablet:grid-rows-none max-tablet:gap-2">
            {fields}
          </dl>
        </div>
        <hr className="border-[#e2e8f0]" />
      </div>
      <div className="flex flex-col gap-6">
        {extra}
        {attachments}
        {body}
      </div>
    </div>
  );
}

export { PartTimeStaffProfileLayout };
export type { PartTimeStaffProfileLayoutProps };
