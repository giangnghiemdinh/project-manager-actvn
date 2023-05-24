import { Component, inject, ViewChild } from '@angular/core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { getDeviceId, setTitle } from '../../../common/utilities';
import { Store } from '@ngrx/store';
import { AuthActions, AuthState, selectAuthErrors } from '../../../common/stores';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from '../../../core-ui/components';
import { RO_FORGOT_PASS_FULL } from '../../../common/constants';
import { RecaptchaComponent, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { AsyncPipe, NgIf } from '@angular/common';
import { NoWhitespaceValidator } from '../../../common/validators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ NzInputModule, NzButtonModule, RouterLink, ReactiveFormsModule, RecaptchaFormsModule, RecaptchaModule, AsyncPipe, NgIf, FormErrorComponent ],
    templateUrl: './login.component.html',
})
export class LoginComponent {

    @ViewChild('recaptcha') recaptcha!: RecaptchaComponent;
    private readonly store = inject(Store<AuthState>);
    form = new FormGroup({
        email: new FormControl('', [ Validators.required, Validators.email ]),
        password: new FormControl('', [ Validators.required, NoWhitespaceValidator ]),
        recaptcha: new FormControl(null, Validators.required)
    });
    passwordVisible = false;
    forgotPassUrl = RO_FORGOT_PASS_FULL;
    errors$ = this.store.select(selectAuthErrors);

    constructor() {
        setTitle('Đăng nhập');
        this.store.dispatch(AuthActions.clearErrors());
    }

    onLogin() {
        const { value, valid } = this.form;
        if (!valid) {
            this.form.markAsTouched();
            return;
        }
        this.recaptcha?.reset();
        this.store.dispatch(AuthActions.login({
            payload: {
                email: value.email || '',
                password: value.password || '',
                deviceId: getDeviceId()
            }
        }));
    }
}
