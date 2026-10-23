'use client';

import { useContext } from 'react';

import { PartTimeScheduleImageContext } from '@providers/partTime/PartTimeScheduleImageProvider';

const usePartTimeScheduleImage = () => {
  const context = useContext(PartTimeScheduleImageContext);

  if (!context) {
    throw new Error(
      'usePartTimeScheduleImage must be used within a <PartTimeScheduleImageProvider>',
    );
  }

  return context;
};

export { usePartTimeScheduleImage };
