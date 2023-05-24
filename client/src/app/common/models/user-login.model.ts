import { TwoFactorMethod } from '../constants';

export interface UserLoginPayload {
    deviceId: string;
    email: string;
    password?: string;
}

export interface UserLoginResponse {
    twoFactoryMethod: TwoFactorMethod;
    requiredOtpToken?: boolean;
    expiresIn?: Date;
    accessToken?: string;
    refreshToken?: string;
}

