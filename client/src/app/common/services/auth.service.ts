import { inject, Injectable } from '@angular/core';
import { UserForgotPayload, UserLoginPayload, UserLoginResponse, UserResetPayload } from '../models';
import { UserVerifyPayload, UserVerifyResponse } from '../models/user-verify.model';
import { getDeviceId } from '../utilities';
import { HttpClient, HttpContext } from '@angular/common/http';
import { IGNORE_ERROR_ALERT } from '../intercepters';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    readonly #http = inject(HttpClient);
    readonly #context = new HttpContext().set(IGNORE_ERROR_ALERT, true);

    login(payload: UserLoginPayload) {
        return this.#http.post<UserLoginResponse>('auth/login', payload, { context: this.#context });
    }

    forgotPassword(payload: UserForgotPayload) {
        return this.#http.post<void>('auth/forgot-password', payload, { context: this.#context });
    }

    resetPassword(payload: UserResetPayload) {
        return this.#http.post<void>('auth/reset-password', payload, { context: this.#context });
    }

    resendEmail(payload: UserLoginPayload) {
        return this.#http.post<UserLoginResponse>('auth/resend', payload, { context: this.#context });
    }

    logout() {
        const deviceId = getDeviceId();
        return this.#http.post<void>(`auth/logout`, { deviceId });
    }

    generateToken(payload: { email: string }) {
        return this.#http.get<{ secret: string, url: string }>(`auth/generate-otp/${payload.email}`, {
            context: this.#context
        });
    }

    verify(payload: UserVerifyPayload) {
        return this.#http.post<UserVerifyResponse>('auth/verify', payload, { context: this.#context });
    }

    refresh(payload: { refreshToken: string }) {
        return this.#http.post<UserLoginResponse>('auth/refresh', payload, { context: this.#context });
    }
}
