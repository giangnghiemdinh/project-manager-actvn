export enum TwoFactorMethod {
  DISABLE,
  EMAIL,
  OTP
}

export const DEVICE_ID = 'did';
export const DEVICE_EXPIRE = 7 * 24; // 7 days
export const TOKEN = 'token';
export const REFRESH_TOKEN = 'refresh-token';
export const TOKEN_EXPIRE = 7 * 24; // 7 days
