import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { getDeviceId, numberParser, setTitle } from '../../../common/utilities';
import { AuthActions, AuthState, selectAuthErrors, selectCredentials, selectOtpToken, } from '../../../common/stores';
import { Store } from '@ngrx/store';
import { RO_LOGIN_FULL, TwoFactorMethod } from '../../../common/constants';
import { InputParserDirective, QrCodeDirective } from '../../../core-ui/directives';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from '../../../core-ui/components';
import { combineLatest, interval, map, take } from 'rxjs';
import { UserVerifyPayload } from '../../../common/models/user-verify.model';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { DEFAULT_ERROR_MESSAGE } from '../../../common/constants/common.constant';

@Component({
    selector: 'app-tfa-verify',
    standalone: true,
    templateUrl: './tfa-verify.component.html',
    imports: [
        NzButtonModule,
        NzInputModule,
        QrCodeDirective,
        InputParserDirective,
        ReactiveFormsModule,
        NgIf,
        RouterLink,
        AsyncPipe,
        FormErrorComponent,
        NzCheckboxModule
    ]
})
export class TfaVerifyComponent {
    private readonly store = inject(Store<AuthState>);

    auth$ = combineLatest([
        this.store.select(selectCredentials),
        this.store.select(selectOtpToken)
    ]).pipe(
        map(([credentials, otpToken]) => ({credentials, otpToken}))
    );
    errors$ = this.store.select(selectAuthErrors);

    method = TwoFactorMethod;
    parser = numberParser;
    otp = new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.minLength(6)
    ]);
    isTrusted = new FormControl(false);
    loginUrl = RO_LOGIN_FULL;
    countdown = 0;
    defaultError = DEFAULT_ERROR_MESSAGE;

    constructor() {
        setTitle('Xác thực tài khoản');
        this.startCountdown();
        this.store.dispatch(AuthActions.clearErrors());
    }

    onVerify(auth: any) {
        if (this.otp.invalid) {
            this.otp.markAsTouched();
            return;
        }
        const payload: UserVerifyPayload = {
            deviceId: getDeviceId(),
            email: auth.credentials.email || '',
            otp: this.otp.value || '',
            isTrusted: this.isTrusted.value || false,
            secret: auth.otpToken?.secret || ''
        };
        this.store.dispatch(AuthActions.twoFactorVerify({ payload }));
    }

    onReGetOtpToken(email: string) {
        if (this.countdown > 0) { return; }
        this.startCountdown();
        this.store.dispatch(AuthActions.loadOTPToken({ payload: { email } }));
    }

    onResend(email: string) {
        if (this.countdown > 0) { return; }
        this.startCountdown();
        this.store.dispatch(AuthActions.resendEmail({ payload: {
            email,
            deviceId: getDeviceId()
        }}));
    }

    private startCountdown() {
        this.countdown = 60;
        interval(1000)
            .pipe(take(60))
            .subscribe(_ => this.countdown--);
    }
}
