import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';
export default function PartTimeStaffEditNotFound() {
  return (
    <p
      className={cn(
        typographyVariants({ role: 'supporting' }),
        'py-10 text-center text-slate-500',
      )}
    >
      아르바이트생을 찾을 수 없습니다.
    </p>
  );
}
