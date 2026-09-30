'use client';

import { type ComponentPropsWithoutRef, type SubmitEvent } from 'react';

type AuthFormProps = Omit<
  ComponentPropsWithoutRef<'form'>,
  'action' | 'method'
>;

function AuthForm({ onSubmit, ...props }: AuthFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  return <form noValidate onSubmit={handleSubmit} {...props} />;
}

export { AuthForm };
export type { AuthFormProps };
