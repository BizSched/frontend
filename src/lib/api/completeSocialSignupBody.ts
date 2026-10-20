import { SignupBody } from '@lib/api/generated/users/users.zod';

// NOTE: BE Swagger의 2단계 요청 업종 enum이 옛 값이라, 규칙이 같은 일반 가입 스키마에서 같은 필드를 가져온다. 명세가 고쳐지면 생성 CompleteSignupBody로 바꾼다 (docs/architecture/auth.md "결정 대기 항목")
const CompleteSocialSignupBody = SignupBody.pick({
  industry: true,
  industryDetail: true,
  termsAgreed: true,
});

export { CompleteSocialSignupBody };
