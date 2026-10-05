import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';

export default function PartTimeStaffNewPage() {
  return (
    <main className="flex flex-1 flex-col bg-[#f2f2f2] px-6 pt-25 pb-13 max-laptop:pt-12 max-laptop:pb-6 max-tablet:px-4 max-tablet:pt-3 max-tablet:pb-4">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <PartTimeStaffForm />
      </div>
    </main>
  );
}
