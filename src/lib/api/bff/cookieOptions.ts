import 'server-only';

const getBaseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
});

export { getBaseCookieOptions };
