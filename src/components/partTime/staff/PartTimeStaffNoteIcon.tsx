import Image from 'next/image';

import IcNote from '@assets/icons/ic_note.svg';

function PartTimeStaffNoteIcon() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#c7f2eb] max-tablet:size-8 max-tablet:rounded-[8px]">
      <Image
        src={IcNote}
        alt=""
        width={18}
        height={23}
        className="h-5.75 w-4.5 max-tablet:h-[17.89px] max-tablet:w-3.5"
        unoptimized
      />
    </span>
  );
}

export { PartTimeStaffNoteIcon };
