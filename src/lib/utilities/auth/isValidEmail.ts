const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string) =>
  !/\s/.test(value) && EMAIL_PATTERN.test(value);

export { isValidEmail };
