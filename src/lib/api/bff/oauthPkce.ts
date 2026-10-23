import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

const RANDOM_BYTE_LENGTH = 32;

const createRandomValue = () =>
  randomBytes(RANDOM_BYTE_LENGTH).toString('base64url');

const createOAuthState = createRandomValue;

const createCodeVerifier = createRandomValue;

const createCodeChallenge = (codeVerifier: string) =>
  createHash('sha256').update(codeVerifier).digest('base64url');

export { createCodeChallenge, createCodeVerifier, createOAuthState };
