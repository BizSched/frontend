'use client';

import { useQuery } from '@tanstack/react-query';

import { meQueryOptions } from './userQueryOptions';

const useMe = () => useQuery(meQueryOptions());

export { useMe };
