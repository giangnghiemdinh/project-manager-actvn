import { UserLoginResponse } from './user-login.model';

export interface UserVerifyPayload {
    deviceId: string;
    email: string;
    otp: string;
    isTrusted: boolean;
}

export interface UserVerifyResponse extends UserLoginResponse {
}
