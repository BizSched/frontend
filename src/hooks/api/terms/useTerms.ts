import { useQuery } from '@tanstack/react-query';

import { termsQueryOptions } from '@hooks/api/terms/termsQueryOptions';

const useTerms = () => useQuery(termsQueryOptions());

export { useTerms };
