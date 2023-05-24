import { Injectable } from '@angular/core';
import {
    UserForgotPayload,
    UserLoginPayload,
    UserLoginResponse,
    UserResetPayload,
    UserVerifyPayload,
    UserVerifyResponse
} from '../models';
import { getDeviceId } from '../utilities';
import { AbstractService } from '../abstracts';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends AbstractService {

    login(payload: UserLoginPayload) {
        return this.post<UserLoginResponse>('auth/login', { payload, ignoreAlert: true });
    }

    forgotPassword(payload: UserForgotPayload) {
        return this.post<void>('auth/forgot-password', { payload, ignoreAlert: true });
    }

    resetPassword(payload: UserResetPayload) {
        return this.post<void>('auth/reset-password', { payload, ignoreAlert: true });
    }

    resendEmail(payload: UserLoginPayload) {
        return this.post<UserLoginResponse>('auth/resend', { payload, ignoreAlert: true });
    }

    logout() {
        const payload = { deviceId: getDeviceId() };
        return this.post<void>(`auth/logout`, { payload });
    }

    generateToken(payload: { email: string }) {
        return this.get<{ secret: string, url: string }>(`auth/generate-otp/${ payload.email }`, { ignoreAlert: true });
    }

    verify(payload: UserVerifyPayload) {
        return this.post<UserVerifyResponse>('auth/verify', { payload, ignoreAlert: true });
    }

    refresh(payload: { refreshToken: string }) {
        return this.post<UserLoginResponse>('auth/refresh', { payload, ignoreAlert: true });
    }
}
