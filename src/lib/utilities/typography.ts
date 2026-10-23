import { cva } from 'class-variance-authority';

const typographyVariants = cva('tracking-normal', {
  variants: {
    role: {
      pageTitle:
        'text-2xl leading-8 font-bold max-tablet:text-xl max-tablet:leading-7',
      appBarTitle: 'text-xl leading-7 font-bold',
      sectionTitle: 'text-xl leading-7 font-bold max-tablet:text-lg',
      subtitle: 'text-base leading-6 font-semibold',
      body: 'text-base leading-6 font-normal',
      data: 'text-base leading-6 font-medium tabular-nums',
      label: 'text-sm leading-5 font-semibold',
      supporting: 'text-sm leading-5 font-normal',
      caption: 'text-xs leading-4 font-medium',
      metric: 'text-xl leading-7 font-bold tabular-nums max-tablet:text-lg',
    },
  },
  defaultVariants: { role: 'body' },
});

export { typographyVariants };
