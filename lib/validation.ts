export const USERNAME_RE = /^[a-z0-9_-]{3,24}$/;
export const BIO_MAX_LENGTH = 160;
export const PASSWORD_MIN_LENGTH = 8;
export const POST_TITLE_MAX_LENGTH = 140;
export const POST_BODY_MAX_LENGTH = 10_000;
export const COMMENT_MAX_LENGTH = 2_000;

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
