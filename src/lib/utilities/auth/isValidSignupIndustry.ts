import { SignupRequestIndustry } from '@lib/api/generated/bizSchedAPI.schemas';

const isValidSignupIndustry = (value: string): value is SignupRequestIndustry =>
  Object.values(SignupRequestIndustry).some((industry) => industry === value);

export { isValidSignupIndustry };
