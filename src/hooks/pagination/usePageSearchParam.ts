'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UsePageSearchParamResult {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const FIRST_PAGE = 1;

const parsePage = (value: string | null): number => {
  const page = Number(value);

  return Number.isInteger(page) && page >= FIRST_PAGE ? page : FIRST_PAGE;
};

const usePageSearchParam = (paramKey = 'page'): UsePageSearchParamResult => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parsePage(searchParams.get(paramKey));

  const setCurrentPage = (page: number) => {
    if (page === currentPage) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (page <= FIRST_PAGE) {
      nextSearchParams.delete(paramKey);
    } else {
      nextSearchParams.set(paramKey, String(page));
    }

    const query = nextSearchParams.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return { currentPage, setCurrentPage };
};

export { usePageSearchParam };
export type { UsePageSearchParamResult };
